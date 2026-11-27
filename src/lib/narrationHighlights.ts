import type { Slide } from "@/data/slides";

export type NarrationCue = {
  /** Stable id used as data-narrate / highlight key */
  id: string;
  /** Character offset in the spoken script where this cue begins */
  at: number;
};

/** Normalize for fuzzy match against spoken script. */
export function normScript(s: string) {
  return s
    .toLowerCase()
    .replace(/[$€£,]/g, "")
    .replace(/[^a-z0-9%.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function norm(s: string) {
  return normScript(s);
}

function significantPhrases(text: string): string[] {
  const parts = text
    .split(/[—–\-/|,;:]/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 4);
  const out = [...parts];
  // Also keep the first ~4–6 content words as a phrase.
  const words = norm(text).split(" ").filter(Boolean);
  if (words.length >= 3) out.push(words.slice(0, Math.min(5, words.length)).join(" "));
  return out;
}

type Candidate = { id: string; needles: string[] };

function collectCandidates(slide: Slide): Candidate[] {
  const candidates: Candidate[] = [];

  slide.stats?.forEach((stat, i) => {
    candidates.push({
      id: `stat-${i}`,
      needles: [stat.value, ...significantPhrases(stat.label)],
    });
  });

  slide.cards?.forEach((card, i) => {
    candidates.push({
      id: `card-${i}`,
      needles: [card.title, ...significantPhrases(card.title)],
    });
  });

  slide.steps?.forEach((step, i) => {
    const ordinals = ["one", "two", "three", "four", "five", "six"];
    candidates.push({
      id: `step-${i}`,
      needles: [
        step.title,
        `stage ${ordinals[i] ?? i + 1}`,
        ...significantPhrases(step.title),
      ],
    });
  });

  slide.tiers?.forEach((tier, i) => {
    candidates.push({
      id: `tier-${i}`,
      needles: [tier.name, `${tier.name} at`, tier.price],
    });
  });

  slide.shares?.forEach((share, i) => {
    candidates.push({
      id: `share-${i}`,
      needles: [
        share.label,
        `${share.pct} percent`,
        `${share.pct}%`,
        ...significantPhrases(share.label),
      ],
    });
  });

  slide.crops?.forEach((crop, i) => {
    candidates.push({
      id: `crop-${i}`,
      needles: [crop.name],
    });
  });

  // Flow chips are short; only cue them when there are no denser list items.
  if (
    slide.flow?.length &&
    !slide.cards?.length &&
    !slide.steps?.length &&
    !slide.stats?.length
  ) {
    slide.flow.forEach((item, i) => {
      candidates.push({ id: `flow-${i}`, needles: [item] });
    });
  }

  return candidates;
}

/**
 * Build ordered narration cues from list items on a slide.
 * Prefers keyword hits in the spoken script; falls back to even spacing.
 */
export function buildNarrationCues(slide: Slide, spokenScript: string): NarrationCue[] {
  const script = norm(spokenScript);
  if (!script) return [];

  const candidates = collectCandidates(slide);
  if (!candidates.length) return [];

  const len = Math.max(1, script.length);
  const placed: (number | null)[] = candidates.map(() => null);
  let searchFrom = 0;

  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    let best = -1;
    for (const raw of cand.needles) {
      const needle = norm(raw);
      if (needle.length < 3) continue;
      let idx = script.indexOf(needle, searchFrom);
      if (idx < 0) idx = script.indexOf(needle);
      if (idx >= 0 && idx + 1 >= searchFrom - 24 && (best < 0 || idx < best)) {
        best = idx;
      }
    }
    if (best >= 0) {
      placed[i] = best;
      searchFrom = best + 1;
    }
  }

  // Fill gaps between known keyword hits (or even spacing when none hit).
  for (let i = 0; i < placed.length; i++) {
    if (placed[i] != null) continue;

    let prevIdx = -1;
    let nextIdx = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (placed[j] != null) {
        prevIdx = j;
        break;
      }
    }
    for (let j = i + 1; j < placed.length; j++) {
      if (placed[j] != null) {
        nextIdx = j;
        break;
      }
    }

    if (prevIdx >= 0 && nextIdx >= 0) {
      const prev = placed[prevIdx] as number;
      const next = placed[nextIdx] as number;
      const t = (i - prevIdx) / (nextIdx - prevIdx);
      placed[i] = Math.floor(prev + (next - prev) * t);
    } else if (prevIdx >= 0) {
      const remaining = placed.length - prevIdx;
      placed[i] = Math.min(
        len - 1,
        (placed[prevIdx] as number) + Math.floor(((i - prevIdx) / remaining) * (len - (placed[prevIdx] as number))),
      );
    } else if (nextIdx >= 0) {
      placed[i] = Math.floor(((i + 1) / (nextIdx + 1)) * (placed[nextIdx] as number));
    } else {
      placed[i] = Math.floor(((i + 0.15) / candidates.length) * len);
    }
  }

  for (let i = 1; i < placed.length; i++) {
    const prev = placed[i - 1] as number;
    const cur = placed[i] as number;
    if (cur <= prev) placed[i] = Math.min(len, prev + 1);
  }

  return candidates.map((cand, i) => ({
    id: cand.id,
    at: placed[i] as number,
  }));
}

/**
 * Lead highlights slightly ahead of the spoken word (~200–300ms at
 * typical Edge/browser TTS rates of ~14–18 chars/sec).
 */
export const CUE_LEAD_CHARS = 5;

/** Map speech progress (0–1) to the active cue id. */
export function cueIdAtProgress(
  cues: NarrationCue[],
  progress: number,
  scriptLen: number,
  leadChars: number = CUE_LEAD_CHARS,
): string | null {
  if (!cues.length || scriptLen <= 0) return null;
  const charPos = Math.max(0, Math.min(1, progress)) * scriptLen + leadChars;
  let active: NarrationCue | null = null;
  for (const cue of cues) {
    if (cue.at <= charPos) active = cue;
    else break;
  }
  return active?.id ?? null;
}

/**
 * Map a browser-TTS chunk onto cues using cumulative character offsets
 * (avoids off-by-one when chunks are uneven) with the same lead as audio sync.
 */
export function cueIdForChunk(
  cues: NarrationCue[],
  chunkIndex: number,
  chunkCount: number,
  spokenScript: string,
  chunks?: string[],
): string | null {
  if (!cues.length) return null;
  const scriptLen = norm(spokenScript).length || spokenScript.length || 1;
  if (chunkCount <= 1) {
    return cueIdAtProgress(cues, 0, scriptLen);
  }

  if (chunks?.length) {
    let charsBefore = 0;
    const limit = Math.max(0, Math.min(chunkIndex, chunks.length));
    for (let i = 0; i < limit; i++) {
      charsBefore += chunks[i].length + (i > 0 ? 1 : 0);
    }
    // Chunk start + lead — slightly ahead of the first words in this chunk.
    const charPos = charsBefore + CUE_LEAD_CHARS;
    return cueIdAtProgress(cues, charPos / scriptLen, scriptLen, 0);
  }

  // Fallback: map from chunk index with char lead applied inside cueIdAtProgress.
  const approxProgress = chunkIndex / Math.max(1, chunkCount);
  return cueIdAtProgress(cues, approxProgress, scriptLen);
}
