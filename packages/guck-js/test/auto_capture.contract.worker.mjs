import fs from "node:fs";
import { pathToFileURL } from "node:url";

const casePath = process.env.GUCK_CASE_PATH;
if (!casePath) {
  throw new Error("Missing GUCK_CASE_PATH");
}
const indexPath = process.env.GUCK_INDEX_PATH;
if (!indexPath) {
  throw new Error("Missing GUCK_INDEX_PATH");
}

const testCase = JSON.parse(fs.readFileSync(casePath, "utf8"));

const { installAutoCapture } = await import(pathToFileURL(indexPath).href);
const handle = installAutoCapture();

for (const write of testCase.writes || []) {
  const stream = write.stream === "stderr" ? process.stderr : process.stdout;
  stream.write(write.text);
  if (typeof stream.flush === "function") {
    stream.flush();
  }
}

handle.stop();
await new Promise((resolve) => setTimeout(resolve, 50));
