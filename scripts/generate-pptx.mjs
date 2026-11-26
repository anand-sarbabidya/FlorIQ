/**
 * Thin wrapper so npm scripts / build-static can call `node scripts/generate-pptx.mjs`.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync("npx", ["tsx", "scripts/generate-pptx.ts"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
