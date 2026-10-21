/** Verifies analytics initialization at the real application mount boundary. */
import { act } from "react";
import type * as ReactClient from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("./App", () => ({ App: () => <p>Feature tour</p> }));
vi.mock("react-dom/client", async (importOriginal) => {
  const actual = await importOriginal<typeof ReactClient>();
  return {
    ...actual,
    createRoot: vi.fn<typeof actual.createRoot>((container, options) => {
      mountedRoot = actual.createRoot(container, options);
      return mountedRoot;
    }),
  };
});

let mountedRoot: ReactClient.Root | undefined;

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("PROD", false);
  vi.stubGlobal("va", undefined);
  vi.stubGlobal("vaq", []);
  vi.stubGlobal("vam", undefined);
  document.body.innerHTML = '<div id="root"></div>';
});

afterEach(async () => {
  await act(async () => mountedRoot?.unmount());
  mountedRoot = undefined;
  document.body.innerHTML = "";
  document.head
    .querySelectorAll('script[data-sdkn="@vercel/analytics/react"]')
    .forEach((script) => script.remove());
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("loads one production analytics script alongside the tour under StrictMode", async () => {
  vi.stubEnv("PROD", true);
  await act(async () => {
    await import("./main");
  });

  expect(document.getElementById("root")?.textContent).toBe("Feature tour");
  const scripts = document.head.querySelectorAll(
    'script[src="/_vercel/insights/script.js"]',
  );
  expect(scripts).toHaveLength(1);
  expect(scripts[0]?.getAttribute("defer")).not.toBeNull();
  expect(
    document.head.querySelector('script[src*="script.debug.js"]'),
  ).toBeNull();
});

it("uses development analytics without a production intake in local development", async () => {
  await act(async () => {
    await import("./main");
  });

  expect(
    document.head.querySelectorAll('script[src*="script.debug.js"]'),
  ).toHaveLength(1);
  expect(
    document.head.querySelector('script[src="/_vercel/insights/script.js"]'),
  ).toBeNull();
});

it("does not initialize analytics when the application root is missing", async () => {
  document.body.innerHTML = "";
  await expect(import("./main")).rejects.toThrow(
    "Application root is missing.",
  );
  expect(document.head.querySelector("script[data-sdkn]")).toBeNull();
});
