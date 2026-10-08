const { cmd } = require('../command');

cmd({
    pattern: "ping",
    alias: ["pong", "speed"],
    desc: "Check bot speed.",
    category: "main",
    react: "🏎️",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {

        const start = Date.now();

        const loading = await conn.sendMessage(
            from,
            {
                text: `╔════════════════════╗
║     🏎️ 𝐒𝙿𝙴𝙴𝙳 𝐓𝙴𝚂𝚃
╠════════════════════╣
║
║  🔄 𝐌𝙴𝙰𝚂𝚄𝚁𝙸𝙽𝙶 𝐑𝙴𝚂𝙿𝙾𝙽𝚂𝙴
║
║  ▰▰▰▱▱▱▱▱▱▱
║
╚════════════════════╝`
            },
            { quoted: mek }
        );

        const ping = Date.now() - start;

        let bar;

        if (ping < 100) {
            bar = "▰▰▰▰▰▰▰▰▰▰";
        } else if (ping < 250) {
            bar = "▰▰▰▰▰▰▰▰▱▱";
        } else if (ping < 500) {
            bar = "▰▰▰▰▰▰▱▱▱▱";
        } else {
            bar = "▰▰▰▰▱▱▱▱▱▱";
        }

        const result = `╔════════════════════╗
║      🏁 𝐏𝙾𝙽𝙶 !
╠════════════════════╣
║
║  🍄 𝐑𝙴𝚂𝙿𝙾𝙽𝚂𝙴
║  ───────────────
║  🚀 ${ping} ms
║
║  📊 𝐏𝙴𝚁𝙵𝙾𝚁𝙼𝙰𝙽𝙲𝙴
║  ${bar}
║
║  🟢 𝐒𝚃𝙰𝚃𝚄𝚂 : 𝐎𝙽𝙻𝙸𝙽𝙴
║  🖤 𝐒𝚈𝚂𝚃𝙴𝙼 : 𝐀𝚅𝚃𝙸𝚅𝙴
║
╚════════════════════╝

       © 𝐃𝚃𝚉 𝐋𝚄𝙽𝚇𝚉 𝐌𝙳`;

        await conn.sendMessage(
            from,
            {
                text: result,
                edit: loading.key
            }
        );

    } catch (e) {
        console.error(e);
        reply(`❌ Error: ${e.message || e}`);
    }
});
