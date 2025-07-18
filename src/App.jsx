/* eslint-disable react/no-unescaped-entities */
import "./App.css";
import { useState, useEffect } from "react";
import { Slider, InputNumber, Input, Col, Row, Spin, Alert } from "antd";
import YouTubePlayer from "react-youtube";
import KofiButton from "kofi-button";
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

  function handleSubmit() {
    setLoading(true);
    fetch(
      `/api/convert?start=${start}&end=${end}&id=${Player.playerInfo.videoData.video_id}`
    )
      .then((response) => {
        if (response.status !== 200) throw new Error("Bad Request"); //Bundle actual response from server
        return response.blob();
      })
      .then((blob) => {
        const link = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        const filename = Player.videoTitle.replace(/[/\\?%*:|"<>]/g, "");
        a.style.display = "none";
        a.href = link;

        a.download = `${filename}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(link);
      })
      .catch((reason) => {
        console.log(`Error: ${reason}`);
      })
      .finally(() => {
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
      {!Player.getPlayerState && <Spin size="large" />}
      <YouTubePlayer
        className="youtube-player"
        videoId={url ? extractYouTubeVideoId(url) : "dQw4w9WgXcQ"}
        onStateChange={(e) => {
          setPlayer(e.target);
        }}
        onReady={(e) => {
          handleReady(e.target);
        }}
        onEnd={(e) => e.target.seekTo(start)}
        opts={{
          // width: "1200",
          // height: "640",
          playerVars: options,
        }}
      />
      <Slider
        className="timing-slider"
        tooltip={{ formatter: secondsToTimecode }}
        range
        max={max}
        defaultValue={[0, max]}
        step={0.05}
        value={[start, end]}
        onChange={handleSlider}
        marks={{
          [time]: `${secondsToTimecode(time).split(".")[0]}`,
        }}
      />
      <div
        className="timing-container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="timing-range">
          <Row gutter={{ md: 4 }}>
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
                inputMode="decimal"
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
                inputMode="decimal"
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
      <button
        disabled={
          loading ||
          parseInt(end) - parseInt(start) > 60 ||
          parseFloat(end) - parseFloat(start) < 0.5
        }
        onClick={handleSubmit}
      >
        {loading ? <Spin /> : "Convert to .mp3"}
      </button>
      <p style={{ margin: 0 }}>
        <small>(Maximum length is 1 minute)</small>
      </p>
      <br />
      <hr />
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <KofiButton color="#0a9396" title="Support Me <3" kofiID="J3J71G7WM" />
      <small>
        <a
          className="gh-logo"
          href="https://github.com/fresh4/youtube-mp3"
          target="_blank" rel="noreferrer"
        />
      </small>
    </div>
  );
}

function Title() {
  return (
    <>
      <h1>YouTube to Soundbyte</h1>
      <Alert 
        type="error" 
        showIcon
        message="Please Read"
        description="As of 2024, this application no longer works due to YouTube strictly rejecting API requests from bots and cloud provider IP addresses. 
        If you would like to still use it and kind of know how to use NodeJS, the Github page linked at the bottom of the page has instructions on how to run this application locally, 
        as that will bypass the IP block restriction on the hosted version."
        closable
      />
      <p className="description">
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
