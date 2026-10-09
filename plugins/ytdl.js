const { cmd } = require('../command')
const axios = require('axios')

const API = 'https://supunofc.site/api/download/yt-down'
const APIKEY = process.env.YT_APIKEY || 'ඔයාගේ_apikey_එක'

async function getData(url) {
  const { data } = await axios.get(API, { params: { url, apikey: APIKEY } })
  if (!data.success) throw new Error('API error')
  return data
}

// ---------- VIDEO ----------
cmd({
  pattern: 'ytmp4',
  alias: ['ytvideo'],
  desc: 'YouTube video download',
  category: 'download',
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q || !/youtu/.test(q)) return reply('❌ YouTube link එකක් දෙන්න.\nඋදා: .ytmp4 https://youtu.be/xxxx')

    await reply('⏳ Download වෙනවා...')
    const data = await getData(q)
    const res = data.result

    // 360p -> 720p -> 480p අනුපිළිවෙලින් mp4 තෝරනවා
    const prefer = ['360p', '720p', '480p']
    let video
    for (const p of prefer) {
      video = res.videoStreams.find(v => v.resolution === p && v.extension === 'mp4')
      if (video) break
    }
    if (!video) return reply('❌ සුදුසු video format එකක් නැහැ.')

    const title = data.data.description?.split('\n')[0] || 'YouTube Video'

    await conn.sendMessage(from, {
      video: { url: video.downloadUrl },
      mimetype: 'video/mp4',
      caption: `🎬 *${title}*\n📺 ${video.resolution}`
    }, { quoted: mek })
  } catch (e) {
    console.log(e)
    reply('❌ Error: ' + e.message)
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
  try {
    if (!q || !/youtu/.test(q)) return reply('❌ YouTube link එකක් දෙන්න.\nඋදා: .ytmp3 https://youtu.be/xxxx')

    await reply('⏳ Download වෙනවා...')
    const data = await getData(q)
    const audio = data.result.audioStreams.find(a => a.extension === 'm4a') || data.result.audioStreams[0]
    if (!audio) return reply('❌ Audio එකක් හොයාගන්න බැරි උනා.')

    await conn.sendMessage(from, {
      audio: { url: audio.downloadUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: mek })
  } catch (e) {
    console.log(e)
    reply('❌ Error: ' + e.message)
  }
})
