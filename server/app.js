import ytdl from 'ytdl-core'
import express from 'express'
import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'
import cors from 'cors'

const app = express()
const port = 3000

app.use(cors({
  origin: "*"
}))

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/test", (req, res) => {
  // console.log(req.query)
  const start = req.query.start;
  const end = req.query.end;
  const videoId = req.query.id;
  ffmpeg.setFfmpegPath(ffmpegPath)

  ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`).then(e => {
    var filename = e.videoDetails.title
    filename = filename.replace(/[/\\?%*:|"<>]/g, "");

    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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