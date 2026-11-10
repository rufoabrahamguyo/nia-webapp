import { useRef, useState } from "react";

export default function VideoFrame({ src, poster, label, playLabel, fallback, className = "" }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    const started = video.play();
    if (started?.catch) started.catch(() => setPlaying(false));
  }

  return (
    <div className={`video-frame${className ? ` ${className}` : ""}`}>
      <video
        ref={videoRef}
        className="referral-video"
        controls={playing}
        playsInline
        preload="metadata"
        poster={poster}
        src={src}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      >
        {fallback}
      </video>
      {playing ? null : (
        <button type="button" className="video-play" onClick={play}>
          <span className="video-play-button" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 5.5v13l11-6.5-11-6.5z" />
            </svg>
          </span>
          <span className="video-play-label">{playLabel}</span>
        </button>
      )}
    </div>
  );
}
