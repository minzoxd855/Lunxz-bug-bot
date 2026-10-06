const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "settings",
    alias: ["setting", "st", "dtec", "panel"],
    react: "📍",
    desc: "Open bot settings panel.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, pushname, prefix, isOwner, reply }) => {
    try {
        if (!isOwner) {
            return await reply(`*_• ඔයාට \`Lunxz Md\` වැඩ කරන්නෙ නැ_`);
        }

        const alwaysOffline =
            String(config.ALWAYS_OFFLINE) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const alwaysOnline =
            String(config.ALWAYS_ONLINE) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const autoViewStatus =
            String(config.AUTO_READ_STATUS) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const autoLikeStatus =
            String(config.AUTO_LIKE_STATUS) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const autoRecording =
            String(config.AUTO_RECORDING) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const autoTyping =
            String(config.AUTO_TYPING) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const autoReact =
            String(config.AUTO_REACT) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const antiBot =
            String(config.ANTI_BOT) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const antiBad =
            String(config.ANTI_BAD) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const antiLink =
            String(config.ANTI_LINK) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const readCmdOnly =
            String(config.READ_CMD_ONLY) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const autoRead =
            String(config.AUTO_READ) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const autoBio =
            String(config.AUTO_BIO) === 'true'
                ? '✅ 𝙾𝙽'
                : '❌ 𝙾𝙵𝙵';

        const workType = config.WORK_TYPE || 'public';

        const settingsText = `
*╭────────────────┈⊷*
*┋•* \`ᴀʟᴡᴀʏꜱ ᴏꜰꜰʟɪɴᴇ\` : *${alwaysOffline}*
*┋•* \`ᴀʟᴡᴀʏꜱ ᴏɴʟɪɴᴇ\` : *${alwaysOnline}*
*┋•* \`ᴀᴜᴛᴏ ꜱᴇᴇɴ ꜱᴛᴀᴛᴜꜱ\` : *${autoViewStatus}*
*┋•* \`ᴀᴜᴛᴏ ʟɪᴋᴇ ꜱᴛᴀᴛᴜꜱ\` : *${autoLikeStatus}*
*┋•* \`ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ\` : *${autoRecording}*
*┋•* \`ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ\` : *${autoTyping}*
*┋•* \`ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ\` : *${autoReact}*
*┋•* \`ᴀɴᴛɪ ʙᴏᴛ\` : *${antiBot}*
*┋•* \`ᴀɴᴛɪ ʙᴀᴅ\` : *${antiBad}*
*┋•* \`ᴀɴᴛɪ ʟɪɴᴋ\` : *${antiLink}*
*┋•* \`ʀᴇᴀᴅ ᴄᴍᴅ ᴏɴʟʏ\` : *${readCmdOnly}*
*┋•* \`ᴀᴜᴛᴏ ʀᴇᴀᴅ\` : *${autoRead}*
*┋•* \`ᴀᴜᴛᴏ ʙɪᴏ\` : *${autoBio}*
*┋•* \`ᴡᴏʀᴋ ᴛʏᴘᴇ\` : *${workType.toUpperCase()}*
*╰─────────────────┈⊷*

╭━━━〔 *ʀᴇᴘʟʏ ɴᴜᴍʙᴇʀ ᴛᴏ ᴄʜᴀɴɢᴇ* 〕━━━┈⊷
┃ 1️⃣ | ᴀʟᴡᴀʏs ᴏғғʟɪɴᴇ ᴏɴ/ᴏғғ
┃ 2️⃣ | ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ ᴏɴ/ᴏғғ
┃ 3️⃣ | ᴀᴜᴛᴏ sᴇᴇɴ sᴛᴀᴛᴜs ᴏɴ/ᴏғғ
┃ 4️⃣ | ᴀᴜᴛᴏ ʟɪᴋᴇ sᴛᴀᴛᴜs ᴏɴ/ᴏғғ
┃ 5️⃣ | ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ ᴏɴ/ᴏғғ
┃ 6️⃣ | ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ ᴏɴ/ᴏғғ
┃ 7️⃣ | ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ ᴏɴ/ᴏғғ
┃ 8️⃣ | ᴀɴᴛɪ ʙᴏᴛ ᴏɴ/ᴏғғ
┃ 9️⃣ | ᴀɴᴛɪ ʙᴀᴅ ᴏɴ/ᴏғғ
┃ 🔟 | ᴀɴᴛɪ ʟɪɴᴋ ᴏɴ/ᴏғғ
┃ 1️⃣1️⃣ | ʀᴇᴀᴅ ᴄᴍᴅ ᴏɴʟʏ ᴏɴ/ᴏғғ
┃ 1️⃣2️⃣ | ᴀᴜᴛᴏ ʀᴇᴀᴅ ᴏɴ/ᴏғғ
┃ 1️⃣3️⃣ | ᴀᴜᴛᴏ ʙɪᴏ ᴏɴ/ᴏғғ
┃ 1️⃣4️⃣ | ᴄʜᴀɴɢᴇ ᴡᴏʀᴋ ᴛʏᴘᴇ
╰━━━━━━━━━━━━━━━━━━━━┈⊷
`;

        // Send menu as TEXT first.
        // This avoids remote-image failures preventing the menu.
        const sentMsg = await conn.sendMessage(
            from,
            {
                text: settingsText
            },
            {
                quoted: mek
            }
        );

        // Number mapping
        global.numberStore = global.numberStore || {};

        global.numberStore[sentMsg.key.id] = {
            "1": "toggle_alwaysoffline",
            "2": "toggle_alwaysonline",
            "3": "toggle_autoviewstatus",
            "4": "toggle_autolikestatus",
            "5": "toggle_autorecording",
            "6": "toggle_autotyping",
            "7": "toggle_autoreact",
            "8": "toggle_antibot",
            "9": "toggle_antibad",
            "10": "toggle_antilink",
            "11": "toggle_readcmdonly",
            "12": "toggle_autoread",
            "13": "toggle_autobio",
            "14": "toggle_worktype"
        };

        console.log(`[SETTINGS] Menu sent: ${sentMsg.key.id}`);

    } catch (e) {
        console.error("[SETTINGS ERROR]", e);

        try {
            await reply(
                `❌ *Settings Error!*\n\n` +
                `\`\`\`${e.message || e}\`\`\``
            );
        } catch (err) {
            console.error("[SETTINGS REPLY ERROR]", err);
        }
    }
});


