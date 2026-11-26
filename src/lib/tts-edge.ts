import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { DEFAULT_EDGE_VOICE } from "@/lib/tts";

/** Escape text for inclusion inside Edge SSML. */
export function escapeSsmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Synthesize MP3 via Microsoft Edge Read Aloud (free neural voices).
 * Slightly faster/higher prosody for an upbeat presenter feel.
 */
export async function synthesizeEdgeMp3(
  text: string,
  voice = process.env.TTS_VOICE?.trim() || DEFAULT_EDGE_VOICE,
): Promise<Buffer> {
  const tts = new MsEdgeTTS({
    connectionTimeoutMs: 15_000,
    synthesisTimeoutMs: 90_000,
  });

  try {
    await tts.setMetadata(
      voice,
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
    );

    const { audioStream } = tts.toStream(escapeSsmlText(text), {
      rate: "+8%",
      pitch: "+3Hz",
    });

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (chunk: Buffer) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      audioStream.on("error", reject);
      audioStream.on("end", () => resolve());
      audioStream.on("close", () => resolve());
    });

    const buffer = Buffer.concat(chunks);
    if (buffer.length === 0) {
      throw new Error("Edge TTS returned empty audio");
    }
    return buffer;
  } finally {
    tts.close();
  }
}
