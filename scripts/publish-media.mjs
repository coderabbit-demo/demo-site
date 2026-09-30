/** Uploads immutable release assets with the existing Vercel CLI; never runs during a build. */
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";

const storeId = "o6mfxpkyyfleovxb";
const storeHostname = `${storeId}.public.blob.vercel-storage.com`;

/** The installed @vercel/blob SDK extracts the store ID from token.split("_")[3]. */
export function validateStoreToken(token) {
  const match =
    typeof token === "string" &&
    /^vercel_blob_rw_([a-z0-9]+)_\S+$/i.exec(token);
  if (!match || match[1].toLowerCase() !== storeId) {
    throw new Error(
      "Blob credentials must belong to the dedicated demo-site-videos store.",
    );
  }
}

/** Checks exact release identity without requiring new fields in existing receipts. */
export function matchesReleaseUrl(value, releasePath) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === storeHostname &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.search &&
      !url.hash &&
      url.pathname === `/${releasePath}`
    );
  } catch {
    return false;
  }
}

/** Reuses a receipt only when both the content and destination match the inventory. */
export function canResumeReceipt(receipt, asset) {
  return (
    receipt?.sha256 === asset.sha256 &&
    receipt.bytes === asset.bytes &&
    matchesReleaseUrl(receipt.url, asset.releasePath)
  );
}

/** Accepts only the URL of the requested object from Vercel CLI output. */
export function parseUploadUrl(output, releasePath) {
  const candidates = output.match(/https:\/\/[^\s]+/g) ?? [];
  const url = candidates.find((candidate) =>
    matchesReleaseUrl(candidate, releasePath),
  );
  if (!url) throw new Error(`No matching Blob URL returned for ${releasePath}`);
  return url;
}

/** Recovers an interrupted upload's receipt only after verifying the remote bytes. */
export async function recoverRemoteReceipt(asset, fetchAsset = fetch) {
  const url = `https://${storeHostname}/${asset.releasePath}`;
  if (!matchesReleaseUrl(url, asset.releasePath)) {
    throw new Error(`Invalid release path: ${asset.releasePath}`);
  }
  const response = await fetchAsset(url, {
    redirect: "error",
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  if (response.status === 404) {
    await response.body?.cancel();
    return null;
  }
  if (response.status !== 200 || !response.body) {
    await response.body?.cancel();
    throw new Error(
      `Cannot reconcile ${asset.releasePath}: HTTP ${response.status}`,
    );
  }
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of response.body) {
    bytes += chunk.byteLength;
    if (bytes > asset.bytes)
      throw new Error(`Remote checksum mismatch: ${asset.releasePath}`);
    hash.update(chunk);
  }
  if (bytes !== asset.bytes || hash.digest("hex") !== asset.sha256) {
    throw new Error(`Remote checksum mismatch: ${asset.releasePath}`);
  }
  return { url, sha256: asset.sha256, bytes };
}

/** Passes Blob credentials through the child environment, excluding conflicting OIDC auth. */
export function uploadEnvironment(environment, token) {
  const result = { ...environment, BLOB_READ_WRITE_TOKEN: token };
  delete result.VERCEL_OIDC_TOKEN;
  delete result.BLOB_STORE_ID;
  return result;
}

/** Publishes only on explicit CLI invocation; imports expose pure helpers for tests. */
async function publishMedia() {
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
  validateStoreToken(token);
  const inventory = JSON.parse(
    await readFile("docs/media-release.json", "utf8"),
  );
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
    if (canResumeReceipt(receipts[asset.path], asset)) continue;
    const recovered = await recoverRemoteReceipt(asset);
    if (recovered) {
      receipts[asset.path] = recovered;
      await writeFile(
        receiptsPath,
        await format(JSON.stringify(receipts), { parser: "json" }),
      );
      console.log(`Recovered receipt for ${asset.path}`);
      continue;
    }
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
      ],
      { encoding: "utf8", env: uploadEnvironment(process.env, token) },
    );
    const output = `${result.stdout}\n${result.stderr}`.replaceAll(
      token,
      "[redacted]",
    );
    if (result.status !== 0)
      throw new Error(`Upload failed for ${asset.path}: ${output}`);
    const url = parseUploadUrl(output, asset.releasePath);
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
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await publishMedia();
}