/* =========================================================
   CONFIG UPDATE FUNCTION
========================================================= */

const updateConfig = async (key, val, reply) => {
    config[key] = val;

    await reply(
        `✅ *${key}* has been set to *${String(val).toUpperCase()}*`
    );
};


/* =========================================================
   ALWAYS OFFLINE
========================================================= */

cmd({
    pattern: "toggle_alwaysoffline",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.ALWAYS_OFFLINE) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'ALWAYS_OFFLINE',
        newVal,
        reply
    );
});


/* =========================================================
   ALWAYS ONLINE
========================================================= */

cmd({
    pattern: "toggle_alwaysonline",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.ALWAYS_ONLINE) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'ALWAYS_ONLINE',
        newVal,
        reply
    );
});


/* =========================================================
   AUTO VIEW STATUS
========================================================= */

cmd({
    pattern: "toggle_autoviewstatus",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.AUTO_READ_STATUS) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'AUTO_READ_STATUS',
        newVal,
        reply
    );
});


/* =========================================================
   AUTO LIKE STATUS
========================================================= */

cmd({
    pattern: "toggle_autolikestatus",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.AUTO_LIKE_STATUS) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'AUTO_LIKE_STATUS',
        newVal,
        reply
    );
});


/* =========================================================
   AUTO RECORDING
========================================================= */

cmd({
    pattern: "toggle_autorecording",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.AUTO_RECORDING) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'AUTO_RECORDING',
        newVal,
        reply
    );
});


/* =========================================================
   AUTO TYPING
========================================================= */

cmd({
    pattern: "toggle_autotyping",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.AUTO_TYPING) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'AUTO_TYPING',
        newVal,
        reply
    );
});


/* =========================================================
   AUTO REACT
========================================================= */

cmd({
    pattern: "toggle_autoreact",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.AUTO_REACT) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'AUTO_REACT',
        newVal,
        reply
    );
});


/* =========================================================
   ANTI BOT
========================================================= */

cmd({
    pattern: "toggle_antibot",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.ANTI_BOT) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'ANTI_BOT',
        newVal,
        reply
    );
});


/* =========================================================
   ANTI BAD
========================================================= */

cmd({
    pattern: "toggle_antibad",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.ANTI_BAD) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'ANTI_BAD',
        newVal,
        reply
    );
});


/* =========================================================
   ANTI LINK
========================================================= */

cmd({
    pattern: "toggle_antilink",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.ANTI_LINK) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'ANTI_LINK',
        newVal,
        reply
    );
});


/* =========================================================
   READ COMMAND ONLY
========================================================= */

cmd({
    pattern: "toggle_readcmdonly",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.READ_CMD_ONLY) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'READ_CMD_ONLY',
        newVal,
        reply
    );
});


/* =========================================================
   AUTO READ
========================================================= */

cmd({
    pattern: "toggle_autoread",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.AUTO_READ) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'AUTO_READ',
        newVal,
        reply
    );
});


/* =========================================================
   AUTO BIO
========================================================= */

cmd({
    pattern: "toggle_autobio",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const newVal =
        String(config.AUTO_BIO) === 'true'
            ? 'false'
            : 'true';

    await updateConfig(
        'AUTO_BIO',
        newVal,
        reply
    );
});


/* =========================================================
   WORK TYPE
========================================================= */

cmd({
    pattern: "toggle_worktype",
    dontAddCommandList: true,
    filename: __filename
},
async (conn, mek, m, { isOwner, reply }) => {

    if (!isOwner) return;

    const currentMode =
        String(config.WORK_TYPE || 'public').toLowerCase();

    let newMode;

    if (currentMode === 'public') {
        newMode = 'private';
    } else if (currentMode === 'private') {
        newMode = 'inbox';
    } else if (currentMode === 'inbox') {
        newMode = 'groups';
    } else {
        newMode = 'public';
    }

    await updateConfig(
        'WORK_TYPE',
        newMode,
        reply
    );
});