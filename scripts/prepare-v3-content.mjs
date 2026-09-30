/** Copies approved delivery assets and builds reproducible, timestamped tour guides. */
import { format } from "prettier";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { preserveAsset } from "./immutable-asset.mjs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
if (
  args.some((arg) => arg.startsWith("--") && arg !== "--reset-local-urls") ||
  args.filter((arg) => !arg.startsWith("--")).length > 1
) {
  throw new Error(
    "Usage: node scripts/prepare-v3-content.mjs [version-3-source-directory] [--reset-local-urls]",
  );
}
const resetLocalUrls = args.includes("--reset-local-urls");
const sourceRoot = resolve(
  args.find((arg) => !arg.startsWith("--")) ?? resolve(root, "../version-3"),
);
let existingTour;
try {
  existingTour = JSON.parse(
    await readFile(resolve(root, "public/tour.json"), "utf8"),
  );
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (
  !resetLocalUrls &&
  Object.values(existingTour?.media ?? {}).some((item) =>
    [
      item.src,
      item.poster,
      item.captions,
      item.guide?.download,
      item.guide?.pdf,
    ].some((url) => /^https:\/\//.test(url ?? "")),
  )
) {
  throw new Error(
    "Published media URLs detected. Pass --reset-local-urls only when intentionally preparing a new local release.",
  );
}
const release = "v3-2026-09-30";
const entries = [
  [
    "platform",
    "00-platform",
    "Platform overview",
    "An introduction to the CodeRabbit platform.",
    34.7,
  ],
  [
    "pr-review",
    "01-pr-review",
    "PR Review",
    "Follow a pull request from local review through merge checks.",
    429.033333,
  ],
  [
    "triage",
    "03-triage",
    "Triage",
    "Find the next review and understand why it needs your attention.",
    225.866667,
  ],
  [
    "change-stack",
    "04-change-stack",
    "Change Stack",
    "Inspect code, findings, and review context in one workspace.",
    270.4,
  ],
  [
    "engineering-security",
    "5a-security-engineering",
    "Engineering Security",
    "Investigate security findings in the engineering workflow.",
    228.3,
  ],
  [
    "application-security",
    "05b-application-security",
    "Application Security",
    "Explore the attack surface, investigate a finding, and inspect a proposed fix.",
    226.494336,
  ],
  [
    "automations",
    "06-codeRabbit-automations",
    "Automations",
    "Configure and inspect recurring development workflows.",
    253.5,
  ],
  [
    "coding-agent",
    "07-coding-agent",
    "Coding Agent",
    "Follow a coding task from request to reviewable change.",
    279.7,
  ],
  [
    "slack-agent",
    "08-coderabbit-agent-for-slack",
    "CodeRabbit Agent for Slack",
    "Bring repository context and development work into Slack.",
    240.533333,
  ],
];
const inventory = [];
const operatorRequests = JSON.parse(
  await readFile(resolve(root, "scripts/data/operator-requests.json"), "utf8"),
).guides;

async function asset(source, destination, kind, mediaId, provenance) {
  const output = resolve(root, "public", destination);
  const contents = await preserveAsset(source, output);
  inventory.push({
    mediaId,
    kind,
    path: `public/${destination}`,
    source: provenance ?? source.slice(sourceRoot.length + 1),
    bytes: contents.length,
    sha256: createHash("sha256").update(contents).digest("hex"),
    releasePath: `${release}/${destination}`,
  });
  return `/${destination}`;
}

function timestamp(seconds) {
  const milliseconds = Math.round(seconds * 1000);
  return `${String(Math.floor(milliseconds / 60000)).padStart(2, "0")}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, "0")}.${String(milliseconds % 1000).padStart(3, "0")}`;
}

function parseSteps(markdown, mapping, offset) {
  const sections = markdown.split(/^## /m).slice(1);
  if (sections.length !== mapping.steps.length)
    throw new Error("Guide and source-map step count disagree");
  return sections.map((section, index) => {
    const timing = mapping.steps[index];
    const title = section.split("\n")[0].trim();
    if (!title.startsWith(`${timing.pillar} /`))
      throw new Error(`Source-map pillar mismatch: ${title}`);
    const action = section.match(/### Do\s+([\s\S]*?)\s+### Say/);
    const narration = section.match(/### Say\s+([\s\S]*?)\s+### See/);
    const visual = section.match(/### See\s+([\s\S]*)/);
    if (!action || !narration || !visual)
      throw new Error(`Incomplete Do / Say / See: ${title}`);
    const links = [
      ...action[1].matchAll(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g),
    ].map((match) => ({ label: match[1], url: match[2] }));
    const instructions = action[1]
      .split("\n")
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2).trim());
    if (!instructions.length) throw new Error(`Missing actions: ${title}`);
    return {
      title,
      start: Number((timing.start + offset).toFixed(3)),
      end: Number((timing.end + offset).toFixed(3)),
      do: instructions,
      say: narration[1].trim(),
      see: offset
        ? `Frame at ${timestamp(timing.frame + offset)} in the consolidated video.`
        : visual[1].trim(),
      links,
    };
  });
}

const media = {};
const navigation = [];
for (const [id, filename, title, description, duration] of entries) {
  const delivery = resolve(
    sourceRoot,
    "consolidated-videos-per-slide",
    filename,
  );
  const src = await asset(`${delivery}.mp4`, `media/v3/${id}.mp4`, "video", id);
  const captions = await asset(
    `${delivery}.vtt`,
    `captions/v3/${id}.vtt`,
    "captions",
    id,
  );
  const posterDirectory = await mkdtemp(resolve(tmpdir(), "demo-v3-poster-"));
  let poster;
  try {
    const posterFile = resolve(posterDirectory, `${id}.jpg`);
    execFileSync("ffmpeg", [
      "-v",
      "error",
      "-n",
      "-ss",
      "5",
      "-i",
      `${delivery}.mp4`,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      posterFile,
    ]);
    poster = await asset(
      posterFile,
      `posters/v3/${id}.jpg`,
      "poster",
      id,
      `Frame at 5 seconds from consolidated-videos-per-slide/${filename}.mp4; original dimensions preserved.`,
    );
  } finally {
    await rm(posterDirectory, { recursive: true, force: true });
  }
  const readalong = await readFile(`${delivery}-readalong.txt`, "utf8");
  let steps;
  let pdf;
  if (id === "platform") {
    steps = [
      {
        title: "Platform overview",
        start: 0,
        end: duration,
        do: ["Show the platform overview slide."],
        say: readalong.trim().replace(/\s*\n\s*/g, " "),
        see: "The CodeRabbit platform overview and development phases.",
        links: [],
      },
    ];
  } else {
    const guideRoot = resolve(sourceRoot, "talk-tracks", filename, "cert-prep");
    const markdown = await readFile(resolve(guideRoot, "script.md"), "utf8");
    const mapping = JSON.parse(
      await readFile(resolve(guideRoot, "source-map.json"), "utf8"),
    );
    const offset = id === "application-security" ? 21.14 : 0;
    steps = parseSteps(markdown, mapping, offset);
    if (offset) {
      const intro = readalong
        .split("We'll start with an application security review")[0]
        .trim()
        .replace(/\s*\n\s*/g, " ");
      steps.unshift({
        title: "Introduction / OPENING: Introduce the AppSec flow",
        start: 0,
        end: offset,
        do: [
          "Show the Application Security flow slide, then switch to the existing repository scan.",
        ],
        say: intro,
        see: "Application Security flow: Deep Scan, Explore Attack Surface, Investigate a Finding, Fix with AI.",
        links: [],
      });
    }
    // The corrected AppSec PDF is a reviewed, checked-in release asset.
    // Preserve it on regeneration instead of restoring the older source timeline.
    pdf = await asset(
      offset
        ? resolve(root, "public/guides/v3/application-security.pdf")
        : resolve(guideRoot, `${filename}-do-say-see.pdf`),
      `guides/v3/${id}.pdf`,
      "pdf",
      id,
      offset
        ? "Checked-in corrected PDF, generated with existing .cert-prep-v3/build.py using the 21.14-second offset and introduction; visually verified."
        : undefined,
    );
  }
  // Clarify operator-only training actions without changing recorded narration.
  if (id === "automations") {
    const trigger = steps.find(
      (step) =>
        step.title ===
        "Run Always-On / STEP 2 OF 4: Inspect the triggering issue",
    );
    if (!trigger) throw new Error("Missing Automations training trigger step");
    trigger.do = [
      "For rehearsal, keep the automation paused. Open the dedicated repository, click Issues, then inspect recorded issue #1 and the existing run only.",
      "For a separate training run, first resume the saved automation and verify it is active. Then click New issue, enter the title/body from the appendix, and Submit new issue once.",
      "After the training run completes, pause the automation again and verify its paused state.",
    ];
  }
  if (id === "coding-agent") {
    const delivery = steps.find(
      (step) => step.title === "Deliver / STEP 1 OF 4: Create the review PR",
    );
    if (!delivery) throw new Error("Missing Coding Agent delivery step");
    delivery.do = [
      "The initial task request does not authorize autonomous publishing: the agent must not commit, push, or open a PR on its own.",
      "For a separate training run, finish reviewing the patch first. The operator then separately authorizes publication and manually selects Create PR, waits for publication, and checks the destination branch.",
      "For rehearsal, open existing PR #10 only; do not select Commit and push or Create PR.",
    ];
  }
  for (const step of steps) {
    if (
      !Number.isFinite(step.start) ||
      !Number.isFinite(step.end) ||
      step.start < 0 ||
      step.end <= step.start ||
      step.end > duration
    )
      throw new Error(`Invalid timing for ${id}: ${step.title}`);
  }
  const captionText = (await readFile(`${delivery}.vtt`, "utf8")).replace(
    /WEBVTT|\d\d:\d\d:\d\d\.\d+ --> [^\n]+|^\d+$/gm,
    "",
  );
  const words = (text) =>
    (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).join(" ");
  if (words(captionText) !== words(steps.map((step) => step.say).join(" "))) {
    throw new Error(
      `Guide narration does not match full caption coverage: ${id}`,
    );
  }
  const download = `/guides/v3/${id}.md`;
  const guide = {
    title: `${title} — Do / Say / See`,
    download,
    ...(pdf ? { pdf } : {}),
    steps,
  };
  const note =
    id === "application-security"
      ? "\nThese timestamps include the 21.14-second introduction in the final Version 3 video. The accompanying illustrated PDF uses the same corrected timeline.\n"
      : "";
  const requests = operatorRequests[id] ?? [];
  if (
    steps.some((step) =>
      step.do.some((instruction) => /the appendix/i.test(instruction)),
    ) &&
    requests.length === 0
  ) {
    throw new Error(`Missing operator request appendix for ${id}`);
  }
  const appendix = requests.length
    ? `\n\n## Appendix: Operator text to type\n\nThese recorded inputs belong to the Do instructions and are separate from the spoken Say track.\n\n${requests.map((request) => `### ${request.title}\n\n${request.text}\n`).join("\n")}`
    : "";
  const markdown = await format(
    `# ${guide.title}\n\nCompanion to the complete Version 3 recording. Times are minutes:seconds.milliseconds.\n${note}\n${steps.map((step) => `## ${step.title}\n\n${timestamp(step.start)}–${timestamp(step.end)}\n\n### Do\n\n${step.do.map((line) => `- ${line}`).join("\n")}\n\n${step.links.map((link) => `[${link.label}](${link.url})`).join(" · ")}\n\n### Say\n\n${step.say}\n\n### See\n\n${step.see}\n`).join("\n")}${appendix}`,
    { parser: "markdown" },
  );
  await mkdir(resolve(root, "public/guides/v3"), { recursive: true });
  await writeFile(resolve(root, `public${download}`), markdown);
  const contents = Buffer.from(markdown);
  inventory.push({
    mediaId: id,
    kind: "guide",
    path: `public${download}`,
    bytes: contents.length,
    sha256: createHash("sha256").update(contents).digest("hex"),
    releasePath: `${release}${download}`,
  });
  // Inline steps link the downloadable script where the operator appendix is maintained.
  const inlineGuide = {
    ...guide,
    steps: steps.map((step) => ({
      ...step,
      do: step.do.map((instruction) =>
        instruction.replace(
          /the appendix/gi,
          "the downloadable script appendix",
        ),
      ),
      links: step.do.some((instruction) => /the appendix/i.test(instruction))
        ? [
            ...step.links,
            {
              label: "Operator-request appendix (downloadable script)",
              url: download,
            },
          ]
        : step.links,
    })),
  };
  media[id] = { src, captions, poster, guide: inlineGuide };
  navigation.push({ id, title, description, mediaId: id });
}
await writeFile(
  resolve(root, "public/tour.json"),
  await format(
    `${JSON.stringify({ version: 1, title: "CodeRabbit product tour", description: "Follow the CodeRabbit platform from code review through security, automation, and coding agents.", media, navigation }, null, 2)}\n`,
    { parser: "json" },
  ),
);
await mkdir(resolve(root, "docs"), { recursive: true });
await writeFile(
  resolve(root, "docs/media-release.json"),
  await format(
    `${JSON.stringify({ release, sourceVersion: "version-3", notes: ["MP4 delivery assets are exact copies; original recordings and narration remain unchanged.", "AppSec Markdown, inline guide, and corrected PDF include the final 21.14-second introduction. The checked-in PDF was generated with existing .cert-prep-v3/build.py using the 21.14-second offset plus introduction, then visually verified; regeneration preserves this reviewed PDF.", "Posters are frames at 5 seconds extracted from the final MP4 at original dimensions."], assets: inventory }, null, 2)}\n`,
    { parser: "json" },
  ),
);
console.log(
  `Prepared ${entries.length} complete videos and guides (${inventory.length} release assets).`,
);
