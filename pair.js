const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const config = require('./config');
const axios = require('axios');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Jimp = require('jimp');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getContentType,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = require('@whiskeysockets/baileys');

const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    fetchJson
} = require('./lib/functions');

const { sms } = require('./lib/msg');
const NodeCache = require('node-cache');
const util = require('util');

const app = express();

const PORT = process.env.PORT || 3000;
const SESSION_BASE_PATH = './sessions';

const msgRetryCounterCache = new NodeCache({
    stdTTL: 300,
    checkperiod: 60,
    useClones: false
});

const userConfigCache = new NodeCache({
    stdTTL: 30,
    checkperiod: 60,
    useClones: false
});

const newsletterConfigCache = new NodeCache({
    stdTTL: 60,
    checkperiod: 120,
    useClones: false
});

require('events').EventEmitter.defaultMaxListeners = 500;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/* =========================================================
   MONGODB
========================================================= */

const MONGODB_URI =
    process.env.MONGODB_URI ||
    'mongodb+srv://cloud25588_db_user:RQxEbZhj74uGOtb4@cluster0.pptbqdr.mongodb.net/dtztfmkuck012?appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('𝐌ᴏɴɢᴏ𝐃𝐁 𝐂ᴏɴɴᴇᴄᴛᴇᴅ ✅');
    })
    .catch(err => {
        console.log('❌ 𝐌ᴏɴɢᴏ𝐃𝐁 ᴇʀʀᴏʀ:', err);
    });

const SessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        unique: true,
        index: true
    },
    data: Object
});

const Session = mongoose.model('dtec', SessionSchema);

const UserConfigSchema = new mongoose.Schema({
    number: {
        type: String,
        unique: true,
        index: true
    },
    config: Object,
    updatedAt: Date
});

const UserConfigModel = mongoose.model(
    'UserConfig',
    UserConfigSchema
);

const NewsletterReactSchema = new mongoose.Schema({
    jid: {
        type: String,
        unique: true,
        index: true
    },
    emojis: Array,
    addedAt: Date
});

const NewsletterReactModel = mongoose.model(
    'NewsletterReact',
    NewsletterReactSchema
);

/* =========================================================
   USER CONFIG
========================================================= */

