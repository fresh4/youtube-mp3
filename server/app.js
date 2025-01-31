import ytdl from '@distube/ytdl-core'
import express from 'express'
import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import * as fs from 'fs';

const app = express()
const apiRouter = express.Router()
const port = 3000

app.use('/api', apiRouter)

apiRouter.get("/convert", (req, res) => {
  // console.log(req.query)
  const start = req.query.start;
  const end = req.query.end;
  const videoId = req.query.id;
  const agent = ytdl.createAgent(JSON.parse(fs.readFileSync("cookies.json")));

  if (end - start > 61) {
    console.log("too long!")
    return res.status(400)
      .send("Selected range cannot be greater than 1 minute.")
  }

  ffmpeg.setFfmpegPath(ffmpegPath)

  ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`, { agent: agent, playerClients: ["IOS", "WEB_CREATOR"] }).then(e => {
    var filename = e.videoDetails.title
    filename = filename.replace(/[/\\?%*:|"<>]/g, "");

    res.set("Content-Type", "audio/mpeg")
    res.set("Content-Disposition", `inline;filename="${filename}.mp3"`)

    const options = { filter: "audioonly" }
    const video = ytdl(`https://www.youtube.com/watch?v=${videoId}`, options)

    ffmpeg(video)
      .setStartTime(start)
      .setDuration(end - start)
      .format("mp3")
      .pipe(res, { end: true })
  })
})

app.listen(port, () => {
  console.log(`Server started and listening on port ${port}`)
})