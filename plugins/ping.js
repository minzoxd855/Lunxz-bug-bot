const { cmd } = require('../command');

cmd({
    pattern: "ping",
    alias: ["speed", "pong"],
    desc: "Check bot response speed.",
    category: "main",
    react: "🏓",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {

        const start = Date.now();

        // Initial message
        const msg = await conn.sendMessage(
            from,
            {
                text: `╭━━━〔 𝐋𝚄𝙽𝚇𝚉 𝐌𝙳 〕━━━╮
┃
┃   ⚡ 𝑷𝑰𝑵𝑮 𝑻𝑬𝑺𝑻
┃
┃   ⏳ 𝑪𝒉𝒆𝒄𝒌𝒊𝒏𝒈 𝒔𝒑𝒆𝒆𝒅...
┃
╰━━━━━━━━━━━━━━━━━━╯`
            },
            { quoted: mek }
        );

        // Calculate response time
        const ping = Date.now() - start;

        let status;
        let emoji;

        if (ping < 100) {
            status = "𝑬𝒙𝒄𝒆𝒍𝒍𝒆𝒏𝒕";
            emoji = "🟢";
        } else if (ping < 300) {
            status = "𝑭𝒂𝒔𝒕";
            emoji = "🟢";
        } else if (ping < 600) {
            status = "𝑮𝒐𝒐𝒅";
            emoji = "🟡";
        } else {
            status = "𝑺𝒍𝒐𝒘";
            emoji = "🔴";
        }

        const result = `╭━━━〔 𝐋𝚄𝙽𝚇𝚉 𝐌𝙳 〕━━━╮
┃
┃   ⚡ 𝑷𝑶𝑵𝑮 !
┃
┃   🚀 𝑺𝒑𝒆𝒆𝒅   : ${ping} ms
┃   ${emoji} 𝑺𝒕𝒂𝒕𝒖𝒔  : ${status}
┃   🤖 𝑩𝒐𝒕     : 𝑶𝒏𝒍𝒊𝒏𝒆
┃
╰━━━━━━━━━━━━━━━━━━╯

> 𝐋𝚄𝙽𝚇𝚉 𝐌𝙳 🖤
> ⚡ 𝑭𝒂𝒔𝒕 • 𝑺𝒎𝒐𝒐𝒕𝒉 • 𝑨𝒄𝒕𝒊𝒗𝒆`;

        // Edit previous message
        await conn.sendMessage(
            from,
            {
                text: result,
                edit: msg.key
            }
        );

    } catch (e) {
        console.error(e);
        reply(`❌ Ping Error!\n\n${e.message || e}`);
    }
});
