/** Exercises configuration boundaries independently of the view layer. */
import { describe, expect, it } from "vitest";
import { featureEntries, formatTime, parseTour } from "./tour";

const feature = { id: "one", title: "One", mediaId: "demo" };
const step = {
  title: " First step ",
  start: 0,
  end: 12.5,
  do: [" Open the page "],
  say: " Narration ",
  see: " The result ",
  links: [{ label: " Reference ", url: "https://example.com/reference" }],
};
const guide = {
  title: " Demo script ",
  download: "/guides/demo.md",
  steps: [step],
};

/** Isolates embedded script validation from unrelated manifest fields. */
function parseGuideFixture(value: unknown): ReturnType<typeof parseTour> {
  return parseTour({
    ...config(),
    media: { demo: { src: "/demo.mp4", guide: value } },
  });
}
/** Builds a minimal valid manifest so each test can override one boundary. */
function config(): Record<string, unknown> {
  return {
    version: 1,
    title: "Tour",
    description: "Description",
    media: { demo: { src: "/media/demo.mp4" } },
    navigation: [feature],
  };
}

describe("tour configuration", () => {
  it("reads whole recordings, optional metadata, and ordered nested segments", () => {
    const result = parseTour({
      ...config(),
      media: {
        demo: {
          src: "https://example.com/demo.mp4",
          poster: "/poster.webp",
          captions: "/captions.vtt",
        },
        pending: { src: null },
      },
      navigation: [
        {
          id: "category",
          title: "Group",
          children: [
            { ...feature, start: 12, end: 30, description: " Detail " },
          ],
        },
        { ...feature, id: "two" },
      ],
    });
    const entries = featureEntries(result.navigation);
    expect(entries.map(({ feature }) => feature.id)).toEqual(["one", "two"]);
    expect(entries[0]?.parents.map((item) => item.id)).toEqual(["category"]);
    expect(entries[0]?.feature).toMatchObject({
      start: 12,
      end: 30,
      description: "Detail",
    });
    expect(entries[1]?.feature).toMatchObject({
      start: 0,
      end: null,
      description: "",
    });
    expect(result.media.get("demo")).toEqual({
      src: "https://example.com/demo.mp4",
      poster: "/poster.webp",
      captions: "/captions.vtt",
    });
    expect(result.media.get("pending")?.src).toBeNull();
  });

  it("allows an empty unpublished tour", () => {
    expect(
      parseTour({ ...config(), description: undefined, navigation: [] })
        .description,
    ).toBe("");
  });

  it("normalizes media IDs consistently with feature references", () => {
    const tour = parseTour({
      ...config(),
      media: { " demo ": { src: "/demo.mp4" } },
      navigation: [{ ...feature, mediaId: " demo " }],
    });
    expect(tour.media.get("demo")?.src).toBe("/demo.mp4");
    expect(featureEntries(tour.navigation)[0]?.feature.mediaId).toBe("demo");
  });

  it("rejects media IDs that collide after normalization", () => {
    expect(() =>
      parseTour({
        ...config(),
        media: { demo: { src: null }, " demo ": { src: "/demo.mp4" } },
      }),
    ).toThrow('duplicate ID "demo"');
  });

  it.each([null, [], 1, "tour"])("rejects a non-object root: %j", (root) => {
    expect(() => parseTour(root)).toThrow("expected an object");
  });
  it.each([
    [{ version: 2 }, "version"],
    [{ title: " " }, "title"],
    [{ media: [] }, "media"],
    [{ media: { demo: null } }, "media.demo"],
    [{ navigation: {} }, "navigation"],
    [{ navigation: [null] }, "navigation[0]"],
    [{ navigation: [{ ...feature, id: "Bad ID" }] }, "lowercase"],
    [{ navigation: [feature, feature] }, "duplicate ID"],
    [{ navigation: [{ ...feature, mediaId: "absent" }] }, "unknown recording"],
    [{ navigation: [{ ...feature, start: -1 }] }, "non-negative"],
    [{ navigation: [{ ...feature, start: Infinity }] }, "non-negative"],
    [{ navigation: [{ ...feature, start: "0" }] }, "non-negative"],
    [{ navigation: [{ ...feature, start: 4, end: 4 }] }, "greater than start"],
    [{ navigation: [{ ...feature, start: 4, end: 2 }] }, "greater than start"],
    [{ navigation: [{ ...feature, end: null }] }, "non-negative"],
    [{ navigation: [{ ...feature, children: [] }] }, "categories cannot"],
    [
      { navigation: [{ id: "group", title: "Group", start: 0, children: [] }] },
      "categories cannot",
    ],
    [
      { navigation: [{ id: "group", title: "Group", end: 1, children: [] }] },
      "categories cannot",
    ],
  ])("reports the location of invalid data: %j", (override, message) => {
    expect(() => parseTour({ ...config(), ...override })).toThrow(message);
  });

  it.each([
    "javascript:alert(1)",
    "http://example.com/video",
    "//example.com/video",
    "/\\example.com/video",
    "https://user:pass@example.com/video",
    "relative.mp4",
    "",
  ])("rejects unsafe or ambiguous media URLs: %s", (src) => {
    expect(() =>
      parseTour({ ...config(), media: { demo: { src } } }),
    ).toThrow();
  });
  it.each(["src", "poster", "captions"])(
    "reports the field path for a malformed %s URL",
    (field) => {
      expect(() =>
        parseTour({
          ...config(),
          media: { demo: { src: "/demo.mp4", [field]: "https://" } },
        }),
      ).toThrow(
        `media.demo.${field}: use a root-relative path or an HTTPS URL without credentials.`,
      );
    },
  );

  it("limits nesting and total entries", () => {
    let navigation: unknown[] = [feature];
    for (let i = 0; i < 9; i += 1)
      navigation = [
        { id: `group-${i.toString()}`, title: "Group", children: navigation },
      ];
    expect(() => parseTour({ ...config(), navigation })).toThrow(
      "nesting depth",
    );
    expect(() =>
      parseTour({
        ...config(),
        navigation: Array.from({ length: 501 }, (_, index) => ({
          ...feature,
          id: `item-${index.toString()}`,
        })),
      }),
    ).toThrow("500 items");
  });
});

