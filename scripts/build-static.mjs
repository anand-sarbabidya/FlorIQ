/**
 * Pure static `out/` export. Temporarily moves `src/app/api` aside because
 * Route Handlers are incompatible with `output: "export"`.
 * Server TTS then needs NEXT_PUBLIC_TTS_PROXY_URL or falls back to speechSynthesis.
 */
import { spawnSync } from "node:child_process";
import { access, rename } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = path.join(root, "src/app/api");
/** Must live outside `src/app` or Next still treats it as a route. */
const stashDir = path.join(root, ".tts-api-stash");

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

let stashed = false;
try {
  if (await exists(apiDir)) {
    if (await exists(stashDir)) {
      throw new Error(`Refusing to overwrite existing ${stashDir}`);
    }
    await rename(apiDir, stashDir);
    stashed = true;
  }

  const result = spawnSync("npx", ["next", "build"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ENABLE_STATIC_EXPORT: "1" },
    shell: process.platform === "win32",
  });

  process.exitCode = result.status ?? 1;
} finally {
  if (stashed && (await exists(stashDir))) {
    await rename(stashDir, apiDir);
  }
}
