/** Controls a single media element within a validated clip, with teardown for every async path. */
export type PlaybackState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | {
      readonly status: "ready";
      readonly playing: boolean;
      readonly ended: boolean;
      readonly elapsed: number;
      readonly duration: number;
    };

export interface PlaybackController {
  readonly toggle: () => void;
  readonly seek: (elapsed: number) => void;
  readonly dispose: () => void;
}

interface PlaybackOptions {
  readonly start: number;
  readonly end: number | null;
  readonly autoplay: boolean;
  readonly update: (state: PlaybackState) => void;
  readonly onComplete: () => void;
}

/** Owns media listeners and an animation-frame boundary check; dispose before replacing the feature. */
export function attachPlayback(
  video: HTMLVideoElement,
  options: PlaybackOptions,
): PlaybackController {
  let disposed = false;
  let bounds: { start: number; end: number } | null = null;
  let completed = false;
  let frame: number | null = null;
  let playRequest = 0;

  /** Publishes clip-relative state only while the controller has valid bounds. */
  function emit(): void {
    if (disposed || !bounds) return;
    options.update({
      status: "ready",
      playing: !video.paused && !completed,
      ended: completed,
      elapsed: Math.max(
        0,
        Math.min(video.currentTime - bounds.start, bounds.end - bounds.start),
      ),
      duration: bounds.end - bounds.start,
    });
  }

  /** Stops playback and invalidates controls after an unrecoverable media error. */
  function fail(message: string): void {
    if (disposed) return;
    bounds = null;
    video.pause();
    options.update({ status: "error", message });
  }

  /** Stops at the clip boundary and notifies completion at most once per playback. */
  function finish(): void {
    if (!bounds || completed || disposed) return;
    completed = true;
    video.pause();
    video.currentTime = bounds.end;
    emit();
    options.onComplete();
  }

  /** Enforces clip bounds and synchronizes state after media events or frame ticks. */
  function sync(): void {
    if (!bounds || disposed) return;
    if (video.currentTime >= bounds.end) {
      finish();
      return;
    }
    if (video.currentTime < bounds.start) video.currentTime = bounds.start;
    emit();
  }

  /** Checks the boundary each animation frame until playback pauses or completes. */
  function tick(): void {
    frame = null;
    sync();
    if (!disposed && !video.paused && !completed)
      frame = requestAnimationFrame(tick);
  }

  /** Starts a single boundary-check loop when the media begins playing. */
  function onPlay(): void {
    if (disposed || !bounds) return;
    if (frame === null) frame = requestAnimationFrame(tick);
    emit();
  }

  /** Requests playback while ignoring stale rejections and handling late teardown. */
  function play(): void {
    const request = ++playRequest;
    void video
      .play()
      .then(() => {
        if (disposed) video.pause();
      })
      .catch(() => {
        if (disposed || request !== playRequest) return;
        // Autoplay may be blocked. Keep controls available so a direct click can retry.
        emit();
      });
  }

  /** Validates the loaded duration, sets the clip start, and optionally requests playback. */
  function metadata(): void {
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      fail("This recording does not have a playable duration.");
      return;
    }
    const end = options.end ?? video.duration;
    if (options.start >= end || end > video.duration) {
      fail(
        "This demo’s time range extends beyond the recording. Please try another feature.",
      );
      return;
    }
    bounds = { start: options.start, end };
    completed = false;
    video.currentTime = options.start;
    emit();
    if (options.autoplay) play();
  }

  /** Converts a native media failure into a recoverable player-facing message. */
  function onError(): void {
    fail("The recording couldn’t load. Check your connection and try again.");
  }

  const listeners: readonly [string, () => void][] = [
    ["loadedmetadata", metadata],
    ["timeupdate", sync],
    ["seeking", sync],
    ["play", onPlay],
    ["pause", emit],
    ["ended", finish],
    ["error", onError],
  ];
  for (const [event, listener] of listeners)
    video.addEventListener(event, listener);
  if (video.readyState >= 1) metadata();

  return {
    /** Pauses active playback or plays, resetting a completed clip for replay. */
    toggle(): void {
      if (!bounds || disposed) return;
      if (!video.paused) {
        ++playRequest;
        video.pause();
        return;
      }
      if (completed) {
        completed = false;
        video.currentTime = bounds.start;
      }
      play();
    },
    /** Seeks in clip-relative seconds; endpoint scrubs stop without firing completion. */
    seek(elapsed: number): void {
      if (!bounds || disposed || !Number.isFinite(elapsed)) return;
      const position =
        bounds.start +
        Math.max(0, Math.min(elapsed, bounds.end - bounds.start));
      // An endpoint scrub stops here without advancing the tour, including
      // when the browser later delivers seeking, timeupdate, or ended events.
      completed = position >= bounds.end;
      if (completed) {
        ++playRequest;
        video.pause();
      }
      video.currentTime = position;
      emit();
    },
    /** Removes listeners, cancels the frame loop, and stops the owned media element. */
    dispose(): void {
      disposed = true;
      ++playRequest;
      if (frame !== null) cancelAnimationFrame(frame);
      for (const [event, listener] of listeners)
        video.removeEventListener(event, listener);
      video.pause();
    },
  };
}
