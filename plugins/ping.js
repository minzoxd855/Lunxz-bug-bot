const { cmd } = require('../command');

cmd({
    pattern: "ping",
    alias: ["pong", "speed"],
    desc: "Check bot response speed.",
    category: "main",
    react: "🍷",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const start = Date.now();

        const msg = await conn.sendMessage(
            from,
            {
                text: `╭━━━〔 𝐋𝚄𝙽𝚇𝚉 𝐌𝙳 𝐁𝙾𝚃 〕━━━╮
┃
┃        🏓 *𝐏𝐈𝐍𝐆...*
┃
┃        ⏳ 𝐂𝐡𝐞𝐜𝐤𝐢𝐧𝐠...
┃
╰━━━━━━━━━━━━━━━━━━╯`
            },
            { quoted: mek }
        );

        const ping = Date.now() - start;

        const result = `╭━━━〔 𝐋𝚄𝙽𝚇𝚉 𝐌𝙳 𝐁𝙾𝚃 〕━━━╮
┃
┃        🏓 *𝐏𝐎𝐍𝐆 !*
┃
┃   🚀 𝐒𝐩𝐞𝐞𝐝 : *${ping} ms*
┃   🟢 𝐒𝐭𝐚𝐭𝐮𝐬 : *𝐎𝐧𝐥𝐢𝐧𝐞*
┃
╰━━━━━━━━━━━━━━━━━━╯

        ✨ *𝐅𝐚𝐬𝐭 & 𝐀𝐜𝐭𝐢𝐯𝐞* ✨`;

        await conn.sendMessage(
            from,
            {
                text: result,
                edit: msg.key
            }
        );

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message || e}`);
    }
});
