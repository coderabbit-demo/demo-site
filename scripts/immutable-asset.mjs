import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/** Create a release asset exclusively, or verify its existing bytes without modifying it. */
export async function preserveAsset(source, destination) {
  const contents = await readFile(source);
  await mkdir(dirname(destination), { recursive: true });
  try {
    await writeFile(destination, contents, { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const existing = await readFile(destination);
    if (!contents.equals(existing)) {
      throw new Error(
        `Release asset differs; refusing to overwrite ${destination}`,
      );
    }
  }
  return contents;
}
