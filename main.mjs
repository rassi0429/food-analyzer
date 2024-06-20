import OpenAI from 'openai';

import {Client, GatewayIntentBits} from 'discord.js';

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

// トークンをここに追加
const token = process.env['DISCORD_TOKEN'];
// 返信するDiscordのチャンネルID
const channel_id = "1248264062131765329"

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageCreate', async message => {
    // ボット自身のメッセージには反応しないようにする
    if (message.author.bot) return;

    if (message.channelId === channel_id) {
        // ファイルが添付されていて、それが画像の場合
        if (message.attachments.size > 0 && message.attachments.first().contentType?.startsWith("image")) {
            const url = message.attachments.first().url;
            const resp = await chat(url, message.content);
            await message.reply(resp);
        }
    }

});

client.login(token);


const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});


const chat = async (url, additionalInfo) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `この画像は何ですか？日本語で説明してください。最後に映ってる画像のカロリーを算出してください。TeXは使えないので、MarkDownで変身してください。食べ物の量は画像から算出し、画像全体のカロリーを計算してください。食べ物でなくても、想像で答えてください。食べ物であった場合はそのままカロリーを答えてください。 ${additionalInfo? "ユーザからの追加情報は以下の通りです。" + additionalInfo : ""}`
                    },
                    {
                        type: "image_url",
                        image_url: {
                            "url": url,
                        },
                    },
                ],
            },
        ],
    });
    console.log(response.choices[0]);
    return response.choices[0].message.content;
}