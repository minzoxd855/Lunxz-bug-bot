const { cmd, commands } = require('../command'); 
const os = require('os');
const moment = require('moment-timezone');

const botLogo = "https://database.ominisave.store/image/OMINISAVE_1791425415155_UM6Z5T.jpg";

const logoTypes = [
    "neon","neon2","fire2","glitch","hacker","futuristic","thunder","devil",
    "fire","ice","snow","lava","metal","gold","silver","glossy","blackpink",
    "transformer","horror","blood","joker","galaxy","space","cloud","sand",
    "stone","magma","gradient","light","paper","watercolor","candy","christmas",
    "luxury","leaf","summer","circuit","block3d","cartoon","chrome","frozen"
];

const channelLink = "https://whatsapp.com/channel/0029Vb9AES22v1InbVboMm0A";

// Newsletter Context Header Setup
const newsletterContext = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: "120363430496766968@newsletter",
        newsletterName: "𝑳𝒖𝒏𝒙𝒛 𝑴𝒅 🍒!",
        serverMessageId: 1
    }
};


// ===============================
// MAIN MENU
// ===============================

cmd({
    pattern: "menu",
    alias: ["panel", "list", "commands"],
    desc: "Show main menu.",
    category: "main",
    react: "⚡",
    filename: __filename
},
async (conn, mek, m, { from, pushname, prefix, reply }) => {
    try {

        let hostname = os.hostname();

        if (hostname.length === 12)
            hostname = '𝑹𝒆𝒑𝒍𝒊𝒕';
        else if (hostname.length === 36)
            hostname = '𝑯𝒆𝒓𝒐𝒌𝒖';
        else if (hostname.length === 8)
            hostname = '𝑲𝒐𝒚𝒆𝒃';
        else
            hostname = '𝑽𝑷𝑺 / 𝑳𝒐𝒄𝒂𝒍';


        // RAM
        const ramUsed = (
            process.memoryUsage().heapUsed / 1024 / 1024
        ).toFixed(2);

        const ramTotal = Math.round(
            os.totalmem() / 1024 / 1024
        );

        const ramUsage = `${ramUsed}𝑴𝑩 / ${ramTotal}𝑴𝑩`;


        // UPTIME
        const uptimeSeconds = process.uptime();

        const uptimeHours = Math.floor(
            uptimeSeconds / 3600
        );

        const uptimeMinutes = Math.floor(
            (uptimeSeconds % 3600) / 60
        );

        const rtime = `${uptimeHours}𝒉 ${uptimeMinutes}𝒎`;


        // GREETING
        const time = moment
            .tz('Asia/Colombo')
            .format('HH');

        let greeting = "𝑮𝒐𝒐𝒅 𝑵𝒊𝒈𝒉𝒕";

        if (time >= 4 && time < 12)
            greeting = "𝑮𝒐𝒐𝒅 𝑴𝒐𝒓𝒏𝒊𝒏𝒈";

        else if (time >= 12 && time < 17)
            greeting = "𝑮𝒐𝒐𝒅 𝑨𝒇𝒕𝒆𝒓𝒏𝒐𝒐𝒏";

        else if (time >= 17 && time < 20)
            greeting = "𝑮𝒐𝒐𝒅 𝑬𝒗𝒆𝒏𝒊𝒏𝒈";


        // MENU TEXT
        const menuText = `╭══════════════════════╮
║   🤍 *𝐋𝚄𝙽𝚇𝚉 𝐌𝙳* 🤍   ║
╰══════════════════════╯

│ *𝑯𝒊* ${pushname || '𝑼𝒔𝒆𝒓'}, *${greeting}!* 🌸
│
│ ◈ *📂 ᴠᴇʀꜱɪᴏɴ* : 1.0.0
│ ◈ *👑 ᴏᴡɴᴇʀ*   : ɴᴇɴᴢᴏ ( ᴍᴏᴅᴇ × )
│ ◈ *💾 ʀᴀᴍ*     : ${ramUsage}
│ ◈ *⏱️ ᴜᴘᴛɪᴍᴇ*  : ${rtime}
│ ◈ *🌐 ʜᴏꜱᴛ*    : ${hostname}

╰══════════════════════⟡

*#. ʀᴇᴘʟʏ ᴡɪᴛʜ ᴀ ɴᴜᴍʙᴇʀ ᴛᴏ ᴏᴘᴇɴ ᴍᴇɴᴜ 🦢*

*╭─────୨⋆⋅☆⋅⋆ৎ─────<𝟑*
*│ ➊ ➜ \`🏠 𝐌𝐚𝐢𝐧 𝐌𝐞𝐧𝐮\`*
*┊ ❷ ➜ \`👑 𝐎𝐰𝐧𝐞𝐫 𝐌𝐞𝐧𝐮\`*
*│ ❸ ➜ \`👥 𝐆𝐫𝐨𝐮𝐩 𝐌𝐞𝐧𝐮\`*
*┊ ❹ ➜ \`🎨 𝐋𝐨𝐠𝐨 𝐌𝐞𝐧𝐮\`*
*│ ❺ ➜ \`📦 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫𝐬\`*
*┊ ❻ ➜ \`🔍 𝐒𝐞𝐚𝐫𝐜𝐡 𝐌𝐞𝐧𝐮\`*
*│ ❼ ➜ \`🤖 𝐀𝐈 𝐌𝐞𝐧𝐮\`*
*┊ ❽ ➜ \`🛠️ 𝐎𝐭𝐡𝐞𝐫𝐬 𝐌𝐞𝐧𝐮\`*
*╰─────୨⋆⋅☆⋅⋆ৎ─────<𝟑*

> 📢 *𝑪𝒉𝒂𝒏𝒏𝒆𝒍:* ${channelLink}

> © *ʟᴜɴxᴢ ᴍᴅ ʙᴏᴛ ᴠ1 🦋*`;


        // GET IMAGE
        const imgBuffer = Buffer.from(
            await (await fetch(botLogo)).arrayBuffer()
        );


        // SEND MENU
        const sentMsg = await conn.sendMessage(
            from,
            {
                image: imgBuffer,
                caption: menuText,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );


        // STORE NUMBER MENU
        const msgId = sentMsg.key.id;

        global.numberStore = global.numberStore || {};

        global.numberStore[msgId] = {
            "1": "mainmenu",
            "2": "ownermenu",
            "3": "groupmenu",
            "4": "logomenu",
            "5": "downloadmenu",
            "6": "searchmenu",
            "7": "aimenu",
            "8": "othermenu"
        };


    } catch (e) {

        console.error(e);

        reply(
            `*❌ 𝑺𝒚𝒔𝒕𝒆𝒎 𝑬𝒓𝒓𝒐𝒓!*\n\n${e.message || e}`
        );

    }
});


// ===============================
// GENERATE SUB MENU
// ===============================

const generateSubMenu = async (
    conn,
    mek,
    from,
    category,
    title,
    pushname,
    reply
) => {

    try {

        let cmdList = '';

        if (commands && Array.isArray(commands)) {

            for (let i = 0; i < commands.length; i++) {

                if (
                    commands[i].category === category &&
                    !commands[i].dontAddCommandList
                ) {

                    cmdList +=
`│ 🔹 *${commands[i].pattern}*
│    _${commands[i].desc || '𝑵𝒐 𝑫𝒆𝒔𝒄𝒓𝒊𝒑𝒕𝒊𝒐𝒏'}_
│
`;

                }
            }
        }


        if (cmdList === '') {

            cmdList =
`│ ⚠️ *𝑵𝒐 𝒄𝒐𝒎𝒎𝒂𝒏𝒅𝒔 𝒇𝒐𝒖𝒏𝒅 𝒉𝒆𝒓𝒆.*
│
`;

        }


        const menuContent =
`╭══════════════════════╮
║   🦋 *${title}*   ║
╰══════════════════════╯
│
${cmdList}╰══════════════════════⟡

> 📢 *𝑪𝒉𝒂𝒏𝒏𝒆𝒍:* ${channelLink}

> © *𝐆𝐚𝐲𝐚𝐧 𝐌𝐝 🦋*`;


        const imgBuffer = Buffer.from(
            await (await fetch(botLogo)).arrayBuffer()
        );


        await conn.sendMessage(
            from,
            {
                image: imgBuffer,
                caption: menuContent,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );


    } catch (e) {

        console.error(e);

        reply(
            '*❌ 𝑺𝒖𝒃𝒎𝒆𝒏𝒖 𝑬𝒓𝒓𝒐𝒓 !!*'
        );

    }
};


// ===============================
// LOGO MENU
// ===============================

cmd({
    pattern: "logomenu",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {

    try {

        let logoList =
`╭══════════════════════╮
║   🎨 *𝐋𝐎𝐆𝐎 𝐌𝐀𝐊𝐄𝐑 𝐌𝐄𝐍𝐔*   ║
╰══════════════════════╯
│
`;


        logoTypes.forEach((type, index) => {

            const num = (index + 1)
                .toString()
                .padStart(2, '0');

            logoList +=
`│ [ ${num} ] ✦ ${type.toUpperCase()}
`;

        });


        logoList +=
`│
╰══════════════════════⟡

> _💡 𝑹𝒆𝒑𝒍𝒚 𝒘𝒊𝒕𝒉 𝒂 𝒏𝒖𝒎𝒃𝒆𝒓 𝒕𝒐 𝒈𝒆𝒏𝒆𝒓𝒂𝒕𝒆._
> _✨ 𝑪𝒖𝒔𝒕𝒐𝒎 𝑵𝒂𝒎𝒆: .𝒍𝒐𝒈𝒐 <𝒏𝒂𝒎𝒆>_

> 📢 *𝑪𝒉𝒂𝒏𝒏𝒆𝒍:* ${channelLink}

> © *𝐆𝐚𝐲𝐚𝐧 𝐌𝐝 🦋*`;


        const imgBuffer = Buffer.from(
            await (await fetch(botLogo)).arrayBuffer()
        );


        const sentMsg = await conn.sendMessage(
            from,
            {
                image: imgBuffer,
                caption: logoList,
                contextInfo: newsletterContext
            },
            { quoted: mek }
        );


        const msgId = sentMsg.key.id;

        global.numberStore = global.numberStore || {};

        global.numberStore[msgId] = {};


        logoTypes.forEach((type, index) => {

            global.numberStore[msgId][
                (index + 1).toString()
            ] = `genlogo ${type}&${pushname || '𝑼𝒔𝒆𝒓'}`;

        });


    } catch (e) {

        console.error(e);

        reply(
            '*❌ 𝑳𝒐𝒈𝒐 𝑴𝒆𝒏𝒖 𝑬𝒓𝒓𝒐𝒓!*'
        );

    }

});


// ===============================
// SUB MENU COMMANDS
// ===============================

cmd({
    pattern: "mainmenu",
    react: "🎀",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {

    await generateSubMenu(
        conn,
        mek,
        from,
        'main',
        '𝑴𝑨𝑰𝑵 𝑪𝑶𝑴𝑴𝑨𝑵𝑫𝑺',
        pushname,
        reply
    );

});


cmd({
    pattern: "ownermenu",
    react: "🙈",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {

    await generateSubMenu(
        conn,
        mek,
        from,
        'owner',
        '𝑶𝑾𝑵𝑬𝑹 𝑪𝑶𝑴𝑴𝑨𝑵𝑫𝑺',
        pushname,
        reply
    );

});


cmd({
    pattern: "groupmenu",
    react: "🧃",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {

    await generateSubMenu(
        conn,
        mek,
        from,
        'group',
        '𝑮𝑹𝑶𝑼𝑷 𝑪𝑶𝑴𝑴𝑨𝑵𝑫𝑺',
        pushname,
        reply
    );

});


cmd({
    pattern: "downloadmenu",
    react: "🫟",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {

    await generateSubMenu(
        conn,
        mek,
        from,
        'download',
        '𝑫𝑶𝑾𝑵𝑳𝑶𝑨𝑫𝑬𝑹𝑺',
        pushname,
        reply
    );

});


cmd({
    pattern: "searchmenu",
    react: "🥑",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {

    await generateSubMenu(
        conn,
        mek,
        from,
        'search',
        '𝑺𝑬𝑨𝑹𝑪𝑯 𝑻𝑶𝑶𝑳𝑺',
        pushname,
        reply
    );

});


cmd({
    pattern: "aimenu",
    react: "🩵",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {

    await generateSubMenu(
        conn,
        mek,
        from,
        'ai',
        '𝑨𝑰 𝑭𝑬𝑨𝑻𝑼𝑹𝑬𝑺',
        pushname,
        reply
    );

});


cmd({
    pattern: "othermenu",
    react: "🩷",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { from, pushname, reply }) => {

    await generateSubMenu(
        conn,
        mek,
        from,
        'other',
        '𝑶𝑻𝑯𝑬𝑹 𝑼𝑻𝑰𝑳𝑰𝑻𝑰𝑬𝑺',
        pushname,
        reply
    );

});
