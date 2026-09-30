/** Uploads immutable release assets with the existing Vercel CLI; never runs during a build. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { format } from "prettier";

if (!process.argv.includes("--upload")) {
  throw new Error(
    "Explicit --upload is required. See docs/content.md for the publishing workflow.",
  );
}
process.loadEnvFile(".env.local");
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token)
  throw new Error(
    "Link the Vercel project and pull its Blob environment first.",
  );
const inventory = JSON.parse(await readFile("docs/media-release.json", "utf8"));
const receiptsPath = "docs/blob-assets.json";
let receipts = {};
try {
  receipts = JSON.parse(await readFile(receiptsPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const publish = inventory.assets.filter((asset) =>
  ["video", "pdf"].includes(asset.kind),
);
// Verify every source before performing any uploads.
for (const asset of publish) {
  const bytes = await readFile(asset.path);
  if (
    bytes.length !== asset.bytes ||
    createHash("sha256").update(bytes).digest("hex") !== asset.sha256
  ) {
    throw new Error(`Release checksum mismatch: ${asset.path}`);
  }
}
for (const asset of publish) {
  if (receipts[asset.path]?.sha256 === asset.sha256) continue;
  const result = spawnSync(
    "vercel",
    [
      "blob",
      "put",
      resolve(asset.path),
      "--pathname",
      asset.releasePath,
      "--access",
      "public",
      "--scope",
      "coderabbitai",
      "--rw-token",
      token,
    ],
    { encoding: "utf8" },
  );
  const output = `${result.stdout}\n${result.stderr}`.replaceAll(
    token,
    "[redacted]",
  );
  if (result.status !== 0)
    throw new Error(`Upload failed for ${asset.path}: ${output}`);
  const url = output.match(
    /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/[^\s]+/,
  )?.[0];
  if (!url) throw new Error(`No Blob URL returned for ${asset.path}`);
  receipts[asset.path] = { url, sha256: asset.sha256, bytes: asset.bytes };
  await writeFile(
    receiptsPath,
    await format(JSON.stringify(receipts), { parser: "json" }),
  );
  console.log(`Uploaded ${asset.path}`);
}
const tour = JSON.parse(await readFile("public/tour.json", "utf8"));
for (const asset of publish) {
  const media = tour.media[asset.mediaId];
  const receipt = receipts[asset.path];
  if (asset.kind === "video") media.src = receipt.url;
  else media.guide.pdf = receipt.url;
}
await writeFile(
  "public/tour.json",
  await format(JSON.stringify(tour), { parser: "json" }),
);
console.log(`Published ${publish.length} assets; updated public/tour.json.`);
