/** Verifies release/resume identity without credentials, filesystem writes, or uploads. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  canResumeReceipt,
  matchesReleaseUrl,
  parseUploadUrl,
  uploadEnvironment,
  validateStoreToken,
  recoverRemoteReceipt,
} from "./publish-media.mjs";

const asset = {
  releasePath: "v3-release/media/v3/demo.mp4",
  sha256: "abc123",
  bytes: 1024,
};
const url = `https://o6mfxpkyyfleovxb.public.blob.vercel-storage.com/${asset.releasePath}`;
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
    url.replace("o6mfxpkyyfleovxb", "user:password@o6mfxpkyyfleovxb"),
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

test("keeps upload credentials out of argv and removes conflicting child OIDC settings", () => {
  const parent = {
    PATH: "/tools",
    VERCEL_OIDC_TOKEN: "old-oidc",
    BLOB_STORE_ID: "old-store",
    OTHER: "preserved",
  };
  assert.deepEqual(uploadEnvironment(parent, "test-token"), {
    PATH: "/tools",
    OTHER: "preserved",
    BLOB_READ_WRITE_TOKEN: "test-token",
  });
  assert.equal(parent.VERCEL_OIDC_TOKEN, "old-oidc");
  assert.equal(parent.BLOB_STORE_ID, "old-store");
});

test("rejects other public stores in both receipts and CLI output", () => {
  const otherUrl = url.replace("o6mfxpkyyfleovxb", "otherstore");
  assert.equal(canResumeReceipt({ ...receipt, url: otherUrl }, asset), false);
  assert.throws(
    () => parseUploadUrl(otherUrl, asset.releasePath),
    /No matching Blob URL/,
  );
});

test("requires credentials for the dedicated store before publishing", () => {
  validateStoreToken("vercel_blob_rw_o6mfxpkyyfleovxb_test-secret");
  validateStoreToken("vercel_blob_rw_O6MFXPKYYFLEOVXB_test-secret");
  for (const token of [
    undefined,
    "",
    "invalid",
    "vercel_blob_rw_otherstore_test-secret",
    "vercel_blob_rw_o6mfxpkyyfleovxb_",
  ]) {
    assert.throws(
      () => validateStoreToken(token),
      /dedicated demo-site-videos store/,
    );
  }
});

const remoteBytes = Buffer.from("approved original video bytes");
const remoteAsset = {
  ...asset,
  bytes: remoteBytes.length,
  sha256: createHash("sha256").update(remoteBytes).digest("hex"),
};

test("recovers a missing receipt after verifying existing remote content", async () => {
  assert.equal(canResumeReceipt(undefined, remoteAsset), false);
  const recovered = await recoverRemoteReceipt(
    remoteAsset,
    async (requestUrl, options) => {
      assert.equal(requestUrl, url);
      assert.equal(options.redirect, "error");
      assert.equal(options.cache, "no-store");
      assert.ok(options.signal instanceof AbortSignal);
      return new Response(remoteBytes);
    },
  );
  assert.deepEqual(recovered, {
    url,
    sha256: remoteAsset.sha256,
    bytes: remoteAsset.bytes,
  });
  assert.equal(canResumeReceipt(recovered, remoteAsset), true);
});

test("permits upload only when the exact release URL returns 404", async () => {
  assert.equal(
    await recoverRemoteReceipt(
      remoteAsset,
      async () => new Response("Not found", { status: 404 }),
    ),
    null,
  );
});

test("fails on remote size or checksum mismatch without reusing the object", async () => {
  for (const body of [
    Buffer.from("short"),
    Buffer.alloc(remoteAsset.bytes),
    Buffer.alloc(remoteAsset.bytes + 1),
  ]) {
    await assert.rejects(
      recoverRemoteReceipt(remoteAsset, async () => new Response(body)),
      /Remote checksum mismatch/,
    );
  }
});

test("fails on redirects, non-404 HTTP errors, partial responses and network errors", async () => {
  for (const status of [301, 302, 403, 500, 206]) {
    await assert.rejects(
      recoverRemoteReceipt(
        remoteAsset,
        async () => new Response("Failed", { status }),
      ),
      /Cannot reconcile/,
    );
  }
  await assert.rejects(
    recoverRemoteReceipt(remoteAsset, async () => {
      throw new Error("Network unavailable");
    }),
    /Network unavailable/,
  );
});

test("rejects a release path that normalizes outside its exact destination before fetching", async () => {
  await assert.rejects(
    recoverRemoteReceipt(
      { ...remoteAsset, releasePath: "release/../other.mp4" },
      async () => {
        assert.fail("Must not fetch malformed release URL");
      },
    ),
    /Invalid release path/,
  );
});
