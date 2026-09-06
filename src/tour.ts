/** Validates the public tour manifest and derives ordered navigation data. Times are seconds. */
export interface Media {
  readonly src: string | null;
  readonly poster: string | undefined;
  readonly captions: string | undefined;
}

export interface Feature {
  readonly kind: "feature";
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly mediaId: string;
  readonly start: number;
  readonly end: number | null;
}

export interface Category {
  readonly kind: "category";
  readonly id: string;
  readonly title: string;
  readonly children: readonly NavigationNode[];
}

export type NavigationNode = Feature | Category;

export interface Tour {
  readonly title: string;
  readonly description: string;
  readonly media: ReadonlyMap<string, Media>;
  readonly navigation: readonly NavigationNode[];
}

export interface FeatureEntry {
  readonly feature: Feature;
  readonly parents: readonly Category[];
}

/** Copies an input object's own fields or reports the invalid field path. */
function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${path}: expected an object.`);
  }
  return Object.fromEntries(Object.entries(value));
}

/** Trims required text and rejects blank or non-string input. */
function text(value: unknown, path: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${path}: expected non-empty text.`);
  return value.trim();
}

/** Validates a stable lowercase, hyphen-separated manifest identifier. */
function identifier(value: unknown, path: string): string {
  const result = text(value, path);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result))
    throw new Error(`${path}: use lowercase letters, numbers, and hyphens.`);
  return result;
}

/** Accepts root-relative or credential-free HTTPS media URLs with path-specific errors. */
function source(value: unknown, path: string): string {
  const result = text(value, path);
  const message = `${path}: use a root-relative path or an HTTPS URL without credentials.`;
  let url: URL;
  try {
    url = new URL(result, "https://tour.invalid");
  } catch {
    throw new Error(message);
  }
  const local =
    result.startsWith("/") &&
    !result.startsWith("//") &&
    !result.includes("\\");
  if (
    (!local && !result.startsWith("https://")) ||
    url.protocol !== "https:" ||
    url.username ||
    url.password
  ) {
    throw new Error(message);
  }
  return result;
}

/** Rejects negative, non-numeric, or non-finite timestamp values. */
function seconds(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    throw new Error(`${path}: expected finite, non-negative seconds.`);
  return value;
}

/** Validates each recording's source and optional poster and caption locations. */
function parseMedia(value: unknown): ReadonlyMap<string, Media> {
  const ids = new Set<string>();
  return new Map(
    Object.entries(record(value, "media")).map(([rawId, raw]) => {
      const id = identifier(rawId, `media.${rawId}`);
      if (ids.has(id)) throw new Error(`media.${rawId}: duplicate ID "${id}".`);
      ids.add(id);
      const item = record(raw, `media.${id}`);
      return [
        id,
        {
          src: item.src === null ? null : source(item.src, `media.${id}.src`),
          poster:
            item.poster === undefined
              ? undefined
              : source(item.poster, `media.${id}.poster`),
          captions:
            item.captions === undefined
              ? undefined
              : source(item.captions, `media.${id}.captions`),
        },
      ];
    }),
  );
}

/** Parses untrusted JSON; throws a path-specific error on invalid configuration. */
export function parseTour(value: unknown): Tour {
  const root = record(value, "tour");
  if (root.version !== 1) throw new Error("version: expected 1.");
  const media = parseMedia(root.media);
  const ids = new Set<string>();

  /** Parses nested categories and clips while enforcing shared size and ID constraints. */
  function nodes(
    value: unknown,
    path: string,
    depth: number,
  ): readonly NavigationNode[] {
    if (!Array.isArray(value)) throw new Error(`${path}: expected an array.`);
    if (depth > 8) throw new Error(`${path}: maximum nesting depth is 8.`);
    return value.map((raw: unknown, index: number): NavigationNode => {
      const location = `${path}[${index.toString()}]`;
      const item = record(raw, location);
      const id = identifier(item.id, `${location}.id`);
      if (ids.has(id)) throw new Error(`${location}.id: duplicate ID "${id}".`);
      ids.add(id);
      if (ids.size > 500)
        throw new Error("navigation: maximum size is 500 items.");
      const title = text(item.title, `${location}.title`);
      if (item.children !== undefined) {
        if (
          item.mediaId !== undefined ||
          item.start !== undefined ||
          item.end !== undefined
        )
          throw new Error(
            `${location}: categories cannot have playback fields.`,
          );
        return {
          kind: "category",
          id,
          title,
          children: nodes(item.children, `${location}.children`, depth + 1),
        };
      }
      const mediaId = identifier(item.mediaId, `${location}.mediaId`);
      if (!media.has(mediaId))
        throw new Error(`${location}.mediaId: unknown recording "${mediaId}".`);
      const start =
        item.start === undefined ? 0 : seconds(item.start, `${location}.start`);
      const end =
        item.end === undefined ? null : seconds(item.end, `${location}.end`);
      if (end !== null && end <= start)
        throw new Error(`${location}.end: must be greater than start.`);
      return {
        kind: "feature",
        id,
        title,
        mediaId,
        start,
        end,
        description:
          item.description === undefined
            ? ""
            : text(item.description, `${location}.description`),
      };
    });
  }

  return {
    title: text(root.title, "title"),
    description:
      root.description === undefined
        ? ""
        : text(root.description, "description"),
    media,
    navigation: nodes(root.navigation, "navigation", 1),
  };
}

/** Flattens playable features in display order, retaining their category ancestry. */
export function featureEntries(
  nodes: readonly NavigationNode[],
  parents: readonly Category[] = [],
): readonly FeatureEntry[] {
  return nodes.flatMap((node) =>
    node.kind === "feature"
      ? [{ feature: node, parents }]
      : featureEntries(node.children, [...parents, node]),
  );
}

/** Formats a finite duration as minutes and seconds. */
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(total / 60).toString()}:${(total % 60).toString().padStart(2, "0")}`;
}
