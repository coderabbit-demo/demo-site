/** Accessible clip-relative video controls and explicit unavailable/loading/error states. */
import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { attachPlayback } from "./playback";
import type { PlaybackController, PlaybackState } from "./playback";
import { formatTime } from "./tour";
import type { Feature, Media } from "./tour";

interface PlayerProps {
  readonly feature: Feature;
  readonly media: Media;
  readonly autoplay: boolean;
  readonly onProgress: (fraction: number) => void;
  readonly onComplete: () => void;
}

/** Shows a pending-recording state or mounts the player with a fresh retry lifecycle. */
export function Player(props: PlayerProps): ReactElement {
  const [attempt, setAttempt] = useState(0);
  if (props.media.src === null)
    return (
      <div className="video-placeholder">
        <span className="play-emblem" aria-hidden="true">
          ▷
        </span>
        <p className="placeholder-label">See it in action</p>
        <h2>Demo coming soon</h2>
        <p>
          A closer look at {props.feature.title.toLowerCase()} is on its way.
        </p>
        <span className="recording-status">
          <span /> Recording in preparation
        </span>
      </div>
    );
  return (
    <ReadyPlayer
      key={attempt}
      {...props}
      src={props.media.src}
      retry={() => {
        setAttempt((value) => value + 1);
      }}
    />
  );
}

interface ReadyPlayerProps extends PlayerProps {
  readonly src: string;
  readonly retry: () => void;
}

/** Owns a loaded source's media lifecycle and renders accessible playback controls. */
function ReadyPlayer({
  feature,
  media,
  src,
  autoplay,
  onProgress,
  onComplete,
  retry,
}: ReadyPlayerProps): ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<PlaybackController | null>(null);
  const [state, setState] = useState<PlaybackState>({ status: "loading" });
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(false);
  const [notice, setNotice] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const callbacks = useRef({ onProgress, onComplete });

  useEffect(() => {
    /** Mirrors browser fullscreen changes, including exits through Escape. */
    function syncFullscreen(): void {
      setIsFullscreen(document.fullscreenElement === stageRef.current);
    }
    syncFullscreen();
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
    };
  }, []);

  useEffect(() => {
    callbacks.current = { onProgress, onComplete };
  }, [onProgress, onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setState({ status: "loading" });
    const controller = attachPlayback(video, {
      start: feature.start,
      end: feature.end,
      autoplay,
      /** Mirrors playback state and forwards normalized progress to the current callback. */
      update(next): void {
        setState(next);
        if (next.status === "ready")
          callbacks.current.onProgress(next.elapsed / next.duration);
      },
      /** Forwards natural completion without retaining an outdated parent callback. */
      onComplete(): void {
        callbacks.current.onComplete();
      },
    });
    controllerRef.current = controller;
    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, [feature.id, feature.start, feature.end, src, autoplay]);

  /** Toggles the stage's browser fullscreen mode and reports rejected requests. */
  function fullscreen(): void {
    setNotice("");
    const stage = stageRef.current;
    if (stage && document.fullscreenElement === stage) {
      void document.exitFullscreen().catch(() => {
        setNotice(
          "Fullscreen couldn’t close. Please try again or press Escape.",
        );
      });
      return;
    }
    if (!stage?.requestFullscreen) {
      setNotice("Fullscreen is unavailable in this browser.");
      return;
    }
    void stage.requestFullscreen().catch(() => {
      setNotice("Fullscreen couldn’t open. Please try again.");
    });
  }

  /** Applies saved preferences before playback and when a caption track loads. */
  function applyPreferences(): void {
    const video = videoRef.current;
    if (!video) return;
    video.defaultPlaybackRate = speed;
    video.playbackRate = speed;
    video.muted = muted;
    for (const track of video.textTracks)
      track.mode = captions ? "showing" : "disabled";
  }

  /** Toggles available text tracks and keeps the captions button state synchronized. */
  function toggleCaptions(): void {
    const video = videoRef.current;
    if (!video) return;
    for (const track of video.textTracks)
      track.mode = captions ? "disabled" : "showing";
    setCaptions(!captions);
  }

  const ready = state.status === "ready";
  const playing = ready && state.playing;
  return (
    <div className="player" ref={stageRef}>
      <div className="video-surface">
        <video
          key={`${feature.id}:${src}`}
          ref={videoRef}
          muted={muted}
          onLoadedMetadata={applyPreferences}
          src={src}
          poster={media.poster}
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          aria-label={`${feature.title} demo`}
        >
          {media.captions && (
            <track
              onLoad={applyPreferences}
              kind="captions"
              src={media.captions}
              srcLang="en"
              label="English"
            />
          )}
        </video>
        {state.status === "loading" && (
          <div className="player-overlay" role="status">
            Loading recording…
          </div>
        )}
        {state.status === "error" && (
          <div className="player-overlay">
            <h2>Let’s try that again</h2>
            <p role="alert">{state.message}</p>
            <button onClick={retry}>Retry recording</button>
          </div>
        )}
        {ready && (
          <button
            className="video-toggle"
            aria-label={
              playing ? "Pause demo" : state.ended ? "Replay demo" : "Play demo"
            }
            onClick={() => controllerRef.current?.toggle()}
          >
            {!playing && (
              <span className="big-play" aria-hidden="true">
                {state.ended ? "↻" : "▶"}
              </span>
            )}
          </button>
        )}
      </div>
      <div className="player-controls">
        <button
          disabled={!ready}
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => controllerRef.current?.toggle()}
        >
          {playing ? "Ⅱ" : "▶"}
        </button>
        <span className="time">
          {formatTime(ready ? state.elapsed : 0)} /{" "}
          {formatTime(ready ? state.duration : 0)}
        </span>
        <input
          className="seek"
          aria-label="Seek within demo"
          type="range"
          min="0"
          max={ready ? state.duration : 1}
          step="0.1"
          value={ready ? state.elapsed : 0}
          disabled={!ready}
          onChange={(event) =>
            controllerRef.current?.seek(Number(event.currentTarget.value))
          }
        />
        <select
          aria-label="Playback speed"
          value={speed}
          onChange={(event) => {
            const rate = Number(event.currentTarget.value);
            setSpeed(rate);
            if (videoRef.current) {
              videoRef.current.defaultPlaybackRate = rate;
              videoRef.current.playbackRate = rate;
            }
          }}
        >
          <option value="0.75">0.75×</option>
          <option value="1">1×</option>
          <option value="1.25">1.25×</option>
          <option value="1.5">1.5×</option>
          <option value="2">2×</option>
        </select>
        <button
          aria-label={muted ? "Unmute" : "Mute"}
          aria-pressed={muted}
          onClick={() => {
            if (videoRef.current) videoRef.current.muted = !muted;
            setMuted(!muted);
          }}
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        {media.captions && (
          <button
            aria-label="Captions"
            aria-pressed={captions}
            onClick={toggleCaptions}
          >
            CC
          </button>
        )}
        <button
          aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          aria-pressed={isFullscreen}
          onClick={fullscreen}
        >
          ⛶
        </button>
      </div>
      <p className="sr-only" role="status">
        {notice}
      </p>
    </div>
  );
}
