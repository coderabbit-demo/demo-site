/** Fails the build on malformed tour configuration before deploying it. */
import { readFile } from "node:fs/promises";
import { parseTour, featureEntries } from "../src/tour.ts";

const tour = parseTour(
  JSON.parse(
    await readFile(new URL("../public/tour.json", import.meta.url), "utf8"),
  ),
);
console.log(
  `Tour validated: ${featureEntries(tour.navigation).length} features, ${tour.media.size} recordings.`,
);
