/** Companion text remains readable, safe, and available without a PDF. */
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ScriptPanel } from "./ScriptPanel";
import type { Guide } from "./tour";

let container: HTMLDivElement;
let root: Root;
const guide: Guide = {
  title: "Review guide",
  download: "/guides/review.md",
  pdf: undefined,
  steps: [
    {
      title: "Open the review",
      start: 21.14,
      end: 60,
      do: ["Open the pull request", "Read the findings"],
      say: "<script>alert('test')</script>",
      see: "Findings appear next to the code.",
      links: [],
    },
  ],
};
beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});
describe("script companion", () => {
  it("renders text safely, timing, and a download when no PDF exists", async () => {
    await act(async () =>
      root.render(<ScriptPanel guide={guide} hidden={false} />),
    );
    expect(container.querySelector("aside")?.hidden).toBe(false);
    expect(container.textContent).toContain("0:21 – 1:00");
    expect(container.querySelectorAll("dt").length).toBe(3);
    expect(container.textContent).toContain(guide.steps[0]?.say);
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelectorAll("a").length).toBe(1);
    expect(container.querySelector("a")?.hasAttribute("download")).toBe(true);
    expect(
      container.querySelector('[role="region"]')?.getAttribute("tabindex"),
    ).toBe("0");
  });
  it("opens PDFs and reference links separately and hides the complete panel", async () => {
    const withLinks: Guide = {
      ...guide,
      pdf: "/guides/review.pdf",
      steps: guide.steps.map((step) => ({
        ...step,
        links: [{ label: "Documentation", url: "https://docs.coderabbit.ai" }],
      })),
    };
    await act(async () =>
      root.render(<ScriptPanel guide={withLinks} hidden={true} />),
    );
    expect(container.querySelector("aside")?.hidden).toBe(true);
    const external = container.querySelectorAll('a[target="_blank"]');
    expect(external.length).toBe(2);
    for (const link of external)
      expect(link.getAttribute("rel")).toBe("noreferrer");
    expect(container.textContent).toContain("Documentation");
  });
});
