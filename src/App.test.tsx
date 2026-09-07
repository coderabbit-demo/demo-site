/** Verifies navigation, loading, browser history, and media controls as user-visible behavior. */
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { Player } from "./Player";
import type { Feature, Media } from "./tour";

let container: HTMLDivElement;
let root: Root;

/** Builds a nested two-feature tour with either pending or playable media. */
function manifest(src: string | null = null) {
  return {
    version: 1,
    title: "Feature tour",
    description: "Four features",
    media: { demo: { src } },
    navigation: [
      {
        id: "group",
        title: "Review",
        children: [
          {
            id: "nested",
            title: "Details",
            children: [
              {
                id: "one",
                title: "First feature",
                description: "First details",
                mediaId: "demo",
                start: 10,
                end: 20,
              },
            ],
          },
          { id: "two", title: "Second feature", mediaId: "demo" },
        ],
      },
    ],
  };
}

/** Queries a required element and verifies its runtime DOM type. */
function element<T extends Element>(
  selector: string,
  type: { new (...args: never[]): T },
): T {
  const result = container.querySelector(selector);
  if (!(result instanceof type)) throw new Error(`Missing ${selector}`);
  return result;
}

/** Finds a button by its visible text or accessible label, failing if absent. */
function button(text: string): HTMLButtonElement {
  const result = [...container.querySelectorAll("button")].find(
    (item) =>
      item.textContent?.includes(text) ||
      item.getAttribute("aria-label") === text,
  );
  if (!result) throw new Error(`Missing button ${text}`);
  return result;
}

/** Dispatches a user click and flushes React updates before assertions. */
async function click(target: HTMLElement): Promise<void> {
  await act(async () => {
    target.click();
  });
}
/** Dispatches a named DOM event within React's update boundary. */
async function event(target: HTMLElement, name: string): Promise<void> {
  await act(async () => {
    target.dispatchEvent(new Event(name, { bubbles: true }));
  });
}
/** Supplies a mocked manifest response and mounts the application for a test. */
async function load(data: unknown = manifest()): Promise<void> {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(data) }),
  );
  await act(async () => {
    root.render(<App />);
  });
}

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  window.history.replaceState(null, "", "/");
  vi.spyOn(HTMLDialogElement.prototype, "close").mockImplementation(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute("open");
  });
  vi.spyOn(HTMLDialogElement.prototype, "showModal").mockImplementation(
    function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(
    () => undefined,
  );
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("tour navigation", () => {
  it("opens nested ancestors, renders pending media, and navigates with shareable URLs", async () => {
    window.history.replaceState(null, "", "/?feature=one");
    await load();
    expect(container.querySelector("h1")?.textContent).toBe("First feature");
    expect(container.textContent).toContain("Demo coming soon");
    expect(container.textContent).toContain("0:10");
    expect(button("Previous").disabled).toBe(true);
    await click(button("Next feature"));
    expect(window.location.search).toBe("?feature=two");
    expect(document.title).toBe("Second feature · CodeRabbit");
    expect(button("Next feature").disabled).toBe(true);
    await click(button("Previous"));
    expect(window.location.search).toBe("?feature=one");
    await click(button("Second feature"));
    expect(container.querySelector("h1")?.textContent).toBe("Second feature");
  });

  it("normalizes unknown links and handles history without creating extra entries", async () => {
    window.history.replaceState(null, "", "/?feature=removed&other=keep");
    await load();
    expect(window.location.search).toBe("?feature=one&other=keep");
    const push = vi.spyOn(window.history, "pushState");
    window.history.replaceState(null, "", "/?feature=two");
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(container.querySelector("h1")?.textContent).toBe("Second feature");
    expect(push).not.toHaveBeenCalled();
  });

  it("opens and closes categories and the mobile feature drawer", async () => {
    await load();
    const category = button("Review");
    await click(category);
    expect(category.getAttribute("aria-expanded")).toBe("false");
    await click(category);
    expect(category.getAttribute("aria-expanded")).toBe("true");
    await click(button("Browse features"));
    expect(container.querySelector("dialog")?.hasAttribute("open")).toBe(true);
    await click(button("Close feature menu"));
    expect(container.querySelector("dialog")?.hasAttribute("open")).toBe(false);
  });

  it("filters titles, descriptions and category names, and explains empty results", async () => {
    await load();
    const search = element('input[type="search"]', HTMLInputElement);
    for (const [query, expected] of [
      ["First", "First feature"],
      ["Review", "Second feature"],
      ["xyz", "No features match"],
    ]) {
      await act(async () => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )?.set?.call(search, query);
        search.dispatchEvent(new Event("input", { bubbles: true }));
      });
      expect(container.querySelector("aside nav")?.textContent).toContain(
        expected,
      );
    }
  });

  it("copies a stable feature link and handles clipboard failures", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    await load();
    await click(button("Copy link"));
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("?feature=one"),
    );
    expect(container.textContent).toContain("Link copied");
    writeText.mockRejectedValue(new Error("Denied"));
    await click(button("Copy link"));
    expect(container.textContent).toContain("Couldn’t copy");
    vi.stubGlobal("navigator", {});
    await click(button("Copy link"));
    expect(container.textContent).toContain("Copy the page address");
  });

  it("shows an empty tour without invalid controls", async () => {
    await load({ ...manifest(), navigation: [] });
    expect(container.textContent).toContain("Your feature tour is on its way");
    expect(container.textContent).not.toContain("No features match");
    expect(container.querySelector("video")).toBeNull();
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });

  it("supports root-level features without categories", async () => {
    await load({
      ...manifest(),
      navigation: [{ id: "root", title: "Root", mediaId: "demo" }],
    });
    expect(container.querySelector("h1")?.textContent).toBe("Root");
    expect(container.querySelector(".breadcrumb")?.textContent).toContain(
      "Explore",
    );
  });
});

