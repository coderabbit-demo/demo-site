/** Exercises configuration boundaries independently of the view layer. */
import { describe, expect, it } from "vitest";
import { featureEntries, formatTime, parseTour } from "./tour";

const feature = { id: "one", title: "One", mediaId: "demo" };
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

it.each([
  [0, "0:00"],
  [62.9, "1:02"],
  [-1, "0:00"],
  [NaN, "0:00"],
  [3600, "60:00"],
])("formats %s seconds", (seconds, expected) => {
  expect(formatTime(seconds)).toBe(expected);
});
