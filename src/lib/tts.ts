/**
 * Default free TTS voice: Microsoft Edge neural "Jenny"
 * (upbeat, clear female presenter — no API key / paid plan).
 * Override via TTS_VOICE.
 */
export const DEFAULT_EDGE_VOICE = "en-US-JennyNeural";

/** Pronunciation tweaks applied before any TTS engine speaks. */
export function prepareSpokenScript(script: string): string {
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
): Promise<Blob | null> {
  const body = JSON.stringify({ text });
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
