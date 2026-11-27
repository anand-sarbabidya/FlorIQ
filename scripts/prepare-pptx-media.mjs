/**
 * Ensures PowerPoint-friendly media exists under public/assets/videos/for-pptx/:
 * - poster JPEGs for every site video
 * - H.264 MP4 copies (WebM is not playable in PowerPoint)
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public/assets/videos/for-pptx");
const ffmpeg = require("ffmpeg-static");

const jobs = [
  {
    src: "public/assets/videos/hero.mp4",
    poster: "hero-poster.jpg",
    mp4: "hero.mp4",
    copyMp4: true,
  },
  {
    src: "public/assets/videos/render.webm",
    poster: "render-poster.jpg",
    mp4: "render.mp4",
  },
  {
    src: "public/assets/videos/plant-system.webm",
    poster: "plant-system-poster.jpg",
    mp4: "plant-system.mp4",
  },
];

function run(args) {
  const r = spawnSync(ffmpeg, args, { encoding: "utf8" });
  if (r.status !== 0) {
    throw new Error(`ffmpeg failed:\n${r.stderr || r.stdout}`);
  }
}

mkdirSync(outDir, { recursive: true });

for (const job of jobs) {
  const src = path.join(root, job.src);
  const poster = path.join(outDir, job.poster);
  const mp4 = path.join(outDir, job.mp4);
  if (!existsSync(src)) {
    console.warn(`skip missing ${job.src}`);
    continue;
  }
  if (!existsSync(poster)) {
    run([
      "-y",
      "-ss",
      "1",
      "-i",
      src,
      "-frames:v",
      "1",
      "-update",
      "1",
      "-q:v",
      "2",
      poster,
    ]);
    console.log(`poster ${job.poster}`);
  }
  if (!existsSync(mp4)) {
    if (job.copyMp4) {
      copyFileSync(src, mp4);
      console.log(`copy ${job.mp4}`);
    } else {
      run([
        "-y",
        "-i",
        src,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-vf",
        "scale='min(1280,iw)':-2",
        "-crf",
        "28",
        "-preset",
        "fast",
        "-an",
        mp4,
      ]);
      console.log(`mp4 ${job.mp4}`);
    }
  }
}

console.log(`PPT media ready in ${outDir}`);