describe("embedded script guides", () => {
  it("normalizes script text and retains timestamps and safe document links", () => {
    expect(
      parseGuideFixture({
        ...guide,
        pdf: "https://example.com/demo.pdf",
      }).media.get("demo")?.guide,
    ).toEqual({
      title: "Demo script",
      download: "/guides/demo.md",
      pdf: "https://example.com/demo.pdf",
      steps: [
        {
          ...step,
          title: "First step",
          do: ["Open the page"],
          say: "Narration",
          see: "The result",
          links: [{ label: "Reference", url: "https://example.com/reference" }],
        },
      ],
    });
  });

  it("allows omitted guides, omitted PDFs, and steps without actions or links", () => {
    expect(parseTour(config()).media.get("demo")?.guide).toBeUndefined();
    expect(
      parseGuideFixture({
        ...guide,
        steps: [{ ...step, do: [], links: [] }],
      }).media.get("demo")?.guide,
    ).toMatchObject({ pdf: undefined, steps: [{ do: [], links: [] }] });
  });

  it.each([null, [], "script", 1])("rejects non-object guides: %j", (value) => {
    expect(() => parseGuideFixture(value)).toThrow(
      "media.demo.guide: expected an object",
    );
  });

  it.each([
    [{ title: " " }, ".title"],
    [{ download: undefined }, ".download"],
    [{ download: "javascript:alert(1)" }, ".download"],
    [{ pdf: null }, ".pdf"],
    [{ pdf: "//example.com/doc.pdf" }, ".pdf"],
    [{ steps: undefined }, ".steps: expected an array"],
    [{ steps: [] }, ".steps: expected 1 to 500 items"],
    [
      { steps: Array.from({ length: 501 }, () => step) },
      ".steps: expected 1 to 500 items",
    ],
    [{ steps: [null] }, ".steps[0]: expected an object"],
  ])("rejects malformed guide metadata %#", (override, path) => {
    expect(() => parseGuideFixture({ ...guide, ...override })).toThrow(
      `media.demo.guide${path}`,
    );
  });

  it.each([
    [{ title: "" }, ".title"],
    [{ say: 7 }, ".say"],
    [{ see: " " }, ".see"],
    [{ start: -1 }, ".start"],
    [{ start: NaN }, ".start"],
    [{ start: "0" }, ".start"],
    [{ end: Infinity }, ".end"],
    [{ end: undefined }, ".end"],
    [{ end: 0 }, ".end: must be greater than start"],
    [{ start: 20 }, ".end: must be greater than start"],
    [{ do: "Click" }, ".do: expected an array"],
    [{ do: [null] }, ".do[0]"],
    [{ do: [" "] }, ".do[0]"],
    [
      { do: Array.from({ length: 101 }, () => "Click") },
      ".do: expected 0 to 100 items",
    ],
    [{ links: undefined }, ".links: expected an array"],
    [
      { links: Array.from({ length: 101 }, () => ({})) },
      ".links: expected 0 to 100 items",
    ],
    [{ links: [null] }, ".links[0]: expected an object"],
    [{ links: [{ label: "", url: "/reference" }] }, ".links[0].label"],
    [
      { links: [{ label: "Reference", url: "https://user:pass@example.com" }] },
      ".links[0].url",
    ],
    [
      { links: [{ label: "Reference", url: "http://example.com" }] },
      ".links[0].url",
    ],
    [{ links: [{ label: "Reference", url: "https://" }] }, ".links[0].url"],
  ])(
    "reports malformed steps at their exact field path %#",
    (override, path) => {
      expect(() =>
        parseGuideFixture({ ...guide, steps: [{ ...step, ...override }] }),
      ).toThrow(`media.demo.guide.steps[0]${path}`);
    },
  );

  it("accepts the maximum step and collection sizes", () => {
    const boundary = {
      ...step,
      do: Array.from({ length: 100 }, () => "Click"),
      links: Array.from({ length: 100 }, () => ({
        label: "Reference",
        url: "/reference",
      })),
    };
    expect(
      parseGuideFixture({
        ...guide,
        steps: Array.from({ length: 500 }, () => boundary),
      }).media.get("demo")?.guide?.steps,
    ).toHaveLength(500);
  });
});

it.each([
  [0, "0:00"],
  [59.9, "0:59"],
  [60, "1:00"],
  [62.9, "1:02"],
  [-1, "0:00"],
  [NaN, "0:00"],
  [3600, "60:00"],
])("formats %s seconds", (seconds, expected) => {
  expect(formatTime(seconds)).toBe(expected);
});
