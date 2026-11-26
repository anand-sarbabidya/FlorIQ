/**
 * Writes public/FlorIQ_Pitch_Deck.pptx from the live slides data.
 * Used so static `out/` exports still ship a current deck (no /api/pptx).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateFlorIqPptx } from "../src/lib/generate-pptx";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(root, "public", "FlorIQ_Pitch_Deck.pptx");

async function main() {
  await mkdir(path.dirname(outPath), { recursive: true });
  const buf = await generateFlorIqPptx();
  await writeFile(outPath, buf);
  console.log(`Wrote ${outPath} (${buf.length} bytes, from live slides)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
