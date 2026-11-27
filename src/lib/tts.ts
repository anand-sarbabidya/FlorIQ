/**
 * Default free TTS voice: Microsoft Edge neural "Jenny"
 * (upbeat, clear female presenter — no API key / paid plan).
 * Override via TTS_VOICE.
 */
export const DEFAULT_EDGE_VOICE = "en-US-JennyNeural";

/** Opening dua slide — Saudi Arabic male neural for Qur'anic recitation feel. */
export const ARABIC_EDGE_VOICE = "ar-SA-HamedNeural";

/** Fallback Arabic neural if Hamed is unavailable. */
export const ARABIC_EDGE_VOICE_FALLBACK = "ar-SA-ZariyahNeural";

/** Voices the TTS API will accept (prevents arbitrary voice injection). */
export const ALLOWED_EDGE_VOICES = [
  DEFAULT_EDGE_VOICE,
  ARABIC_EDGE_VOICE,
  ARABIC_EDGE_VOICE_FALLBACK,
  "en-US-AriaNeural",
  "en-GB-SoniaNeural",
] as const;

export type AllowedEdgeVoice = (typeof ALLOWED_EDGE_VOICES)[number];

export function isAllowedEdgeVoice(voice: string): voice is AllowedEdgeVoice {
  return (ALLOWED_EDGE_VOICES as readonly string[]).includes(voice);
}

export function resolveEdgeVoice(requested?: string | null): string {
  const trimmed = requested?.trim();
  if (trimmed && isAllowedEdgeVoice(trimmed)) return trimmed;
  return process.env.TTS_VOICE?.trim() || DEFAULT_EDGE_VOICE;
}

/** Pronunciation tweaks applied before any TTS engine speaks. */
export function prepareSpokenScript(script: string): string {
  // Leave Arabic (and other non-Latin) scripts untouched.
  if (/[\u0600-\u06FF]/.test(script)) return script.trim();

  return script
    .replace(/FlorIQ/gi, "Florick")
    .replace(/\bcis\b/gi, "C I S")
    .replace(/\bltd\.?\b/gi, "limited");
}

/**
 * Resolve the TTS endpoint without putting secrets in the client bundle.
 * Prefer same-origin `/api/tts` (next dev / Node deploy). Optional
 * `NEXT_PUBLIC_TTS_PROXY_URL` for static-export hosts that need an external proxy.
 */
export function getTtsEndpoints(): string[] {
  const endpoints: string[] = ["/api/tts"];
  const proxy = process.env.NEXT_PUBLIC_TTS_PROXY_URL?.trim();
  if (proxy && proxy !== "/api/tts") endpoints.push(proxy);
  return endpoints;
}

/** Fetch synthesized audio from the server Edge TTS proxy. */
export async function fetchTtsAudio(
  text: string,
  signal?: AbortSignal,
  voice?: string,
): Promise<Blob | null> {
  const body = JSON.stringify({
    text,
    ...(voice ? { voice } : {}),
  });
  for (const endpoint of getTtsEndpoints()) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
        body,
        signal,
      });
      if (!res.ok) continue;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) continue;
      const blob = await res.blob();
      if (blob.size > 0) return blob;
    } catch {
      if (signal?.aborted) return null;
      /* try next endpoint / fall back to browser TTS */
    }
  }
  return null;
}
