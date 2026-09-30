import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { preserveAsset } from "./immutable-asset.mjs";

async function fixture(run) {
  const directory = await mkdtemp(join(tmpdir(), "immutable-asset-test-"));
  try {
    const source = join(directory, "source.bin");
    const destination = join(directory, "output", "asset.bin");
    await writeFile(source, Buffer.from([0, 255, 3, 9]));
    await run(source, destination);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test("creates missing assets with exact source bytes", () =>
  fixture(async (source, destination) => {
    const contents = await preserveAsset(source, destination);
    assert.deepEqual(await readFile(destination), contents);
  }));

test("identical existing assets retain their inode and modification time", () =>
  fixture(async (source, destination) => {
    await preserveAsset(source, destination);
    const before = await stat(destination, { bigint: true });
    await preserveAsset(source, destination);
    const after = await stat(destination, { bigint: true });
    assert.equal(after.ino, before.ino);
    assert.equal(after.mtimeNs, before.mtimeNs);
  }));

test("conflicting source bytes fail without changing the release asset", () =>
  fixture(async (source, destination) => {
    await preserveAsset(source, destination);
    const original = await readFile(destination);
    await writeFile(source, "changed");
    await assert.rejects(
      preserveAsset(source, destination),
      /refusing to overwrite/,
    );
    assert.deepEqual(await readFile(destination), original);
  }));

test("a checked-in asset may be its own source", () =>
  fixture(async (source) => {
    const before = await stat(source, { bigint: true });
    assert.deepEqual(
      await preserveAsset(source, source),
      await readFile(source),
    );
    assert.equal(
      (await stat(source, { bigint: true })).mtimeNs,
      before.mtimeNs,
    );
  }));

test("missing source fails without creating a destination", () =>
  fixture(async (source, destination) => {
    await rm(source);
    await assert.rejects(preserveAsset(source, destination), {
      code: "ENOENT",
    });
    await assert.rejects(readFile(destination), { code: "ENOENT" });
  }));
