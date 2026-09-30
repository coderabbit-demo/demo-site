/** Verifies release/resume identity without credentials, filesystem writes, or uploads. */
import assert from "node:assert/strict";
import test from "node:test";
import {
  canResumeReceipt,
  matchesReleaseUrl,
  parseUploadUrl,
} from "./publish-media.mjs";

const asset = {
  releasePath: "v3-release/media/v3/demo.mp4",
  sha256: "abc123",
  bytes: 1024,
};
const url = `https://store123.public.blob.vercel-storage.com/${asset.releasePath}`;
const receipt = { url, sha256: asset.sha256, bytes: asset.bytes };

test("resumes existing receipt format for identical content and exact destination", () => {
  assert.equal(canResumeReceipt(receipt, asset), true);
});

test("uploads unchanged content again when the release destination changes", () => {
  assert.equal(
    canResumeReceipt(receipt, {
      ...asset,
      releasePath: "v4-release/media/v3/demo.mp4",
    }),
    false,
  );
});

test("does not reuse absent receipts or receipts for different content", () => {
  for (const value of [
    undefined,
    null,
    {},
    { ...receipt, sha256: "different" },
    { ...receipt, bytes: 1 },
  ]) {
    assert.equal(canResumeReceipt(value, asset), false);
  }
});

test("rejects malformed, credentialed, nonpublic, and incorrect destination URLs", () => {
  for (const value of [
    undefined,
    123,
    "invalid",
    url.replace("https:", "http:"),
    url.replace("store123", "user:password@store123"),
    url.replace(".public.", ".private."),
    url.replace(".com/", ".com.evil/"),
    `${url}?token=secret`,
    `${url}#section`,
    `${url}.old`,
    url.replace(".com/", ".com:8443/"),
  ]) {
    assert.equal(matchesReleaseUrl(value, asset.releasePath), false);
    assert.equal(canResumeReceipt({ ...receipt, url: value }, asset), false);
  }
});

test("extracts the requested object rather than an unrelated CLI link", () => {
  assert.equal(
    parseUploadUrl(
      `Vercel https://vercel.com/docs\nPrevious: ${url}.old\nUploaded: ${url}\n`,
      asset.releasePath,
    ),
    url,
  );
});

test("rejects success output with no exact matching destination", () => {
  for (const output of [
    "Done",
    `Uploaded: ${url}.old`,
    `Uploaded: ${url.replace("v3-release", "old-release")}`,
  ]) {
    assert.throws(
      () => parseUploadUrl(output, asset.releasePath),
      /No matching Blob URL returned/,
    );
  }
});
