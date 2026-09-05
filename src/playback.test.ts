/** Checks clip playback against real media event contracts with a controlled media element. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { attachPlayback } from "./playback";
import type { PlaybackState } from "./playback";

function fixture(
  start = 10,
  end: number | null = 20,
  autoplay = false,
  duration = 60,
  readyState = 0,
) {
  const video = document.createElement("video");
  let paused = true;
  Object.defineProperties(video, {
    duration: { value: duration },
    readyState: { value: readyState },
    paused: { get: () => paused },
  });
  const play = vi.spyOn(video, "play").mockImplementation(() => {
    paused = false;
    video.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  const pause = vi.spyOn(video, "pause").mockImplementation(() => {
    paused = true;
    video.dispatchEvent(new Event("pause"));
  });
  const states: PlaybackState[] = [];
  const onComplete = vi.fn();
  const controller = attachPlayback(video, {
    start,
    end,
    autoplay,
    update: (state) => {
      states.push(state);
    },
    onComplete,
  });
  return {
    video,
    play,
    pause,
    states,
    onComplete,
    controller,
    event: (name: string): void => {
      video.dispatchEvent(new Event(name));
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("clip playback", () => {
  it("seeks to a segment start, exposes relative time, pauses at the end, and replays", async () => {
    const f = fixture();
    f.event("loadedmetadata");
    expect(f.video.currentTime).toBe(10);
    expect(f.states.at(-1)).toMatchObject({
      status: "ready",
      elapsed: 0,
      duration: 10,
      playing: false,
    });
    f.controller.toggle();
    await Promise.resolve();
    expect(f.states.at(-1)).toMatchObject({ playing: true });
    f.video.currentTime = 14;
    f.event("timeupdate");
    expect(f.states.at(-1)).toMatchObject({ elapsed: 4 });
    f.controller.toggle();
    expect(f.states.at(-1)).toMatchObject({ playing: false });
    f.video.currentTime = 23;
    f.event("timeupdate");
    f.event("ended");
    expect(f.video.currentTime).toBe(20);
    expect(f.onComplete).toHaveBeenCalledTimes(1);
    f.controller.toggle();
    expect(f.video.currentTime).toBe(10);
    f.controller.dispose();
    await Promise.resolve();
  });

  it("supports full recordings, already-loaded metadata and autoplay", async () => {
    const f = fixture(0, null, true, 60, 1);
    await Promise.resolve();
    expect(f.play).toHaveBeenCalledOnce();
    expect(f.states.at(-1)).toMatchObject({ duration: 60, playing: true });
    f.controller.dispose();
  });

  it.each([0, Infinity, NaN])(
    "rejects an invalid media duration %s",
    (duration) => {
      const f = fixture(0, null, false, duration);
      f.event("loadedmetadata");
      const state = f.states.at(-1);
      expect(state?.status).toBe("error");
      if (state?.status === "error")
        expect(state.message).toContain("duration");
      f.controller.dispose();
    },
  );

  it.each([
    [60, null],
    [20, 10],
    [0, 61],
  ])("rejects an out-of-bounds clip %s to %s", (start, end) => {
    const f = fixture(start, end);
    f.event("loadedmetadata");
    const state = f.states.at(-1);
    expect(state?.status).toBe("error");
    if (state?.status === "error")
      expect(state.message).toContain("time range");
    f.controller.dispose();
  });

  it("clamps seeking to the selected clip and ignores non-finite input", () => {
    const f = fixture();
    f.controller.seek(4);
    f.controller.toggle();
    f.event("timeupdate");
    f.event("play");
    f.event("ended");
    f.event("loadedmetadata");
    f.controller.seek(NaN);
    f.controller.seek(-5);
    expect(f.video.currentTime).toBe(10);
    f.video.currentTime = 2;
    f.event("seeking");
    expect(f.video.currentTime).toBe(10);
    f.controller.seek(100);
    expect(f.video.currentTime).toBe(20);
    f.controller.seek(3);
    expect(f.states.at(-1)).toMatchObject({ ended: false, elapsed: 3 });
    f.controller.dispose();
    f.controller.toggle();
    f.controller.seek(0);
    expect(f.video.currentTime).toBe(13);
  });

  it("keeps the play control usable after autoplay rejection", async () => {
    const f = fixture(10, 20, true);
    f.play.mockRejectedValue(new DOMException("Blocked", "NotAllowedError"));
    f.event("loadedmetadata");
    await Promise.resolve();
    await Promise.resolve();
    expect(f.states.at(-1)).toMatchObject({ status: "ready", playing: false });
    f.controller.dispose();
  });

  it("cleans up pending playback and ignores stale rejections", async () => {
    const f = fixture();
    let reject: ((reason: Error) => void) | undefined;
    f.play.mockImplementation(
      () =>
        new Promise<void>((_resolve, rejectPromise) => {
          reject = rejectPromise;
        }),
    );
    f.event("loadedmetadata");
    f.controller.toggle();
    f.controller.dispose();
    const count = f.states.length;
    reject?.(new Error("Late failure"));
    await Promise.resolve();
    await Promise.resolve();
    f.event("timeupdate");
    f.event("loadedmetadata");
    f.event("error");
    expect(f.states).toHaveLength(count);
  });

  it("reports a load failure and disables playback", () => {
    const f = fixture();
    f.event("loadedmetadata");
    f.event("error");
    f.controller.toggle();
    expect(f.states.at(-1)).toMatchObject({ status: "error" });
    expect(f.play).not.toHaveBeenCalled();
    f.controller.dispose();
  });

  it("checks boundaries on animation frames, stops and cancels on teardown", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        callbacks.push(callback);
        return callbacks.length;
      }),
    );
    const cancel = vi.fn();
    vi.stubGlobal("cancelAnimationFrame", cancel);
    const f = fixture();
    f.event("loadedmetadata");
    f.controller.toggle();
    f.event("play");
    expect(callbacks).toHaveLength(1);
    callbacks[0]?.(0);
    expect(callbacks).toHaveLength(2);
    f.video.currentTime = 21;
    callbacks[1]?.(0);
    expect(f.onComplete).toHaveBeenCalledOnce();
    f.controller.toggle();
    f.controller.dispose();
    expect(cancel).toHaveBeenCalled();
  });
});
