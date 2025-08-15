import { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Button from "@mui/material/Button";

function AudioPlayer({ src }) {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const speedOptions = [0.5, 1, 2, 2.5];

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const setMeta = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", setMeta);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", setMeta);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSeek = (e) => {
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
    setProgress((newTime / duration) * 100);
  };

  const toggleSpeed = () => {
    const currentIndex = speedOptions.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    const newRate = speedOptions[nextIndex];
    setPlaybackRate(newRate);
    audioRef.current.playbackRate = newRate;
  };

  return (
    <Box
      sx={{
        maxWidth: 330,
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        p: 1,
        bgcolor: "#fff",
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton size="small" onClick={togglePlay}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>

        <Box
          ref={progressRef}
          onClick={handleSeek}
          sx={{ flex: 1, cursor: "pointer" }}
        >
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              borderRadius: 2,
              backgroundColor: "#f0f0f0",
            }}
          />
        </Box>

        <Typography variant="caption">{formatTime(currentTime)}</Typography>
        <Typography variant="caption">/{formatTime(duration)}</Typography>

        <Button
          onClick={toggleSpeed}
          size="small"
          sx={{
            //  a round with a border
            border: "2px solid #a0a0a0ff",
            borderRadius: "20px",
            minWidth: "40px",
            p: 0.5,
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          {playbackRate}x
        </Button>
      </Stack>

      <audio ref={audioRef} src={src} preload="metadata" />
    </Box>
  );
}

export default AudioPlayer;
