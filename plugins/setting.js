const { cmd } = require('../command');
const fs = require('fs');
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
            return await reply(`*_• ඔයාට \`Lunxz Md\` වැඩ කරන්නෙ නැ`);
        }
        let alwaysOffline = String(config.ALWAYS_OFFLINE) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let alwaysOnline = String(config.ALWAYS_ONLINE) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let autoViewStatus = String(config.AUTO_READ_STATUS) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let autoLikeStatus = String(config.AUTO_LIKE_STATUS) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let autoRecording = String(config.AUTO_RECORDING) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let autoTyping = String(config.AUTO_TYPING) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let autoReact = String(config.AUTO_REACT) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let antiBot = String(config.ANTI_BOT) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let antiBad = String(config.ANTI_BAD) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let antiLink = String(config.ANTI_LINK) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let readCmdOnly = String(config.READ_CMD_ONLY) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let autoRead = String(config.AUTO_READ) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let autoBio = String(config.AUTO_BIO) === 'true' ? '✅ 𝙾𝙽' : '❌ 𝙾𝙵𝙵';
        let workType = config.WORK_TYPE || 'public';

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
┃ 1️⃣4️⃣ | ᴄʜᴀɴɢᴇ ᴡᴏʀᴋ ᴛʏᴘᴇ (ᴘᴜʙ/ᴘʀɪ/ɢʀᴘ/ɪɴʙ)
╰━━━━━━━━━━━━━━━━━━━━┈⊷
`;

        const sentMsg = await conn.sendMessage(from, {
            image: { url: "https://database.ominisave.store/image/OMINISAVE_1791425415155_UM6Z5T.jpg" },
            caption: settingsText
        }, { quoted: mek });
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

    } catch (e) {
        console.log(e);
        reply(`*❌ Error occurred!*\n\n${e}`);
    }
});

const updateConfig = (key, val, reply) => {
    config[key] = val;
    reply(`✅ *${key}* has been set to *${val.toString().toUpperCase()}*`);
};

cmd({ pattern: "toggle_alwaysoffline", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.ALWAYS_OFFLINE) === 'true' ? 'false' : 'true';
    updateConfig('ALWAYS_OFFLINE', newVal, reply);
});

cmd({ pattern: "toggle_alwaysonline", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.ALWAYS_ONLINE) === 'true' ? 'false' : 'true';
    updateConfig('ALWAYS_ONLINE', newVal, reply);
});

cmd({ pattern: "toggle_autoviewstatus", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.AUTO_READ_STATUS) === 'true' ? 'false' : 'true';
    updateConfig('AUTO_READ_STATUS', newVal, reply);
});

cmd({ pattern: "toggle_autolikestatus", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.AUTO_LIKE_STATUS) === 'true' ? 'false' : 'true';
    updateConfig('AUTO_LIKE_STATUS', newVal, reply);
});

cmd({ pattern: "toggle_autorecording", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.AUTO_RECORDING) === 'true' ? 'false' : 'true';
    updateConfig('AUTO_RECORDING', newVal, reply);
});

cmd({ pattern: "toggle_autotyping", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.AUTO_TYPING) === 'true' ? 'false' : 'true';
    updateConfig('AUTO_TYPING', newVal, reply);
});

cmd({ pattern: "toggle_autoreact", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.AUTO_REACT) === 'true' ? 'false' : 'true';
    updateConfig('AUTO_REACT', newVal, reply);
});

cmd({ pattern: "toggle_antibot", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.ANTI_BOT) === 'true' ? 'false' : 'true';
    updateConfig('ANTI_BOT', newVal, reply);
});

cmd({ pattern: "toggle_antibad", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.ANTI_BAD) === 'true' ? 'false' : 'true';
    updateConfig('ANTI_BAD', newVal, reply);
});

cmd({ pattern: "toggle_antilink", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.ANTI_LINK) === 'true' ? 'false' : 'true';
    updateConfig('ANTI_LINK', newVal, reply);
});

cmd({ pattern: "toggle_readcmdonly", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.READ_CMD_ONLY) === 'true' ? 'false' : 'true';
    updateConfig('READ_CMD_ONLY', newVal, reply);
});

cmd({ pattern: "toggle_autoread", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.AUTO_READ) === 'true' ? 'false' : 'true';
    updateConfig('AUTO_READ', newVal, reply);
});

cmd({ pattern: "toggle_autobio", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    const newVal = String(config.AUTO_BIO) === 'true' ? 'false' : 'true';
    updateConfig('AUTO_BIO', newVal, reply);
});

cmd({ pattern: "toggle_worktype", dontAddCommandList: true, filename: __filename },
async (conn, mek, m, { isOwner, reply }) => {
    if (!isOwner) return;
    
    // Work Type Cycle Logic (public -> private -> inbox -> groups -> public)
    let currentMode = config.WORK_TYPE || 'public';
    let newMode = 'public';
    
    if (currentMode === 'public') newMode = 'private';
    else if (currentMode === 'private') newMode = 'inbox';
    else if (currentMode === 'inbox') newMode = 'groups';
    else if (currentMode === 'groups') newMode = 'public';

    updateConfig('WORK_TYPE', newMode, reply);
});
