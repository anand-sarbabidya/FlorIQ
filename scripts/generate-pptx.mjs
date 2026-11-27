/**
 * Thin wrapper so npm scripts / build-static can call `node scripts/generate-pptx.mjs`.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shell = process.platform === "win32";

const prep = spawnSync("node", ["scripts/prepare-pptx-media.mjs"], {
  cwd: root,
  stdio: "inherit",
  shell,
});
if ((prep.status ?? 1) !== 0) process.exit(prep.status ?? 1);

const result = spawnSync("npx", ["tsx", "scripts/generate-pptx.ts"], {
  cwd: root,
  stdio: "inherit",
  shell,
});

process.exit(result.status ?? 1);