describe("manifest loading", () => {
  it("shows loading and retries a failed request", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve(manifest()) });
    vi.stubGlobal("fetch", fetch);
    await act(async () => {
      root.render(<App />);
    });
    expect(container.textContent).toContain("The tour couldn’t load");
    await click(button("Try again"));
    expect(container.querySelector("h1")?.textContent).toBe("First feature");
  });

  it("reports invalid JSON and non-Error rejections", async () => {
    await load({ version: 7 });
    expect(container.textContent).toContain("version: expected 1");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("offline"));
    await click(button("Try again"));
    expect(container.textContent).toContain("The feature list is unavailable");
  });

  it.each([
    [{ media: { demo: { src: "https://" } } }, "media.demo.src"],
    [
      {
        navigation: [
          { id: "one", title: "Invalid range", mediaId: "demo", start: -1 },
        ],
      },
      "navigation[0].start",
    ],
  ])(
    "rejects invalid manifests before mounting playback: %j",
    async (override, path) => {
      const play = vi.spyOn(HTMLMediaElement.prototype, "play");
      await load({ ...manifest("/demo.mp4"), ...override });
      expect(container.querySelector('[role="alert"]')?.textContent).toContain(
        path,
      );
      expect(container.querySelector("video")).toBeNull();
      expect(play).not.toHaveBeenCalled();
    },
  );

  it.each([true, false])(
    "aborts a pending request on unmount (success: %s)",
    async (success) => {
      let settle: (() => void) | undefined;
      let signal: AbortSignal | undefined;
      vi.stubGlobal(
        "fetch",
        vi.fn((_url: string, options: RequestInit) => {
          signal = options.signal ?? undefined;
          return new Promise((resolve, reject) => {
            settle = () => {
              if (success)
                resolve({ ok: true, json: () => Promise.resolve(manifest()) });
              else reject(new Error("Aborted"));
            };
          });
        }),
      );
      await act(async () => {
        root.render(<App />);
      });
      expect(container.textContent).toContain("Loading your feature tour");
      await act(async () => {
        root.render(null);
      });
      expect(signal?.aborted).toBe(true);
      await act(async () => {
        settle?.();
      });
      expect(container.textContent).toBe("");
    },
  );
});

