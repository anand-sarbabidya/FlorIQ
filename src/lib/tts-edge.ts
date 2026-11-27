import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import {
  ARABIC_EDGE_VOICE,
  ARABIC_EDGE_VOICE_FALLBACK,
  DEFAULT_EDGE_VOICE,
  resolveEdgeVoice,
} from "@/lib/tts";

/** Escape text for inclusion inside Edge SSML. */
export function escapeSsmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isArabicVoice(voice: string): boolean {
  return /^ar[-_]/i.test(voice);
}

/**
 * Synthesize MP3 via Microsoft Edge Read Aloud (free neural voices).
 * English presenter voices get a slightly brighter prosody; Arabic
 * recitation voices stay calm and slightly slower.
 */
export async function synthesizeEdgeMp3(
  text: string,
  voice = process.env.TTS_VOICE?.trim() || DEFAULT_EDGE_VOICE,
): Promise<Buffer> {
  const primary = resolveEdgeVoice(voice);
  const candidates = isArabicVoice(primary)
    ? [
        primary,
        primary === ARABIC_EDGE_VOICE
          ? ARABIC_EDGE_VOICE_FALLBACK
          : ARABIC_EDGE_VOICE,
      ]
    : [primary];

  let lastError: unknown;

  for (const candidate of candidates) {
    const tts = new MsEdgeTTS({
      connectionTimeoutMs: 15_000,
      synthesisTimeoutMs: 90_000,
    });

    try {
      await tts.setMetadata(
        candidate,
        OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
      );

      const arabic = isArabicVoice(candidate);
      const { audioStream } = tts.toStream(escapeSsmlText(text), {
        rate: arabic ? "-8%" : "+8%",
        pitch: arabic ? "0Hz" : "+3Hz",
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
    } catch (err) {
      lastError = err;
    } finally {
      tts.close();
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Edge TTS request failed");
}
