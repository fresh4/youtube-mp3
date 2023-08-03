import "./App.css";
import { useState, useEffect } from "react";
import { Slider, InputNumber, Input, Col, Row, Spin } from "antd";
import YouTubePlayer from "react-youtube";
const { Search } = Input;

function App() {
  const [Player, setPlayer] = useState({ playerInfo: { duration: 0 } });
  const [options, setOptions] = useState({});

  const [loading, setLoading] = useState(false);

  const [url, setUrl] = useState("");
  const [time, setTime] = useState(0);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(100);
  const [max, setMax] = useState(100);

  useEffect(() => {
    if (Player.getPlayerState) {
      const interval = setInterval(() => {
        if (Player.getPlayerState() === 1) {
          const currentTime = Player.getCurrentTime();
          setTime(currentTime);
        }
      }, 10);

      return () => {
        clearInterval(interval);
      };
    }
  }, [Player]);

  function handleReady(e) {
    setPlayer(e);
    setOptions({
      modestbranding: 1,
      controls: 0,
      autoplay: 1,
      end: e.playerInfo.duration,
      playlist: url ? extractYouTubeVideoId(url) : "dQw4w9WgXcQ",
      disablekb: 1,
    });
    setEnd(e.playerInfo.duration);
    setMax(e.playerInfo.duration);
    e.playVideo();
    e.seekTo(start);
  }

  function handleChangeURL(e) {
    setUrl(e);
    setOptions({
      modestbranding: 1,
      controls: 0,
      autoplay: 1,
      end: Player.playerInfo.duration,
      playlist: url ? extractYouTubeVideoId(url) : "dQw4w9WgXcQ",
      disablekb: 1,
    });
    setEnd(Player.playerInfo.duration);
    setMax(Player.playerInfo.duration);
  }

  function handleSlider(range) {
    if (range[1] - range[0] === 0) return;

    setTime(range[0]);
    setStart(range[0]);
    setEnd(range[1]);
    setOptions({ ...options, start: range[0], end: range[1] });
    Player.seekTo(start);
  }

  function handleUpdateTime(state) {
    if (state == 2) {
    }
  }

  function handleSubmit() {
    setLoading(true);
    fetch(
      `http://127.0.0.1:3000/test?start=${start}&end=${end}&id=${Player.playerInfo.videoData.video_id}`
    )
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        const link = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        const filename = Player.videoTitle.replace(/[/\\?%*:|"<>]/g, "");
        a.style.display = "none";
        a.href = link;
        // the filename you want
        a.download = `${filename}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(link);
        setLoading(false);
      });
  }

  function secondsToTimecode(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(Math.floor(remainingSeconds)).padStart(
      2,
      "0"
    );
    const formattedMilliseconds = String((remainingSeconds % 1).toFixed(3))
      .slice(2)
      .padEnd(3, "0");

    return `${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  }

  function extractYouTubeVideoId(video_url) {
    const videoIdRegex =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
    const match = video_url.match(videoIdRegex);
    return match ? match[1] : null;
  }

  return (
    <>
      <Title />
      <Row>
        <Search
          placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          onSearch={handleChangeURL}
          enterButton="Search"
        />
      </Row>
      <hr />
      <YouTubePlayer
        videoId={url ? extractYouTubeVideoId(url) : "dQw4w9WgXcQ"}
        onStateChange={(e) => {
          setPlayer(e.target);
          handleUpdateTime(e.data);
        }}
        onReady={(e) => {
          handleReady(e.target);
        }}
        onEnd={(e) => e.target.seekTo(start)}
        opts={{
          width: "1200",
          height: "640",
          playerVars: options,
        }}
      />

      <Slider
        tooltip={{ formatter: secondsToTimecode }}
        range
        max={max}
        defaultValue={[0, max]}
        step={0.05}
        value={[start, end]}
        onChange={handleSlider}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Row gutter={{ md: 4 }} style={{ justifyContent: "flex-start" }}>
            <Col span="8">
              <label>Start</label>
            </Col>
            <Col></Col>
            <Col span="8">
              <label>End</label>
            </Col>
          </Row>
          <Row gutter={{ md: 4 }}>
            <Col span="8">
              <InputNumber
                addonAfter="s"
                title="Start"
                placeholder="0"
                type="number"
                onChange={(e) => handleSlider([e, end])}
                value={start}
                style={{ width: "90%" }}
              />
            </Col>
            <Col>{" - "}</Col>
            <Col span="8">
              <InputNumber
                addonAfter="s"
                placeholder={max}
                type="number"
                onChange={(e) => handleSlider([start, e])}
                value={end}
                style={{ width: "90%" }}
              />
            </Col>
          </Row>
        </div>
        <div>
          {secondsToTimecode(time)}/{secondsToTimecode(max)}
        </div>
      </div>
      <br />

      <button disabled={loading} onClick={handleSubmit}>
        {loading ? <Spin /> : "Convert to .mp3"}
      </button>
    </>
  );
}

function Title() {
  return (
    <>
      <h1>YouTube to Soundbyte</h1>
      <p>
        The YouTube to Soundbyte tool is a tool for generating mp3 soundbytes
        from a given YouTube URL. <br />
        You can trim the video to a range of time using the sliders, or get more
        granular control via the inputs below the slider. <br />
        The video preview will loop between the start and end ranges so you can
        verify everything is as desired. <br />
        Once you have the range you want, click the 'Convert to .mp3' button to
        download the trimmed audio file. <br />
        <br />
        This mainly exists as an easy way to generate Discord soundboard files
        from a YouTube video.
      </p>
    </>
  );
}

export default App;