const playable: Feature = {
  kind: "feature",
  id: "demo",
  title: "Demo",
  description: "",
  mediaId: "video",
  start: 10,
  end: 20,
};
const source: Media = {
  src: "/demo.mp4",
  poster: undefined,
  captions: "/captions.vtt",
};

/** Mounts a player with controlled media and captures its progress and completion callbacks. */
async function renderPlayer(media = source) {
  const onComplete = vi.fn();
  const onProgress = vi.fn();
  await act(async () => {
    root.render(
      <Player
        feature={playable}
        media={media}
        autoplay={false}
        onComplete={onComplete}
        onProgress={onProgress}
      />,
    );
  });
  const video = element("video", HTMLVideoElement);
  let paused = true;
  Object.defineProperties(video, {
    duration: { value: 60 },
    paused: { get: () => paused },
  });
  vi.spyOn(video, "play").mockImplementation(() => {
    paused = false;
    video.dispatchEvent(new Event("play"));
    return Promise.resolve();
  });
  vi.spyOn(video, "pause").mockImplementation(() => {
    paused = true;
    video.dispatchEvent(new Event("pause"));
  });
  await event(video, "loadedmetadata");
  return { video, onComplete, onProgress };
}

describe("video controls", () => {
  it("toggles playback from the video surface without toggling when controls are clicked", async () => {
    const { video } = await renderPlayer();
    await click(element(".video-toggle", HTMLButtonElement));
    expect(video.paused).toBe(false);
    expect(button("Pause demo")).toBeTruthy();
    await click(button("Mute"));
    expect(video.paused).toBe(false);
    await click(element(".video-toggle", HTMLButtonElement));
    expect(video.paused).toBe(true);
    expect(button("Play demo")).toBeTruthy();
    await click(element(".video-toggle", HTMLButtonElement));
    expect(video.paused).toBe(false);
  });

  it("keeps initial and manually selected recordings paused until Play", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    await load(manifest("/demo.mp4"));
    const first = element("video", HTMLVideoElement);
    Object.defineProperty(first, "duration", { value: 60 });
    await event(first, "loadedmetadata");
    expect(play).not.toHaveBeenCalled();
    await click(button("Next feature"));
    const next = element("video", HTMLVideoElement);
    Object.defineProperty(next, "duration", { value: 60 });
    await event(next, "loadedmetadata");
    await click(button("First feature"));
    const selected = element("video", HTMLVideoElement);
    Object.defineProperty(selected, "duration", { value: 60 });
    await event(selected, "loadedmetadata");
    expect(play).not.toHaveBeenCalled();
    await click(button("Play demo"));
    expect(play).toHaveBeenCalledOnce();
  });

  it("plays, pauses, seeks, replays and displays relative progress", async () => {
    const { video, onComplete, onProgress } = await renderPlayer();
    await click(button("Play demo"));
    expect(button("Pause")).toBeTruthy();
    await click(button("Pause"));
    expect(button("Play demo")).toBeTruthy();
    const seek = element('input[type="range"]', HTMLInputElement);
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set?.call(seek, "5");
      seek.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(video.currentTime).toBe(15);
    expect(onProgress).toHaveBeenLastCalledWith(0.5);
    video.currentTime = 20;
    await event(video, "timeupdate");
    expect(onComplete).toHaveBeenCalledOnce();
    await click(button("Replay demo"));
    expect(video.currentTime).toBe(10);
  });

  it("changes speed, mute and captions without resetting the clip", async () => {
    const { video } = await renderPlayer();
    const track = { mode: "disabled" };
    Object.defineProperty(video, "textTracks", { value: [track] });
    const speed = element("select", HTMLSelectElement);
    speed.value = "1.5";
    await event(speed, "change");
    expect(video.playbackRate).toBe(1.5);
    await click(button("Mute"));
    expect(video.muted).toBe(true);
    await click(button("Unmute"));
    expect(video.muted).toBe(false);
    await click(button("Captions"));
    expect(track.mode).toBe("showing");
    await click(button("Captions"));
    expect(track.mode).toBe("disabled");
  });

  it("handles fullscreen support, success and denial", async () => {
    await renderPlayer();
    await click(button("Fullscreen"));
    expect(container.textContent).toContain("Fullscreen is unavailable");
    const stage = element(".player", HTMLDivElement);
    const request = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(stage, "requestFullscreen", { value: request });
    await click(button("Fullscreen"));
    expect(request).toHaveBeenCalledOnce();
    request.mockRejectedValue(new Error("Denied"));
    await click(button("Fullscreen"));
    expect(container.textContent).toContain("Fullscreen couldn’t open");
  });

  it("exits fullscreen with the same button and tracks Escape and rejected exits", async () => {
    await renderPlayer();
    const stage = element(".player", HTMLDivElement);
    let current: Element | null = null;
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      get: () => current,
    });
    const exit = vi.fn(() => {
      current = null;
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    });
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exit,
    });
    const request = vi.fn(() => {
      current = stage;
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    });
    Object.defineProperty(stage, "requestFullscreen", { value: request });
    try {
      await click(button("Fullscreen"));
      expect(button("Exit fullscreen").getAttribute("aria-pressed")).toBe(
        "true",
      );
      await click(button("Exit fullscreen"));
      expect(exit).toHaveBeenCalledOnce();
      expect(request).toHaveBeenCalledOnce();
      expect(button("Fullscreen").getAttribute("aria-pressed")).toBe("false");
      await click(button("Fullscreen"));
      current = null;
      await act(async () => {
        document.dispatchEvent(new Event("fullscreenchange"));
      });
      expect(button("Fullscreen").getAttribute("aria-pressed")).toBe("false");
      await click(button("Fullscreen"));
      exit.mockRejectedValueOnce(new Error("Denied"));
      await click(button("Exit fullscreen"));
      expect(container.textContent).toContain("Fullscreen couldn’t close");
      expect(button("Exit fullscreen").getAttribute("aria-pressed")).toBe(
        "true",
      );
      await click(button("Exit fullscreen"));
      expect(container.textContent).not.toContain("Fullscreen couldn’t close");
    } finally {
      Reflect.deleteProperty(document, "fullscreenElement");
      Reflect.deleteProperty(document, "exitFullscreen");
    }
  });

  it("retries failed media with a new element", async () => {
    const { video } = await renderPlayer({ ...source, captions: undefined });
    expect(container.querySelector("track")).toBeNull();
    await event(video, "error");
    expect(container.textContent).toContain("The recording couldn’t load");
    await click(button("Retry recording"));
    expect(element("video", HTMLVideoElement)).not.toBe(video);
    expect(container.textContent).toContain("Loading recording");
  });

  it("advances only when the viewer enables automatic playback", async () => {
    await load(manifest("/demo.mp4"));
    const first = element("video", HTMLVideoElement);
    Object.defineProperty(first, "duration", { value: 60 });
    await event(first, "loadedmetadata");
    first.currentTime = 20;
    await event(first, "timeupdate");
    expect(container.querySelector("h1")?.textContent).toBe("First feature");
    await click(element('input[type="checkbox"]', HTMLInputElement));
    await click(button("Replay demo"));
    first.currentTime = 20;
    await event(first, "timeupdate");
    expect(container.querySelector("h1")?.textContent).toBe("Second feature");
    const second = element("video", HTMLVideoElement);
    Object.defineProperty(second, "duration", { value: 60 });
    await event(second, "loadedmetadata");
    second.currentTime = 60;
    await event(second, "ended");
    expect(container.querySelector("h1")?.textContent).toBe("Second feature");
  });
});
