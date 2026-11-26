import { DEFAULT_EDGE_VOICE } from "@/lib/tts";
import { synthesizeEdgeMp3 } from "@/lib/tts-edge";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CHARS = 5000;

type TtsBody = {
  text?: unknown;
};

/**
 * Server-side TTS — free Microsoft Edge neural voice (Jenny by default).
 * Keeps synthesis off the client. Returns MP3 for Auto · AI Voice.
 *
 * Pure static `out/` hosts cannot run this route; set NEXT_PUBLIC_TTS_PROXY_URL
 * or fall back to browser speechSynthesis.
 */
export async function POST(request: Request) {
  let body: TtsBody;
  try {
    body = (await request.json()) as TtsBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `text exceeds ${MAX_CHARS} characters` },
      { status: 400 },
    );
  }

  try {
    const voice = process.env.TTS_VOICE?.trim() || DEFAULT_EDGE_VOICE;
    const mp3 = await synthesizeEdgeMp3(text, voice);
    return new NextResponse(new Uint8Array(mp3), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-TTS-Provider": "edge",
        "X-TTS-Voice": voice,
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Edge TTS request failed", detail: detail.slice(0, 400) },
      { status: 502 },
    );
  }
}