async function setUserConfigInMongo(number, conf) {
    try {
        const sanitized = String(number).replace(/[^0-9]/g, '');

        await UserConfigModel.findOneAndUpdate(
            { number: sanitized },
            {
                number: sanitized,
                config: conf,
                updatedAt: new Date()
            },
            {
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        userConfigCache.set(sanitized, conf);
    } catch (e) {
        console.error(
            'setUserConfigInMongo Error:',
            e.message
        );
    }
}

async function loadUserConfigFromMongo(number) {
    try {
        const sanitized = String(number).replace(
            /[^0-9]/g,
            ''
        );

        const cached = userConfigCache.get(sanitized);

        if (cached !== undefined) {
            return cached;
        }

        const doc = await UserConfigModel
            .findOne({ number: sanitized })
            .lean();

        const result = doc ? doc.config : null;

        userConfigCache.set(sanitized, result);

        return result;
    } catch (e) {
        console.error(
            'loadUserConfigFromMongo Error:',
            e.message
        );

        return null;
    }
}

/* =========================================================
   NEWSLETTER REACT
========================================================= */

async function addNewsletterReactConfig(
    jid,
    emojis = []
) {
    try {
        await NewsletterReactModel.findOneAndUpdate(
            { jid },
            {
                jid,
                emojis,
                addedAt: new Date()
            },
            {
                upsert: true
            }
        );

        newsletterConfigCache.del('all');

        console.log(
            `Added react-config for ${jid}`
        );
    } catch (e) {
        console.error(
            'addNewsletterReactConfig:',
            e.message
        );
    }
}

async function listNewsletterReactsFromMongo() {
    try {
        const cached =
            newsletterConfigCache.get('all');

        if (cached !== undefined) {
            return cached;
        }

        const docs = await NewsletterReactModel
            .find({})
            .lean();

        const result = docs.map(d => ({
            jid: d.jid,
            emojis: Array.isArray(d.emojis)
                ? d.emojis
                : []
        }));

        newsletterConfigCache.set(
            'all',
            result
        );

        return result;
    } catch (e) {
        console.error(
            'listNewsletterReactsFromMongo:',
            e.message
        );

        return [];
    }
}

/* =========================================================
   BASIC FUNCTIONS
========================================================= */

const BOT_NAME_FANCY =
    config.BOT_NAME || 'DTEC MINI V3';

function formatMessage(
    title,
    content,
    footer
) {
    return `*${title}*\n\n${content}\n\n> *${footer}*`;
}

function generateOTP() {
    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();
}

function getSriLankaTimestamp() {
    return moment()
        .tz('Asia/Colombo')
        .format('YYYY-MM-DD HH:mm:ss');
}

async function resize(
    image,
    width,
    height
) {
    const oyy = await Jimp.read(image);

    return await oyy
        .resize(width, height)
        .getBufferAsync(Jimp.MIME_JPEG);
}

/* =========================================================
   LOAD PLUGINS
========================================================= */

if (fs.existsSync('./plugins/')) {
    fs.readdirSync('./plugins/').forEach(
        plugin => {
            if (
                path.extname(plugin).toLowerCase() ===
                '.js'
            ) {
                try {
                    require(
                        './plugins/' + plugin
                    );
                } catch (e) {
                    console.error(
                        `Plugin Load Error [${plugin}]:`,
                        e.message
                    );
                }
            }
        }
    );
}

console.log(
    '𝐀ʟʟ 𝐏ʟᴜɢɪɴꜱ 𝐈ɴꜱᴛᴀʟʟᴇᴅ ⚡'
);

/* =========================================================
   COMMAND SYSTEM
========================================================= */

const events = require('./command');

const commandMap = new Map();

for (const cmd of events.commands) {
    if (cmd.pattern) {
        commandMap.set(
            cmd.pattern.toLowerCase(),
            cmd
        );
    }

    if (Array.isArray(cmd.alias)) {
        for (const alias of cmd.alias) {
            if (!commandMap.has(alias.toLowerCase())) {
                commandMap.set(
                    alias.toLowerCase(),
                    cmd
                );
            }
        }
    }
}

/* =========================================================
   EXPRESS
========================================================= */

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);

/* =========================================================
   SOCKET STORAGE
========================================================= */

const activeSockets = {};
const keepAliveTimers = {};
const reconnectTimers = {};
const fileCache = {};
const saveDebounceTimers = {};

let baileysVersionPromise = null;

/* =========================================================
   BAILEYS VERSION CACHE
========================================================= */

async function getBaileysVersion() {
    if (!baileysVersionPromise) {
        baileysVersionPromise =
            fetchLatestBaileysVersion()
                .then(result => result.version)
                .catch(err => {
                    baileysVersionPromise = null;
                    throw err;
                });
    }

    return await baileysVersionPromise;
}

/* =========================================================
   CLEANUP
========================================================= */

function cleanupSession(sessionId) {
    try {
        if (
            keepAliveTimers[sessionId]
        ) {
            clearInterval(
                keepAliveTimers[sessionId]
            );
        }

        if (
            reconnectTimers[sessionId]
        ) {
            clearTimeout(
                reconnectTimers[sessionId]
            );
        }

        if (
            saveDebounceTimers[sessionId]
        ) {
            clearTimeout(
                saveDebounceTimers[sessionId]
            );
        }

        delete keepAliveTimers[sessionId];
        delete reconnectTimers[sessionId];
        delete saveDebounceTimers[sessionId];

        const sock =
            activeSockets[sessionId];

        if (sock) {
            try {
                sock.ev.removeAllListeners();

                if (sock.ws) {
                    sock.ws.terminate?.();
                }
            } catch (e) {}
        }

        delete activeSockets[sessionId];
    } catch (e) {}
}

/* =========================================================
   RESTORE SESSION
========================================================= */

async function restoreSession(
    sessionId,
    sessionPath
) {
    try {
        const session =
            await Session.findOne({
                sessionId
            }).lean();

        if (
            !session ||
            !session.data
        ) {
            return false;
        }

        await fs.ensureDir(
            sessionPath
        );

        for (
            const relativeFile of
            Object.keys(session.data)
        ) {
            try {
                const filePath =
                    path.join(
                        sessionPath,
                        relativeFile
                    );

                await fs.ensureDir(
                    path.dirname(filePath)
                );

                await fs.writeFile(
                    filePath,
                    session.data[
                        relativeFile
                    ],
                    'utf8'
                );
            } catch (e) {
                console.error(
                    `Restore file error [${relativeFile}]:`,
                    e.message
                );
            }
        }

        console.log(
            '✅ 𝐑ᴇꜱᴛᴏʀᴇ 𝐒ᴜᴄᴄᴇꜱꜱ:',
            sessionId
        );

        return true;
    } catch (err) {
        console.error(
            'Restore Session Error:',
            err.message
        );

        return false;
    }
}

/* =========================================================
   READ ALL SESSION FILES
========================================================= */

async function getSessionFiles(
    dir,
    baseDir = dir
) {
    const result = {};

    const entries =
        await fs.readdir(
            dir,
            {
                withFileTypes: true
            }
        );

    for (const entry of entries) {
        const fullPath =
            path.join(
                dir,
                entry.name
            );

        const relativePath =
            path.relative(
                baseDir,
                fullPath
            );

        if (entry.isDirectory()) {
            const nested =
                await getSessionFiles(
                    fullPath,
                    baseDir
                );

            Object.assign(
                result,
                nested
            );
        } else {
            try {
                result[relativePath] =
                    await fs.readFile(
                        fullPath,
                        'utf8'
                    );
            } catch (e) {}
        }
    }

    return result;
}

/* =========================================================
   SAVE SESSION
========================================================= */

async function saveSession(
    sessionId,
    sessionPath
) {
    try {
        if (
            !(await fs.pathExists(
                sessionPath
            ))
        ) {
            return;
        }

        const data =
            await getSessionFiles(
                sessionPath
            );

        let hasChanges = false;

        for (
            const file of Object.keys(data)
        ) {
            const cacheKey =
                `${sessionId}:${file}`;

            if (
                fileCache[cacheKey] !==
                data[file]
            ) {
                fileCache[cacheKey] =
                    data[file];

                hasChanges = true;
            }
        }

        if (!hasChanges) {
            return;
        }

        await Session.findOneAndUpdate(
            { sessionId },
            {
                sessionId,
                data
            },
            {
                upsert: true
            }
        );
    } catch (err) {
        console.error(
            `Session Save Error [${sessionId}]:`,
            err.message
        );
    }
}

/* =========================================================
   DEBOUNCED SAVE
========================================================= */

function debouncedSaveSession(
    sessionId,
    sessionPath
) {
    if (
        saveDebounceTimers[sessionId]
    ) {
        clearTimeout(
            saveDebounceTimers[sessionId]
        );
    }

    saveDebounceTimers[sessionId] =
        setTimeout(
            async () => {
                delete saveDebounceTimers[
                    sessionId
                ];

                await saveSession(
                    sessionId,
                    sessionPath
                );
            },
            5000
        );
}

/* =========================================================
   STATUS HANDLER
========================================================= */

async function setupStatusHandlers(
    socket,
    sessionNumber
) {
    socket.ev.on(
        'messages.upsert',
        async ({ messages }) => {
            const message =
                messages[0];

            if (
                !message?.key ||
                message.key.remoteJid !==
                    'status@broadcast' ||
                !message.key.participant
            ) {
                return;
            }

            try {
                let userEmojis =
                    config.REACT_EMOJIS ||
                    ['❤️'];

                let autoViewStatus =
                    config.AUTO_READ_STATUS;

                let autoLikeStatus =
                    config.AUTO_REACT;

                let autoRecording =
                    config.AUTO_RECORDING;

                if (sessionNumber) {
                    const userConfig =
                        await loadUserConfigFromMongo(
                            sessionNumber
                        ) || {};

                    if (
                        Array.isArray(
                            userConfig.REACT_EMOJIS
                        ) &&
                        userConfig.REACT_EMOJIS
                            .length > 0
                    ) {
                        userEmojis =
                            userConfig.REACT_EMOJIS;
                    }

                    if (
                        userConfig.AUTO_VIEW_STATUS !==
                        undefined
                    ) {
                        autoViewStatus =
                            userConfig.AUTO_VIEW_STATUS;
                    }

                    if (
                        userConfig.AUTO_LIKE_STATUS !==
                        undefined
                    ) {
                        autoLikeStatus =
                            userConfig.AUTO_LIKE_STATUS;
                    }

                    if (
                        userConfig.AUTO_RECORDING !==
                        undefined
                    ) {
                        autoRecording =
                            userConfig.AUTO_RECORDING;
                    }
                }

                if (
                    autoRecording === 'true' ||
                    autoRecording === true
                ) {
                    await socket
                        .sendPresenceUpdate(
                            'recording',
                            message.key.remoteJid
                        )
                        .catch(() => {});
                }

                if (
                    autoViewStatus === 'true' ||
                    autoViewStatus === true
                ) {
                    await socket
                        .readMessages([
                            message.key
                        ])
                        .catch(() => {});
                }

                if (
                    autoLikeStatus === 'true' ||
                    autoLikeStatus === true
                ) {
                    const randomEmoji =
                        userEmojis[
                            Math.floor(
                                Math.random() *
                                userEmojis.length
                            )
                        ];

                    await socket
                        .sendMessage(
                            message.key.remoteJid,
                            {
                                react: {
                                    text:
                                        randomEmoji,
                                    key:
                                        message.key
                                }
                            },
                            {
                                statusJidList: [
                                    message.key.participant
                                ]
                            }
                        )
                        .catch(() => {});
                }
            } catch (error) {}
        }
    );
}

/* =========================================================
   NEWSLETTER HANDLER
========================================================= */

async function setupNewsletterHandlers(
    socket,
    sessionNumber
) {
    const rrPointers =
        new Map();

    socket.ev.on(
        'messages.upsert',
        async ({ messages }) => {
            const message =
                messages[0];

            if (!message?.key) {
                return;
            }

            const jid =
                message.key.remoteJid;

            if (
                !jid ||
                !jid.endsWith('@newsletter')
            ) {
                return;
            }

            try {
                const reactConfigs =
                    await listNewsletterReactsFromMongo();

                const reactMap =
                    new Map();

                for (
                    const r of reactConfigs
                ) {
                    reactMap.set(
                        r.jid,
                        r.emojis || []
                    );
                }

                if (
                    !reactMap.has(jid)
                ) {
                    return;
                }

                const emojis =
                    reactMap.get(jid) ||
                    ['❤️'];

                if (
                    emojis.length === 0
                ) {
                    return;
                }

                let idx =
                    rrPointers.get(jid) ||
                    0;

                const emoji =
                    emojis[
                        idx % emojis.length
                    ];

                rrPointers.set(
                    jid,
                    (idx + 1) %
                        emojis.length
                );

                const messageId =
                    message.newsletterServerId ||
                    message.key.id;

                if (!messageId) {
                    return;
                }

                await socket
                    .sendMessage(
                        jid,
                        {
                            react: {
                                text: emoji,
                                key: message.key
                            }
                        }
                    )
                    .catch(() => {});
            } catch (error) {}
        }
    );
}

/* =========================================================
   MESSAGE REVOCATION
========================================================= */

async function handleMessageRevocation(
    socket,
    number
) {
    socket.ev.on(
        'messages.delete',
        async ({ keys }) => {
            if (
                !keys ||
                keys.length === 0
            ) {
                return;
            }

            const messageKey =
                keys[0];

            const userJid =
                jidNormalizedUser(
                    socket.user.id
                );

            const deletionTime =
                getSriLankaTimestamp();

            const message =
                formatMessage(
                    '*🗑️ 𝐌𝙴𝚂𝚂𝙰𝙶𝙴 𝐃𝙴𝙻𝙴𝚃𝙴𝙳*',
                    `A message was deleted from your chat.\n*📋 𝐅𝚁𝙾𝙼:* ${messageKey.remoteJid}\n*🍁 𝐃𝙴𝙻𝙴𝚃𝙸𝙾𝙽 𝐓𝙸𝙼𝙴:* ${deletionTime}`,
                    BOT_NAME_FANCY
                );

            try {
                await socket.sendMessage(
                    userJid,
                    {
                        text: message
                    }
                );
            } catch (error) {}
        }
    );
}

/* =========================================================
   PAIR
========================================================= */

async function Pair(
    number,
    res = null
) {
    const xnumber =
        String(number).replace(
            /[^0-9]/g,
            ''
        );

    if (!xnumber) {
        if (
            res &&
            !res.headersSent
        ) {
            return res.json({
                error:
                    'Invalid number.'
            });
        }

        return;
    }

    const sessionId =
        `dina_${xnumber}`;

    const sessionPath =
        path.join(
            SESSION_BASE_PATH,
            sessionId
        );

    /* =====================================================
       PREVENT DUPLICATE SESSION
    ===================================================== */

    if (
        activeSockets[sessionId]
    ) {
        if (
            res &&
            !res.headersSent
        ) {
            return res.json({
                error:
                    'Session already active. Please wait.'
            });
        }

        return;
    }

    try {
        /* =================================================
           RESTORE OLD SESSION
        ================================================= */

        await restoreSession(
            sessionId,
            sessionPath
        );

        await fs.ensureDir(
            sessionPath
        );

        /* =================================================
           AUTH STATE
        ================================================= */

        const {
            state,
            saveCreds
        } =
            await useMultiFileAuthState(
                sessionPath
            );

        /* =================================================
           BAILEYS VERSION
        ================================================= */

        const version =
            await getBaileysVersion();

        const logger =
            pino({
                level: 'silent'
            });

        /* =================================================
           SOCKET
        ================================================= */

        const sock =
            makeWASocket({
                version,
                logger,

                auth: {
                    creds:
                        state.creds,

                    keys:
                        makeCacheableSignalKeyStore(
                            state.keys,
                            logger
                        )
                },

                printQRInTerminal:
                    false,

                generateHighQualityLinkPreview:
                    true,

                syncFullHistory:
                    false,

                connectTimeoutMs:
                    60000,

                defaultQueryTimeoutMs:
                    30000,

                keepAliveIntervalMs:
                    25000,

                msgRetryCounterCache
            });

        activeSockets[
            sessionId
        ] = sock;

        /* =================================================
           HANDLERS
        ================================================= */

        setupStatusHandlers(
            sock,
            xnumber
        );

        setupNewsletterHandlers(
            sock,
            xnumber
        );

        handleMessageRevocation(
            sock,
            xnumber
        );

        /* =================================================
           SEND FILE URL
        ================================================= */

        sock.sendFileUrl =
            async (
                jid,
                url,
                caption,
                quoted,
                options = {}
            ) => {
                try {
                    const r =
                        await axios.head(
                            url,
                            {
                                timeout:
                                    10000
                            }
                        ).catch(
                            () => null
                        );

                    if (!r) {
                        return;
                    }

                    const mime =
                        r.headers[
                            'content-type'
                        ] || '';

                    const buffer =
                        await getBuffer(
                            url
                        );

                    if (!buffer) {
                        return;
                    }

                    if (
                        mime.includes(
                            'gif'
                        )
                    ) {
                        return sock.sendMessage(
                            jid,
                            {
                                video:
                                    buffer,
                                caption,
                                gifPlayback:
                                    true,
                                ...options
                            },
                            {
                                quoted
                            }
                        );
                    }

                    if (
                        mime ===
                        'application/pdf'
                    ) {
                        return sock.sendMessage(
                            jid,
                            {
                                document:
                                    buffer,
                                mimetype:
                                    'application/pdf',
                                caption,
                                ...options
                            },
                            {
                                quoted
                            }
                        );
                    }

                    if (
                        mime.startsWith(
                            'image/'
                        )
                    ) {
                        return sock.sendMessage(
                            jid,
                            {
                                image:
                                    buffer,
                                caption,
                                ...options
                            },
                            {
                                quoted
                            }
                        );
                    }

                    if (
                        mime.startsWith(
                            'video/'
                        )
                    ) {
                        return sock.sendMessage(
                            jid,
                            {
                                video:
                                    buffer,
                                caption,
                                mimetype:
                                    'video/mp4',
                                ...options
                            },
                            {
                                quoted
                            }
                        );
                    }

                    if (
                        mime.startsWith(
                            'audio/'
                        )
                    ) {
                        return sock.sendMessage(
                            jid,
                            {
                                audio:
                                    buffer,
                                caption,
                                mimetype:
                                    'audio/mpeg',
                                ...options
                            },
                            {
                                quoted
                            }
                        );
                    }
                } catch (e) {
                    console.error(
                        'sendFileUrl Error:',
                        e.message
                    );
                }
            };

        /* =================================================
           PAIRING CODE
        ================================================= */

        let pairingCode =
            null;

        let responded =
            false;

        if (
            !sock.authState.creds.registered
        ) {
            try {
                /*
                 * Small delay is required for
                 * socket initialization.
                 */
                await delay(1200);

                pairingCode =
                    await sock.requestPairingCode(
                        xnumber
                    );

                console.log(
                    '🔑 Pairing Code:',
                    pairingCode
                );

                if (
                    res &&
                    !res.headersSent
                ) {
                    res.json({
                        code:
                            pairingCode
                    });

                    responded = true;
                }
            } catch (pairErr) {
                console.error(
                    'Pairing Code Error:',
                    pairErr.message
                );

                if (
                    res &&
                    !res.headersSent
                ) {
                    res.json({
                        error:
                            'Failed to generate pairing code. Try again.'
                    });

                    responded = true;
                }

                cleanupSession(
                    sessionId
                );

                return;
            }
        } else {
            console.log(
                'Already registered:',
                sessionId
            );

            /*
             * If restoring an already registered
             * session, don't return here.
             * The socket must continue connecting.
             */
        }

        if (
            res &&
            !responded
        ) {
            setTimeout(
                () => {
                    if (
                        !res.headersSent
                    ) {
                        res.json({
                            error:
                                'Pairing timed out. Try again.'
                        });
                    }
                },
                20000
            );
        }

        /* =================================================
           CREDENTIAL SAVE
        ================================================= */

        sock.ev.on(
            'creds.update',
            async () => {
                try {
                    await saveCreds();

                    /*
                     * Save session quickly,
                     * but debounce Mongo writes.
                     */
                    debouncedSaveSession(
                        sessionId,
                        sessionPath
                    );
                } catch (e) {
                    console.error(
                        'Creds Save Error:',
                        e.message
                    );
                }
            }
        );

        /* =================================================
           CONNECTION UPDATE
        ================================================= */

        sock.ev.on(
            'connection.update',
            async update => {
                const {
                    connection,
                    lastDisconnect
                } = update;

                if (
                    connection ===
                    'close'
                ) {
                    const statusCode =
                        lastDisconnect
                            ?.error
                            ?.output
                            ?.statusCode;

                    const isLoggedOut =
                        statusCode ===
                        DisconnectReason.loggedOut;

                    console.log(
                        `❌ Connection closed [${sessionId}]`,
                        statusCode || ''
                    );

                    cleanupSession(
                        sessionId
                    );

                    /*
                     * Logged out / unauthorized
                     */
                    if (
                        isLoggedOut ||
                        statusCode === 401
                    ) {
                        try {
                            await Session
                                .findOneAndDelete(
                                    {
                                        sessionId
                                    }
                                );
                        } catch (e) {}

                        try {
                            await fs.remove(
                                sessionPath
                            );
                        } catch (e) {}

                        console.log(
                            '🗑️ Session removed:',
                            sessionId
                        );

                        return;
                    }

                    /*
                     * Reconnect
                     */
                    reconnectTimers[
                        sessionId
                    ] = setTimeout(
                        async () => {
                            delete reconnectTimers[
                                sessionId
                            ];

                            try {
                                await Pair(
                                    number
                                );
                            } catch (e) {
                                console.error(
                                    'Reconnect Error:',
                                    e.message
                                );
                            }
                        },
                        3000
                    );
                }

                /* =================================================
                   CONNECTION OPEN
                ================================================= */

                else if (
                    connection ===
                    'open'
                ) {
                    console.log(
                        '✅ 𝐂ᴏɴɴᴇᴄᴛᴇᴅ:',
                        sessionId
                    );

                    /*
                     * Clear old reconnect timer
                     */
                    if (
                        reconnectTimers[
                            sessionId
                        ]
                    ) {
                        clearTimeout(
                            reconnectTimers[
                                sessionId
                            ]
                        );

                        delete reconnectTimers[
                            sessionId
                        ];
                    }

                    /*
                     * Keep alive
                     */
                    if (
                        keepAliveTimers[
                            sessionId
                        ]
                    ) {
                        clearInterval(
                            keepAliveTimers[
                                sessionId
                            ]
                        );
                    }

                    keepAliveTimers[
                        sessionId
                    ] =
                        setInterval(
                            async () => {
                                const currentSocket =
                                    activeSockets[
                                        sessionId
                                    ];

                                if (
                                    !currentSocket
                                ) {
                                    clearInterval(
                                        keepAliveTimers[
                                            sessionId
                                        ]
                                    );

                                    delete keepAliveTimers[
                                        sessionId
                                    ];

                                    return;
                                }

                                try {
                                    await currentSocket
                                        .sendPresenceUpdate(
                                            'available',
                                            currentSocket
                                                .user
                                                .id
                                        );
                                } catch (err) {}
                            },
                            30000
                        );

                    /* =================================================
                       CONNECTED MESSAGE
                    ================================================= */

                    global.isBotActiveSent =
                        global.isBotActiveSent ||
                        false;

                    /*
                     * Send connected message once
                     */
                    if (
                        !global.isBotActiveSent
                    ) {
                        try {
                            const jid =
                                xnumber +
                                '@s.whatsapp.net';

                            const activeText =
                                `╭━━━〔 *ᴅᴛᴢ ʟᴜɴᴀxᴢ ᴍᴅ ʙᴏᴛ* 〕━━━┈⊷
┃ 🚀 *ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ !*
╰━━━━━━━━━━━━━━━┈⊷

*┌────────────────────┐*
*├ \`📡 𝐒𝐭𝐚𝐭𝐮𝐬\`* : Connected Successfully 🟢
*├ \`🔑 𝐏𝐚𝐢𝐫 𝐂𝐨𝐝𝐞\`* : *${pairingCode ?? 'Already registered'}*
*├ \`👨🏻‍💻 𝐎𝐰𝐧𝐞𝐫\`* : ©ɴᴇɴᴢᴏ | ᴍᴏᴅᴇ ×
*├ \`🧬 𝐕𝐞𝐫𝐬ɪᴏɴ\`* : 1.0.0
*└────────────────────┘*

_ʟᴜɴxᴢᴢ ʙᴏᴛ ɪs ɴᴏᴡ ᴀᴄᴛɪᴠᴇ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ᴜsᴇ!_`;

                            await sock.sendMessage(
                                jid,
                                {
                                    image: {
                                        url:
                                            'https://database.ominisave.store/image/OMINISAVE_1791252636478_H9INHZ.jpg'
                                    },
                                    caption:
                                        activeText
                                }
                            );

                            global.isBotActiveSent =
                                true;
                        } catch (e) {
                            console.error(
                                'Connected Message Error:',
                                e.message
                            );
                        }
                    }
                }
            }
        );

        /* =================================================
           MESSAGE HANDLER
        ================================================= */

        sock.ev.on(
            'messages.upsert',
            async mek => {
                try {
                    let msg =
                        mek.messages[0];

                    if (
                        !msg?.message
                    ) {
                        return;
                    }

                    if (
                        msg.key.remoteJid ===
                        'status@broadcast'
                    ) {
                        return;
                    }

                    if (
                        msg.key.remoteJid?.endsWith(
                            '@newsletter'
                        )
                    ) {
                        return;
                    }

                    const type =
                        getContentType(
                            msg.message
                        );

                    /*
                     * Ephemeral message
                     */
                    if (
                        type ===
                        'ephemeralMessage'
                    ) {
                        msg.message =
                            msg.message
                                .ephemeralMessage
                                .message;
                    }

                    const from =
                        msg.key.remoteJid;

                    const m =
                        sms(
                            sock,
                            msg
                        );

                    const isGroup =
                        from.endsWith(
                            '@g.us'
                        );

                    const nowsender =
                        msg.key.fromMe
                            ? (
                                sock.user.id
                                    .split(':')[0] +
                                '@s.whatsapp.net'
                            )
                            : (
                                msg.key.participant ||
                                msg.key.remoteJid
                            );

                    const senderNumber =
                        (
                            nowsender ||
                            ''
                        ).split('@')[0];

                    const botNumber =
                        sock.user.id
                            .split(':')[0];

                    const botNumber2 =
                        await jidNormalizedUser(
                            sock.user.id
                        );

                    const pushname =
                        msg.pushName ||
                        'User';

                    const xnumberConf =
                        config.OWNER_NUMBER ||
                        '';

                    const isMe =
                        botNumber.includes(
                            senderNumber
                        );

                    const isOwner =
                        isMe ||
                        xnumberConf ===
                            senderNumber ||
                        xnumber ===
                            senderNumber;

                    const isReact =
                        m.message
                            ?.reactionMessage
                            ? true
                            : false;

                    /* =================================================
                       QUOTED
                    ================================================= */

                    const quoted =
                        type ===
                            'extendedTextMessage' &&
                        msg.message
                            .extendedTextMessage
                            .contextInfo != null
                            ? msg.message
                                .extendedTextMessage
                                .contextInfo
                                .quotedMessage ||
                              []
                            : [];

                    /* =================================================
                       BODY
                    ================================================= */

                    const body =
                        type ===
                        'conversation'
                            ? msg.message
                                .conversation

                            : msg.message
                                ?.extendedTextMessage
                                ?.contextInfo
                                ?.hasOwnProperty(
                                    'quotedMessage'
                                )
                            ? msg.message
                                .extendedTextMessage
                                .text

                            : type ===
                              'interactiveResponseMessage'
                            ? JSON.parse(
                                msg.message
                                    .interactiveResponseMessage
                                    ?.nativeFlowResponseMessage
                                    ?.paramsJson ||
                                    '{}'
                            )?.id

                            : type ===
                              'templateButtonReplyMessage'
                            ? msg.message
                                .templateButtonReplyMessage
                                ?.selectedId

                            : type ===
                              'extendedTextMessage'
                            ? msg.message
                                .extendedTextMessage
                                .text

                            : type ===
                                  'imageMessage' &&
                              msg.message
                                .imageMessage
                                .caption
                            ? msg.message
                                .imageMessage
                                .caption

                            : type ===
                                  'videoMessage' &&
                              msg.message
                                .videoMessage
                                .caption
                            ? msg.message
                                .videoMessage
                                .caption

                            : type ===
                              'buttonsResponseMessage'
                            ? msg.message
                                .buttonsResponseMessage
                                ?.selectedButtonId

                            : type ===
                              'listResponseMessage'
                            ? msg.message
                                .listResponseMessage
                                ?.singleSelectReply
                                ?.selectedRowId

                            : type ===
                              'messageContextInfo'
                            ? (
                                msg.message
                                    .buttonsResponseMessage
                                    ?.selectedButtonId ||
                                msg.message
                                    .listResponseMessage
                                    ?.singleSelectReply
                                    ?.selectedRowId ||
                                msg.text
                            )

                            : type ===
                              'viewOnceMessageV2'
                            ? (
                                msg.message[
                                    type
                                ]?.message
                                    ?.imageMessage
                                    ?.caption ||
                                msg.message[
                                    type
                                ]?.message
                                    ?.videoMessage
                                    ?.caption ||
                                ''
                            )

                            : '';

                    if (
                        !body ||
                        typeof body !==
                            'string'
                    ) {
                        return;
                    }

                    /* =================================================
                       NUMBER STORE
                    ================================================= */

                    global.numberStore =
                        global.numberStore ||
                        {};

                    let msgText =
                        body;

                    const quotedMsgId =
                        msg.message
                            ?.extendedTextMessage
                            ?.contextInfo
                            ?.stanzaId;

                    if (
                        quotedMsgId &&
                        global.numberStore[
                            quotedMsgId
                        ] &&
                        global.numberStore[
                            quotedMsgId
                        ][msgText]
                    ) {
                        msgText =
                            config.PREFIX +
                            global.numberStore[
                                quotedMsgId
                            ][msgText];
                    }

                    /* =================================================
                       COMMAND
                    ================================================= */

                    const prefix =
                        config.PREFIX;

                    const isCmd =
                        msgText.startsWith(
                            prefix
                        );

                    const command =
                        isCmd
                            ? msgText
                                .slice(
                                    prefix.length
                                )
                                .trim()
                                .split(' ')
                                .shift()
                                .toLowerCase()
                            : '';

                    const args =
                        msgText
                            .trim()
                            .split(
                                / +/
                            )
                            .slice(1);

                    const q =
                        args.join(' ');

                    /* =================================================
                       GROUP DATA
                    ================================================= */

                    let groupMetadata =
                        null;

                    if (isGroup) {
                        groupMetadata =
                            await sock
                                .groupMetadata(
                                    from
                                )
                                .catch(
                                    () => null
                                );
                    }

                    const groupName =
                        isGroup &&
                        groupMetadata
                            ? groupMetadata.subject
                            : '';

                    const participants =
                        isGroup &&
                        groupMetadata
                            ? groupMetadata.participants
                            : [];

                    const groupAdmins =
                        isGroup
                            ? getGroupAdmins(
                                participants
                            )
                            : [];

                    const isBotAdmins =
                        isGroup
                            ? groupAdmins.includes(
                                botNumber2
                            )
                            : false;

                    const isAdmins =
                        isGroup
                            ? groupAdmins.includes(
                                nowsender
                            )
                            : false;

                    const isSudo =
                        false;

                    const isPre =
                        false;

                    /* =================================================
                       REPLY
                    ================================================= */

                    const reply =
                        async teks => {
                            return await sock
                                .sendMessage(
                                    from,
                                    {
                                        text: teks
                                    },
                                    {
                                        quoted:
                                            msg
                                    }
                                );
                        };

                    /* =================================================
                       SESSION CONFIG
                    ================================================= */

                    const sanitizedNumber =
                        botNumber.replace(
                            /[^0-9]/g,
                            ''
                        );

                    const sessionConfig =
                        await loadUserConfigFromMongo(
                            sanitizedNumber
                        ) || config;

                    /* =================================================
                       WORK TYPE
                    ================================================= */

                    if (
                        !isOwner &&
                        isCmd
                    ) {
                        const workType =
                            sessionConfig
                                .WORK_TYPE ||
                            config.WORK_TYPE ||
                            'public';

                        if (
                            workType ===
                            'private'
                        ) {
                            return;
                        }

                        if (
                            isGroup &&
                            workType ===
                                'inbox'
                        ) {
                            return;
                        }

                        if (
                            !isGroup &&
                            workType ===
                                'groups'
                        ) {
                            return;
                        }
                    }

                    /* =================================================
                       ANTI BOT
                    ================================================= */

                    if (
                        sessionConfig.ANTI_BOT ===
                            'true' ||
                        sessionConfig.ANTI_BOT ===
                            true
                    ) {
                        if (
                            !isOwner &&
                            !isAdmins &&
                            isGroup
                        ) {
                            if (
                                msg.key.id.startsWith(
                                    'BAE5'
                                ) &&
                                senderNumber !==
                                    botNumber
                            ) {
                                await reply(
                                    `\`\`\`🤖 Bot Detected!!\`\`\`\n\n_✅ Kicked *@${senderNumber}*_`
                                ).catch(
                                    () => {}
                                );

                                await sock
                                    .groupParticipantsUpdate(
                                        from,
                                        [
                                            nowsender
                                        ],
                                        'remove'
                                    )
                                    .catch(
                                        () => {}
                                    );
                            }
                        }
                    }

                    /* =================================================
                       ANTI BAD WORD
                    ================================================= */

                    if (
                        (
                            sessionConfig.ANTI_BAD ===
                                'true' ||
                            sessionConfig.ANTI_BAD ===
                                true
                        ) &&
                        body
                    ) {
                        if (
                            !isAdmins &&
                            !isOwner
                        ) {
                            try {
                                const bad =
                                    await fetchJson(
                                        'https://devil-tech-md-data-base.pages.dev/bad_word.json'
                                    ).catch(
                                        () => ({})
                                    );

                                for (
                                    let any in bad
                                ) {
                                    if (
                                        body
                                            .toLowerCase()
                                            .includes(
                                                bad[any]
                                            ) &&
                                        !body.includes(
                                            'tent'
                                        ) &&
                                        !body.includes(
                                            'https'
                                        )
                                    ) {
                                        if (
                                            groupAdmins.includes(
                                                nowsender
                                            ) ||
                                            msg.key
                                                .fromMe
                                        ) {
                                            return;
                                        }

                                        await sock
                                            .sendMessage(
                                                from,
                                                {
                                                    delete:
                                                        msg.key
                                                }
                                            )
                                            .catch(
                                                () => {}
                                            );

                                        await sock
                                            .sendMessage(
                                                from,
                                                {
                                                    text:
                                                        '*Bad word detected..!*'
                                                }
                                            )
                                            .catch(
                                                () => {}
                                            );

                                        if (
                                            isGroup
                                        ) {
                                            await sock
                                                .groupParticipantsUpdate(
                                                    from,
                                                    [
                                                        nowsender
                                                    ],
                                                    'remove'
                                                )
                                                .catch(
                                                    () => {}
                                                );
                                        }
                                    }
                                }
                            } catch (e) {}
                        }
                    }

                    /* =================================================
                       ANTI LINK
                    ================================================= */

                    if (
                        (
                            sessionConfig.ANTI_LINK ===
                                'true' ||
                            sessionConfig.ANTI_LINK ===
                                true
                        ) &&
                        isGroup &&
                        body.includes(
                            'chat.whatsapp.com'
                        )
                    ) {
                        if (
                            isBotAdmins &&
                            !isOwner &&
                            !isAdmins
                        ) {
                            await sock
                                .sendMessage(
                                    from,
                                    {
                                        delete:
                                            msg.key
                                    }
                                )
                                .catch(
                                    () => {}
                                );

                            await reply(
                                '*「 ⚠️ 𝑳𝑰𝑵𝑲 𝑫𝑬𝑳𝑬𝑻𝑬𝑫 ⚠️ 」*'
                            );
                        }
                    }

                    /* =================================================
                       AUTO TYPING
                    ================================================= */

                    if (
                        sessionConfig.AUTO_TYPING ===
                            'true' ||
                        sessionConfig.AUTO_TYPING ===
                            true
                    ) {
                        sock
                            .sendPresenceUpdate(
                                'composing',
                                from
                            )
                            .catch(
                                () => {}
                            );
                    }

                    /* =================================================
                       AUTO RECORDING
                    ================================================= */

                    if (
                        sessionConfig.AUTO_RECORDING ===
                            'true' ||
                        sessionConfig.AUTO_RECORDING ===
                            true
                    ) {
                        await sock
                            .sendPresenceUpdate(
                                'recording',
                                from
                            )
                            .catch(
                                () => {}
                            );
                    }

                    /* =================================================
                       ALWAYS OFFLINE
                    ================================================= */

                    if (
                        sessionConfig.ALWAYS_OFFLINE ===
                            'true' ||
                        sessionConfig.ALWAYS_OFFLINE ===
                            true
                    ) {
                        await sock
                            .sendPresenceUpdate(
                                'unavailable'
                            )
                            .catch(
                                () => {}
                            );
                    }

                    /* =================================================
                       ALWAYS ONLINE
                    ================================================= */

                    if (
                        sessionConfig.ALWAYS_ONLINE ===
                            'true' ||
                        sessionConfig.ALWAYS_ONLINE ===
                            true
                    ) {
                        await sock
                            .sendPresenceUpdate(
                                'available'
                            )
                            .catch(
                                () => {}
                            );
                    }

                    /* =================================================
                       AUTO BIO
                    ================================================= */

                    if (
                        sessionConfig.AUTO_BIO ===
                            'true' ||
                        sessionConfig.AUTO_BIO ===
                            true
                    ) {
                        const currentUptime =
                            typeof runtime !==
                            'undefined'
                                ? runtime(
                                    process.uptime()
                                )
                                : process.uptime();

                        await sock
                            .updateProfileStatus(
                                `*Dᴛᴢ Mɪɴɪ Bᴏᴛ v3 Cᴏɴɴᴇᴄᴛ Sᴜᴄᴄᴇꜱꜱꜰᴜʟ 🚀..."* *${currentUptime}*`
                            )
                            .catch(
                                () => {}
                            );
                    }

                    /* =================================================
                       AUTO READ
                    ================================================= */

                    if (
                        sessionConfig.READ_CMD_ONLY ===
                            'true' ||
                        sessionConfig.READ_CMD_ONLY ===
                            true
                    ) {
                        if (isCmd) {
                            await sock
                                .readMessages([
                                    msg.key
                                ])
                                .catch(
                                    () => {}
                                );
                        }
                    } else if (
                        sessionConfig.AUTO_READ ===
                            'true' ||
                        sessionConfig.AUTO_READ ===
                            true
                    ) {
                        await sock
                            .readMessages([
                                msg.key
                            ])
                            .catch(
                                () => {}
                            );
                    }

                    /* =================================================
                       AUTO REACT
                    ================================================= */

                    if (
                        !isReact &&
                        !isMe &&
                        senderNumber !==
                            botNumber
                    ) {
                        if (
                            sessionConfig.AUTO_REACT ===
                                'true' ||
                            sessionConfig.AUTO_REACT ===
                                true ||
                            config.AUTO_REACT
                        ) {
                            const emojis =
                                (
                                    sessionConfig
                                        .REACT_EMOJIS &&
                                    sessionConfig
                                        .REACT_EMOJIS
                                        .length >
                                        0
                                )
                                    ? sessionConfig
                                        .REACT_EMOJIS
                                    : (
                                        config.REACT_EMOJIS ||
                                        [
                                            '❤️',
                                            '🔥',
                                            '👍'
                                        ]
                                    );

                            sock
                                .sendMessage(
                                    from,
                                    {
                                        react: {
                                            text:
                                                emojis[
                                                    Math.floor(
                                                        Math.random() *
                                                        emojis.length
                                                    )
                                                ],
                                            key:
                                                msg.key
                                        }
                                    }
                                )
                                .catch(
                                    () => {}
                                );
                        }
                    }

                    /* =================================================
                       COMMAND
                    ================================================= */

                    const cmdName =
                        isCmd
                            ? msgText
                                .slice(
                                    prefix.length
                                )
                                .trim()
                                .split(' ')[0]
                                .toLowerCase()
                            : false;

                    if (isCmd) {
                        const cmd =
                            commandMap.get(
                                cmdName
                            );

                        if (cmd) {
                            if (cmd.react) {
                                sock
                                    .sendMessage(
                                        from,
                                        {
                                            react: {
                                                text:
                                                    cmd.react,
                                                key:
                                                    msg.key
                                            }
                                        }
                                    )
                                    .catch(
                                        () => {}
                                    );
                            }

                            try {
                                await Promise.resolve(
                                    cmd.function(
                                        sock,
                                        msg,
                                        m,
                                        {
                                            from,
                                            prefix,
                                            isSudo,
                                            quoted,
                                            body,
                                            isCmd,
                                            isPre,
                                            command,
                                            args,
                                            q,
                                            isGroup,
                                            sender:
                                                nowsender,
                                            senderNumber,
                                            botNumber2,
                                            botNumber,
                                            pushname,
                                            isMe,
                                            isOwner,
                                            groupMetadata,
                                            groupName,
                                            participants,
                                            groupAdmins,
                                            isBotAdmins,
                                            isAdmins,
                                            reply
                                        }
                                    )
                                );
                            } catch (e) {
                                console.error(
                                    '[PLUGIN ERROR]',
                                    e
                                );
                            }
                        }
                    }

                    /* =================================================
                       EVENT COMMANDS
                    ================================================= */

                    for (
                        const cmd of
                        events.commands
                    ) {
                        try {
                            if (
                                body &&
                                cmd.on ===
                                    'body'
                            ) {
                                await Promise.resolve(
                                    cmd.function(
                                        sock,
                                        msg,
                                        m,
                                        {
                                            from,
                                            prefix,
                                            quoted,
                                            body,
                                            isSudo,
                                            isCmd,
                                            command,
                                            args,
                                            q,
                                            isPre,
                                            isGroup,
                                            sender:
                                                nowsender,
                                            senderNumber,
                                            botNumber2,
                                            botNumber,
                                            pushname,
                                            isMe,
                                            isOwner,
                                            groupMetadata,
                                            groupName,
                                            participants,
                                            groupAdmins,
                                            isBotAdmins,
                                            isAdmins,
                                            reply
                                        }
                                    )
                                );
                            }

                            else if (
                                q &&
                                cmd.on ===
                                    'text'
                            ) {
                                await Promise.resolve(
                                    cmd.function(
                                        sock,
                                        msg,
                                        m,
                                        {
                                            from,
                                            quoted,
                                            body,
                                            isSudo,
                                            isCmd,
                                            isPre,
                                            command,
                                            args,
                                            q,
                                            isGroup,
                                            sender:
                                                nowsender,
                                            senderNumber,
                                            botNumber2,
                                            botNumber,
                                            pushname,
                                            isMe,
                                            isOwner,
                                            groupMetadata,
                                            groupName,
                                            participants,
                                            groupAdmins,
                                            isBotAdmins,
                                            isAdmins,
                                            reply
                                        }
                                    )
                                );
                            }

                            else if (
                                (
                                    cmd.on ===
                                        'image' ||
                                    cmd.on ===
                                        'photo'
                                ) &&
                                type ===
                                    'imageMessage'
                            ) {
                                await Promise.resolve(
                                    cmd.function(
                                        sock,
                                        msg,
                                        m,
                                        {
                                            from,
                                            prefix,
                                            quoted,
                                            isSudo,
                                            body,
                                            isCmd,
                                            command,
                                            isPre,
                                            args,
                                            q,
                                            isGroup,
                                            sender:
                                                nowsender,
                                            senderNumber,
                                            botNumber2,
                                            botNumber,
                                            pushname,
                                            isMe,
                                            isOwner,
                                            groupMetadata,
                                            groupName,
                                            participants,
                                            groupAdmins,
                                            isBotAdmins,
                                            isAdmins,
                                            reply
                                        }
                                    )
                                );
                            }

                            else if (
                                cmd.on ===
                                    'sticker' &&
                                type ===
                                    'stickerMessage'
                            ) {
                                await Promise.resolve(
                                    cmd.function(
                                        sock,
                                        msg,
                                        m,
                                        {
                                            from,
                                            prefix,
                                            quoted,
                                            isSudo,
                                            body,
                                            isCmd,
                                            command,
                                            args,
                                            isPre,
                                            q,
                                            isGroup,
                                            sender:
                                                nowsender,
                                            senderNumber,
                                            botNumber2,
                                            botNumber,
                                            pushname,
                                            isMe,
                                            isOwner,
                                            groupMetadata,
                                            groupName,
                                            participants,
                                            groupAdmins,
                                            isBotAdmins,
                                            isAdmins,
                                            reply
                                        }
                                    )
                                );
                            }
                        } catch (e) {
                            console.error(
                                '[CMD MAP ERROR]',
                                e
                            );
                        }
                    }

                    /* =================================================
                       SPECIAL COMMANDS
                    ================================================= */

                    switch (command) {
                        case 'jid':
                            await reply(
                                from
                            );
                            break;

                        case 'ev':
                            if (isOwner) {
                                try {
                                    const result =
                                        await eval(
                                            q
                                        );

                                    await reply(
                                        util.format(
                                            result
                                        )
                                    );
                                } catch (
                                    err
                                ) {
                                    await reply(
                                        util.format(
                                            err
                                        )
                                    );
                                }
                            }
                            break;
                    }
                } catch (e) {
                    console.error(
                        '[MAIN LOOP ERROR]',
                        e
                    );
                }
            }
        );
    } catch (err) {
        console.error(
            'Pair Error:',
            err
        );

        cleanupSession(
            sessionId
        );

        if (
            res &&
            !res.headersSent
        ) {
            res.json({
                error:
                    'Pair failed: ' +
                    err.message
            });
        }
    }
}

/* =========================================================
   RESTORE ALL SESSIONS
========================================================= */

async function restoreAllSessions() {
    try {
        const sessions =
            await Session
                .find(
                    {
                        sessionId: {
                            $exists: true,
                            $ne: null
                        }
                    }
                )
                .lean();

        console.log(
            `Restoring ${sessions.length} session(s)...`
        );

        /*
         * Restore sequentially with a small delay.
         * Prevents Mongo/WhatsApp connection burst.
         */
        for (
            let index = 0;
            index < sessions.length;
            index++
        ) {
            const session =
                sessions[index];

            if (
                !session.sessionId
            ) {
                continue;
            }

            const number =
                session.sessionId
                    .replace(
                        'dina_',
                        ''
                    );

            try {
                await delay(
                    index * 700
                );

                await Pair(
                    number
                );
            } catch (err) {
                console.error(
                    'Failed to restore session',
                    session.sessionId,
                    err.message
                );
            }
        }
    } catch (err) {
        console.error(
            'restoreAllSessions Error:',
            err.message
        );
    }
}

/* =========================================================
   PAIR API
========================================================= */

app.get(
    '/pair',
    async (req, res) => {
        const number =
            req.query.number;

        if (!number) {
            return res.json({
                error:
                    'Number required'
            });
        }

        res.setTimeout(
            30000,
            () => {
                if (
                    !res.headersSent
                ) {
                    res.json({
                        error:
                            'Request timed out. Try again.'
                    });
                }
            }
        );

        await Pair(
            number,
            res
        );
    }
);

/* =========================================================
   HOME
========================================================= */

app.get(
    '/',
    (req, res) => {
        res.send(
            'Bots Server Running!'
        );
    }
);

/* =========================================================
   SERVER
========================================================= */

app.listen(
    PORT,
    async () => {
        console.log(
            `Server running on port ${PORT}`
        );

        await fs.ensureDir(
            SESSION_BASE_PATH
        );

        /*
         * Wait for MongoDB before
         * restoring sessions.
         */
        if (
            mongoose.connection.readyState !==
            1
        ) {
            await new Promise(
                resolve => {
                    const timeout =
                        setTimeout(
                            resolve,
                            10000
                        );

                    const check =
                        setInterval(
                            () => {
                                if (
                                    mongoose
                                        .connection
                                        .readyState ===
                                    1
                                ) {
                                    clearTimeout(
                                        timeout
                                    );

                                    clearInterval(
                                        check
                                    );

                                    resolve();
                                }
                            },
                            250
                        );
                }
            );
        }

        await restoreAllSessions();
    }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

process.on(
    'uncaughtException',
    err => {
        const e =
            String(err);

        if (
            e.includes(
                'Socket connection timeout'
            ) ||
            e.includes(
                'rate-overlimit'
            ) ||
            e.includes(
                'Connection Closed'
            ) ||
            e.includes(
                'Value not found'
            )
        ) {
            return;
        }

        console.log(
            'Caught exception:',
            err
        );
    }
);

process.on(
    'unhandledRejection',
    err => {
        const e =
            String(err);

        if (
            e.includes(
                'Socket connection timeout'
            ) ||
            e.includes(
                'rate-overlimit'
            ) ||
            e.includes(
                'Connection Closed'
            ) ||
            e.includes(
                'Value not found'
            )
        ) {
            return;
        }

        console.log(
            'Caught rejection:',
            err
        );
    }
);