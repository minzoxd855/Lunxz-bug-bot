"use strict";

const { cmd } = require("../command");

const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

cmd(
    {
        pattern: "Lunxz-cs",
        alias: ["scrash-test", "s-crash-test"],
        react: "🦈",
        desc: "test command.",
        category: "owner",
        use: ".sirimath-test [lines]",
        filename: __filename
    },

    async (
        conn,
        mek,
        m,
        {
            from,
            q,
            reply,
            isOwner
        }
    ) => {
        try {
            if (!isOwner) {
                return reply("❌ *Owner only command.*");
            }

            let count = parseInt(q);

            if (isNaN(count)) {
                count = 100;
            }

            count = Math.max(10, Math.min(count, 1000));

            const loading = await reply(
`╭━━━〔 ʟᴜɴxᴢ ᴄʀᴀꜱʜ 〕━━━╮
│
│ 🧪 *ꜱᴀꜰᴇ ᴛᴇꜱᴛ ᴍᴏᴅᴇ*
│
│ 📊 ʟɪɴᴇꜱ : ${count.toLocaleString()}
│
│ ⚠️ ᴛᴀʀɢᴇᴛ : ɴᴏɴᴇ
│
╰━━━━━━━━━━━━━━━━━━━━╯`
            );

            await sleep(700);

            await conn.sendMessage(
                from,
                {
                    text:
`🔄 *ɪɴɪᴛɪᴀʟɪᴢɪɴɢ...*

📊 ᴛᴇꜱᴛ ꜱɪᴢᴇ: ${count.toLocaleString()}`,
                    edit: loading.key
                }
            );

            await sleep(700);

            await conn.sendMessage(
                from,
                {
                    text:
`⚙️ *ʀᴜɴɴɪɴɢ ᴛᴇꜱᴛ...*

▰▰▰▰▱▱▱▱ 50%`,
                    edit: loading.key
                }
            );

            await sleep(700);

            await conn.sendMessage(
                from,
                {
                    text:
`⚙️ *Running test...*

▰▰▰▰▰▰▰▱ 90%`,
                    edit: loading.key
                }
            );

            await sleep(700);

            await conn.sendMessage(
                from,
                {
                    text:
`╭━━━〔 ✅ ʙᴜɢ ᴄᴏᴍᴩʟᴇᴛᴇ  〕━━━╮
│
│ 🧪 ᴍᴏᴅᴇ   : ꜱᴀꜰᴇ
│ 📊 ʟɪɴᴇꜱ  : ${count.toLocaleString()}
│ 🎯 ᴛᴀʀɢᴇᴛ : ɴᴏɴᴇ
│ 💥 ᴀᴛᴛᴀᴄᴋ : ᴅɪꜱᴀʙʟᴇᴅ
│
│ © ʟᴜɴxᴢᴢ ᴍᴅ ᴠ1
╰━━━━━━━━━━━━━━━━━━━━╯`,
                    edit: loading.key
                }
            );

            await conn.sendMessage(from, {
                react: {
                    text: "✅",
                    key: mek.key
                }
            });

        } catch (error) {
            console.error(
                "[SIRIMATH TEST ERROR]",
                error
            );

            return reply(
                `❌ *Test Error*\n\n${error.message || error}`
            );
        }
    }
);