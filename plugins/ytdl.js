const { cmd } = require('../command')
const ytdlp = require('youtube-dl-exec')
const fs = require('fs')
const path = require('path')
const os = require('os')

const MAX_SEC = 20 * 60 // විනාඩි 20 ට වැඩි නම් නවත්තනවා

function cleanUrl(u) {
  const m = u.match(/(?:shorts\/|youtu\.be\/|v=)([\w-]{11})/)
  return m ? `https://www.youtube.com/watch?v=${m[1]}` : u
}

const baseOpts = {
  noPlaylist: true,
  noWarnings: true
  // cookies: './cookies.txt',  // YouTube "bot" block එකක් ආවොත් මේක on කරන්න
}

async function getInfo(url) {
  return ytdlp(url, { ...baseOpts, dumpSingleJson: true })
}

async function download(url, name, format) {
  const out = path.join(os.tmpdir(), name)
  await ytdlp(url, { ...baseOpts, format, output: out })
  return out
}

// ---------- VIDEO ----------
cmd({
  pattern: 'ytmp4',
  alias: ['ytvideo'],
  desc: 'YouTube video download',
  category: 'download',
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  let file
  try {
    if (!q || !/youtu/.test(q)) return reply('❌ YouTube link එකක් දෙන්න.\nඋදා: .ytmp4 https://youtu.be/xxxx')
    const url = cleanUrl(q)
    await reply('⏳ Download වෙනවා...')

    const info = await getInfo(url)
    if (info.duration > MAX_SEC) return reply('❌ Video එක විනාඩි 20 ට වඩා දිගයි.')

    file = await download(url, `${info.id}.mp4`, '18/best[ext=mp4][height<=480]/best[height<=480]')

    await conn.sendMessage(from, {
      video: fs.readFileSync(file),
      mimetype: 'video/mp4',
      caption: `🎬 *${info.title}*\n👤 ${info.uploader}`
    }, { quoted: mek })
  } catch (e) {
    console.log(e)
    reply('❌ Error: ' + (e.stderr || e.message).toString().slice(0, 300))
  } finally {
    if (file && fs.existsSync(file)) fs.unlinkSync(file)
  }
})

// ---------- AUDIO ----------
cmd({
  pattern: 'ytmp3',
  alias: ['ytaudio'],
  desc: 'YouTube audio download',
  category: 'download',
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  let file
  try {
    if (!q || !/youtu/.test(q)) return reply('❌ YouTube link එකක් දෙන්න.\nඋදා: .ytmp3 https://youtu.be/xxxx')
    const url = cleanUrl(q)
    await reply('⏳ Download වෙනවා...')

    const info = await getInfo(url)
    if (info.duration > MAX_SEC) return reply('❌ Video එක විනාඩි 20 ට වඩා දිගයි.')

    file = await download(url, `${info.id}.m4a`, 'bestaudio[ext=m4a]/bestaudio')

    await conn.sendMessage(from, {
      audio: fs.readFileSync(file),
      mimetype: 'audio/mp4'
    }, { quoted: mek })
  } catch (e) {
    console.log(e)
    reply('❌ Error: ' + (e.stderr || e.message).toString().slice(0, 300))
  } finally {
    if (file && fs.existsSync(file)) fs.unlinkSync(file)
  }
})
