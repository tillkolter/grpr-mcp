import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const pyDir = path.join(root, "packages", "guck-py");
const version = fs.readFileSync(path.join(root, "VERSION"), "utf8").trim();
const jsPackages = [
  { name: "@guckdev/core", dir: path.join(root, "packages", "guck-core") },
  { name: "@guckdev/sdk", dir: path.join(root, "packages", "guck-js") },
  { name: "@guckdev/mcp", dir: path.join(root, "packages", "guck-mcp") },
  { name: "@guckdev/cli", dir: path.join(root, "packages", "guck-cli") },
];

const run = (cmd, args, cwd = root) => {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const isPublished = (name) => {
  const result = spawnSync("npm", ["view", `${name}@${version}`, "version"], {
    stdio: "pipe",
    encoding: "utf8",
  });
  if (result.status === 0) {
    return result.stdout.trim() === version;
  }
  return false;
};

run("pnpm", ["-r", "build"]);

for (const pkg of jsPackages) {
  if (isPublished(pkg.name)) {
    console.log(`Skipping ${pkg.name}@${version} (already published).`);
    continue;
  }
  run("npm", ["publish", "--access", "public", "--provenance"], pkg.dir);
}

run("python", ["-m", "build"], pyDir);
