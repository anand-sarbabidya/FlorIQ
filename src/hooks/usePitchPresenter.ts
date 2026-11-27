"use client";

import { slides } from "@/data/slides";
import {
  buildNarrationCues,
  cueIdAtProgress,
  cueIdForChunk,
  normScript,
  type NarrationCue,
} from "@/lib/narrationHighlights";
import { fetchTtsAudio, prepareSpokenScript } from "@/lib/tts";
import { useCallback, useEffect, useRef, useState } from "react";

export type PresenterMode = "auto" | "manual";

/** Soft bed under Florick VO — drop the file at this path to enable. */
export const SPARKLE_THEME_SRC = "/assets/audio/sparkle-theme.mp3";
const BGM_VOLUME = 0.08;

/**
 * Tiny silent MP3 — played inside the Auto click gesture so later
 * HTMLAudioElement.play() (after /api/tts fetch) is allowed by Chrome.
 */
const SILENT_MP3 =
  "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4Sz5W6GAAAAAAD/+1DEAAAGAAGn9AAAIuHq/wAAACEQBGYWYabW0KgDg4OBAIP/g4ODg4P/+Dg4ODg4ODg/+Dg4ODg4ODh/4ODg4ODg4OH/g4ODg4ODg4f+Dg4ODg4ODg4f+Dg4ODg4ODg/+Dg4ODg4ODg4P/g4ODg4ODg4f+Dg4ODg4ODg4f+Dg4ODg4ODg/+Dg4ODg4ODg4P/g4ODg4ODg4f+Dg4ODg4ODg4=";

/** Keep browser utterances under Chrome's ~14–15s silent-pause window. */
const BROWSER_CHUNK_CHARS = 160;

/** Wait for slide enter / rise-in before applying is-narrating (avoids transform fights). */
const SLIDE_ENTER_MS = 640;
/** When Auto is clicked on an already-open slide, enter has already settled. */
const SLIDE_ENTER_GESTURE_MS = 40;
/** Advance highlight slightly ahead of spoken audio. */
const CUE_LEAD_SEC = 0.24;

type Options = {
  index: number;
  goTo: (next: number) => void;
  /** Opening dua waits for fullscreen before VO / reveal sync. */
  isFullscreen?: boolean;
};

/** "server" = /api/tts MP3 (Edge); "browser" = speechSynthesis fallback */
type VoiceEngine = "server" | "browser";

/** Split long scripts into short utterances so Chrome speechSynthesis can finish. */
function chunkSpokenScript(text: string): string[] {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return [];
  if (trimmed.length <= BROWSER_CHUNK_CHARS) return [trimmed];

  const sentences = trimmed.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [trimmed];
  const chunks: string[] = [];
  let buf = "";

  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    const joined = buf ? `${buf} ${sentence}` : sentence;
    if (joined.length <= BROWSER_CHUNK_CHARS) {
      buf = joined;
      continue;
    }
    if (buf) chunks.push(buf);
    if (sentence.length <= BROWSER_CHUNK_CHARS) {
      buf = sentence;
      continue;
    }
    // Hard-wrap very long sentences on spaces.
    let rest = sentence;
    while (rest.length > BROWSER_CHUNK_CHARS) {
      let splitAt = rest.lastIndexOf(" ", BROWSER_CHUNK_CHARS);
      if (splitAt < 40) splitAt = BROWSER_CHUNK_CHARS;
      chunks.push(rest.slice(0, splitAt).trim());
      rest = rest.slice(splitAt).trim();
    }
    buf = rest;
  }
  if (buf) chunks.push(buf);
  return chunks.filter(Boolean);
}

/** Prefer an upbeat, clear female/neutral English system voice for browser fallback. */
function pickPresenterVoice(preferArabic = false): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  if (preferArabic) {
    const arabic = voices.filter((v) => /^ar/i.test(v.lang));
    if (arabic.length) {
      const preferred =
        arabic.find((v) => /hamed|saudi|zariyah|naayf|neural/i.test(v.name)) ||
        arabic[0];
      return preferred;
    }
  }

  const scoreVoice = (voice: SpeechSynthesisVoice) => {
    const name = voice.name.toLowerCase();
    let score = 0;
    if (/en(-|_)(us|gb|au|ie|nz)/i.test(voice.lang) || /^en/i.test(voice.lang)) {
      score += 6;
    }
    if (voice.localService) score += 4;
    if (
      /jenny|ava|sara|sarah|zira|samantha|karen|moira|fiona|victoria|susan|hazel|catherine|michelle|natasha|aria|emma|neural|natural/i.test(
        name,
      )
    ) {
      score += 16;
    }
    if (/female|woman/i.test(name)) score += 10;
    if (/microsoft jenny|google us english|microsoft aria|microsoft zira|samantha/i.test(name)) {
      score += 8;
    }
    if (/jenny/i.test(name)) score += 4;

    if (
      /male|man|david|daniel|mark|alex|fred|george|thomas|james|arthur|ryan|guy|baritone|ravi/i.test(
        name,
      )
    ) {
      score -= 18;
    }
    return score;
  };

  const ranked = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return ranked[0] && scoreVoice(ranked[0]) > 0
    ? ranked[0]
    : ranked.find((v) => /^en/i.test(v.lang)) || ranked[0] || null;
}

/**
 * Pitch presenter: server TTS via /api/tts (Edge Jenny) with speechSynthesis fallback.
 * First start needs a user click (browser gesture rules). After that, slides
 * auto-advance and keep speaking. Slide click still pauses / resumes.
 */
export function usePitchPresenter({ index, goTo, isFullscreen = false }: Options) {
  const [mode, setMode] = useState<PresenterMode>("manual");
  const [speaking, setSpeaking] = useState(false);
  /** Mid-utterance pause (click the slide to resume) */
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  /** Active list item / card while Auto VO narrates it */
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const modeRef = useRef<PresenterMode>("manual");
  const indexRef = useRef(index);
  const goToRef = useRef(goTo);
  const isFullscreenRef = useRef(isFullscreen);
  const runIdRef = useRef(0);
  const speakTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  /** When true, the next index change should auto-speak (slide-to-slide). */
  const autoContinueRef = useRef(false);
  /** Auto on dua before fullscreen — speak once reveal is allowed. */
  const pendingDuaSpeakRef = useRef(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const voAudioRef = useRef<HTMLAudioElement | null>(null);
  const engineRef = useRef<VoiceEngine>("browser");
  const objectUrlRef = useRef<string | null>(null);
  const prefetchRef = useRef<Map<number, { url: string; abort: AbortController }>>(
    new Map(),
  );
  const fetchAbortRef = useRef<AbortController | null>(null);
  const speakSlideRef = useRef<(slideIndex: number, fromUserGesture?: boolean) => void>(
    () => undefined,
  );
  const stopServerAudioRef = useRef<() => void>(() => undefined);
  /** Browser-TTS: continue next chunk after a pause that landed between chunks. */
  const pendingBrowserChunkRef = useRef<(() => void) | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const highlightReadyAtRef = useRef(0);
  const cuesRef = useRef<NarrationCue[]>([]);

  const clearHighlightTimer = useCallback(() => {
    if (highlightTimerRef.current != null) {
      window.clearInterval(highlightTimerRef.current);
      window.clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  }, []);

  const resetHighlight = useCallback(() => {
    clearHighlightTimer();
    cuesRef.current = [];
    highlightReadyAtRef.current = 0;
    setHighlightId(null);
  }, [clearHighlightTimer]);

  const armHighlightGate = useCallback((fromUserGesture: boolean) => {
    const wait = fromUserGesture ? SLIDE_ENTER_GESTURE_MS : SLIDE_ENTER_MS;
    highlightReadyAtRef.current = performance.now() + wait;
    setHighlightId(null);
  }, []);

  const startServerHighlightSync = useCallback(
    (slideIndex: number, spokenScript: string) => {
      clearHighlightTimer();
      const slide = slides[slideIndex];
      if (!slide) {
        setHighlightId(null);
        return;
      }
      const cues = buildNarrationCues(slide, spokenScript);
      cuesRef.current = cues;
      if (!cues.length) {
        setHighlightId(null);
        return;
      }

      // Match cue offsets (normalized script) — avoid unnormalized length lag/skew.
      const scriptLen = normScript(spokenScript).length || 1;

      // Do not apply is-narrating until slide enter settles.
      setHighlightId(null);

      highlightTimerRef.current = window.setInterval(() => {
        if (performance.now() < highlightReadyAtRef.current) {
          setHighlightId((prev) => (prev == null ? prev : null));
          return;
        }
        const audio = voAudioRef.current;
        if (!audio || !audio.duration || Number.isNaN(audio.duration)) return;
        // Time lead only — cueIdAtProgress leadChars=0 to avoid stacking.
        const progress = Math.min(
          1,
          Math.max(0, (audio.currentTime + CUE_LEAD_SEC) / audio.duration),
        );
        const next = cueIdAtProgress(cues, progress, scriptLen, 0);
        setHighlightId((prev) => (prev === next ? prev : next));
      }, 80);
    },
    [clearHighlightTimer],
  );

  const ensureBgm = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!bgmRef.current) {
      const audio = new Audio(SPARKLE_THEME_SRC);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = BGM_VOLUME;
      bgmRef.current = audio;
    }
    bgmRef.current.volume = BGM_VOLUME;
    return bgmRef.current;
  }, []);

  const playBgm = useCallback(() => {
    const audio = ensureBgm();
    if (!audio) return;
    const play = audio.play();
    if (play && typeof play.catch === "function") {
      play.catch(() => {
        /* missing file or autoplay block — VO still works */
      });
    }
  }, [ensureBgm]);

  const pauseBgm = useCallback(() => {
    const audio = bgmRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const stopBgm = useCallback(() => {
    const audio = bgmRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const clearPrefetch = useCallback((keepIndex?: number) => {
    for (const [key, entry] of prefetchRef.current) {
      if (keepIndex != null && key === keepIndex) continue;
      entry.abort.abort();
      URL.revokeObjectURL(entry.url);
      prefetchRef.current.delete(key);
    }
  }, []);

  const ensureVoAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!voAudioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      voAudioRef.current = audio;
    }
    return voAudioRef.current;
  }, []);

  /**
   * Must run synchronously inside the Auto click handler. Chrome blocks
   * unmuted HTMLAudioElement.play() until the element (or page) has played
   * during a user gesture — /api/tts fetch completes too late otherwise,
   * forcing speechSynthesis fallback that stalls on long slides.
   */
  const unlockAudioForGesture = useCallback(() => {
    // Throwaway element so speakSlide's stopServerAudio cannot cancel unlock.
    try {
      const unlocker = new Audio(SILENT_MP3);
      unlocker.muted = true;
      const unlockPlay = unlocker.play();
      if (unlockPlay && typeof unlockPlay.then === "function") {
        unlockPlay
          .then(() => {
            unlocker.pause();
            unlocker.removeAttribute("src");
          })
          .catch(() => undefined);
      }
    } catch {
      /* ignore */
    }

    // Also prime the real VO element under the same gesture.
    const vo = ensureVoAudio();
    if (vo) {
      try {
        vo.muted = true;
        vo.src = SILENT_MP3;
        const play = vo.play();
        if (play && typeof play.then === "function") {
          play
            .then(() => {
              vo.pause();
              vo.currentTime = 0;
              vo.muted = false;
            })
            .catch(() => {
              vo.muted = false;
            });
        } else {
          vo.muted = false;
        }
      } catch {
        vo.muted = false;
      }
    }

    const bgm = ensureBgm();
    if (bgm) {
      bgm.volume = BGM_VOLUME;
      const play = bgm.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => undefined);
      }
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }
    }
  }, [ensureVoAudio, ensureBgm]);

  const stopServerAudio = useCallback(() => {
    fetchAbortRef.current?.abort();
    fetchAbortRef.current = null;
    const audio = voAudioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.onplay = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    revokeObjectUrl();
  }, [revokeObjectUrl]);

  useEffect(() => {
    stopServerAudioRef.current = stopServerAudio;
  }, [stopServerAudio]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    goToRef.current = goTo;
  }, [goTo]);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        ("speechSynthesis" in window || typeof Audio !== "undefined"),
    );
  }, []);

  const clearTimers = useCallback(() => {
    if (speakTimerRef.current != null) {
      window.clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    if (resumeTimerRef.current != null) {
      window.clearInterval(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const setPausedState = useCallback((value: boolean) => {
    pausedRef.current = value;
    setPaused(value);
  }, []);

  const stopSpeech = useCallback(() => {
    runIdRef.current += 1;
    clearTimers();
    autoContinueRef.current = false;
    pendingBrowserChunkRef.current = null;
    setPausedState(false);
    stopBgm();
    stopServerAudio();
    clearPrefetch();
    resetHighlight();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      try {
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }
    }
    engineRef.current = "browser";
    setSpeaking(false);
  }, [clearTimers, setPausedState, stopBgm, stopServerAudio, clearPrefetch, resetHighlight]);

  // Keep fullscreen ref in sync; start/stop dua VO with the reveal.
  useEffect(() => {
    const wasFullscreen = isFullscreenRef.current;
    isFullscreenRef.current = isFullscreen;

    const onDua = slides[indexRef.current]?.kind === "dua";
    if (!onDua) return;

    if (isFullscreen && !wasFullscreen) {
      if (modeRef.current === "auto" && pendingDuaSpeakRef.current) {
        pendingDuaSpeakRef.current = false;
        speakSlideRef.current(indexRef.current, false);
      }
      return;
    }

    if (!isFullscreen && wasFullscreen && modeRef.current === "auto") {
      pendingDuaSpeakRef.current = true;
      stopSpeech();
      // stopSpeech clears auto-continue; keep pending so re-enter restarts VO.
      pendingDuaSpeakRef.current = true;
    }
  }, [isFullscreen, stopSpeech]);

  const advanceAfterVo = useCallback(
    (slideIndex: number, runId: number) => {
      if (runIdRef.current !== runId) return;
      clearTimers();
      resetHighlight();
      setSpeaking(false);

      if (modeRef.current !== "auto") return;
      if (indexRef.current !== slideIndex) return;

      const next = slideIndex + 1;
      if (next >= slides.length) {
        stopBgm();
        setPausedState(false);
        return;
      }

      // Keep BGM rolling across the handoff; next slide speaks automatically.
      autoContinueRef.current = true;
      goToRef.current(next);
    },
    [clearTimers, setPausedState, stopBgm, resetHighlight],
  );

  const prefetchSlide = useCallback((slideIndex: number) => {
    if (slideIndex < 0 || slideIndex >= slides.length) return;
    if (prefetchRef.current.has(slideIndex)) return;

    const slide = slides[slideIndex];
    if (!slide) return;

    const abort = new AbortController();
    const spoken = prepareSpokenScript(slide.script);

    // Placeholder entry so concurrent calls don't double-fetch.
    prefetchRef.current.set(slideIndex, { url: "", abort });

    fetchTtsAudio(spoken, abort.signal, slide.voice)
      .then((blob) => {
        if (!blob || abort.signal.aborted) {
          prefetchRef.current.delete(slideIndex);
          return;
        }
        const url = URL.createObjectURL(blob);
        const existing = prefetchRef.current.get(slideIndex);
        if (!existing || existing.abort !== abort) {
          URL.revokeObjectURL(url);
          return;
        }
        prefetchRef.current.set(slideIndex, { url, abort });
      })
      .catch(() => {
        prefetchRef.current.delete(slideIndex);
      });
  }, []);

  const takePrefetchedUrl = useCallback((slideIndex: number): string | null => {
    const entry = prefetchRef.current.get(slideIndex);
    if (!entry?.url) {
      if (entry) {
        entry.abort.abort();
        prefetchRef.current.delete(slideIndex);
      }
      return null;
    }
    prefetchRef.current.delete(slideIndex);
    return entry.url;
  }, []);

  const speakWithBrowser = useCallback(
    (slideIndex: number, runId: number, spokenScript: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setSupported(false);
        setSpeaking(false);
        return;
      }

      engineRef.current = "browser";
      clearTimers();
      stopServerAudio();

      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }

      const chunks = chunkSpokenScript(spokenScript);
      if (!chunks.length) {
        advanceAfterVo(slideIndex, runId);
        return;
      }

      const slide = slides[slideIndex];
      const cues = slide ? buildNarrationCues(slide, spokenScript) : [];
      cuesRef.current = cues;
      clearHighlightTimer();
      setHighlightId(null);

      const preferArabic =
        Boolean(slides[slideIndex]?.voice?.startsWith("ar-")) ||
        /[\u0600-\u06FF]/.test(spokenScript);
      const preferred = pickPresenterVoice(preferArabic);
      let chunkIndex = 0;
      pendingBrowserChunkRef.current = null;

      const applyChunkHighlight = (i: number) => {
        if (runIdRef.current !== runId || modeRef.current !== "auto") return;
        if (performance.now() < highlightReadyAtRef.current) {
          setHighlightId(null);
          return;
        }
        const next = cueIdForChunk(cues, i, chunks.length, spokenScript, chunks);
        setHighlightId((prev) => (prev === next ? prev : next));
      };

      const syncChunkHighlight = (i: number) => {
        clearHighlightTimer();
        const remaining = highlightReadyAtRef.current - performance.now();
        if (remaining > 0) {
          setHighlightId(null);
          highlightTimerRef.current = window.setTimeout(() => {
            highlightTimerRef.current = null;
            applyChunkHighlight(i);
          }, remaining);
          return;
        }
        applyChunkHighlight(i);
      };

      const speakChunk = () => {
        if (runIdRef.current !== runId || modeRef.current !== "auto") return;
        if (pausedRef.current) {
          pendingBrowserChunkRef.current = speakChunk;
          return;
        }
        pendingBrowserChunkRef.current = null;

        const text = chunks[chunkIndex];
        if (!text) {
          advanceAfterVo(slideIndex, runId);
          return;
        }

        syncChunkHighlight(chunkIndex);

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = preferArabic ? 0.9 : 1.05;
        utterance.pitch = preferArabic ? 1 : 1.05;
        utterance.volume = 1;
        utterance.lang = preferArabic ? "ar-SA" : "en-US";

        if (preferred) {
          utterance.voice = preferred;
          utterance.lang = preferred.lang || (preferArabic ? "ar-SA" : "en-US");
        }

        utterance.onstart = () => {
          if (runIdRef.current === runId && modeRef.current === "auto") {
            setSpeaking(true);
            playBgm();
            syncChunkHighlight(chunkIndex);
          }
        };

        utterance.onerror = (event) => {
          if (event.error === "interrupted" || event.error === "canceled") return;
          if (runIdRef.current !== runId) return;
          // Don't leave Auto stuck — skip the bad chunk and continue.
          chunkIndex += 1;
          if (chunkIndex >= chunks.length) {
            advanceAfterVo(slideIndex, runId);
            return;
          }
          window.setTimeout(speakChunk, 40);
        };

        utterance.onend = () => {
          if (runIdRef.current !== runId) return;
          chunkIndex += 1;
          if (chunkIndex >= chunks.length) {
            advanceAfterVo(slideIndex, runId);
            return;
          }
          speakChunk();
        };

        window.speechSynthesis.speak(utterance);
      };

      setSpeaking(true);
      playBgm();
      speakChunk();

      // Chrome silently pauses speechSynthesis after ~14–15s. The `paused`
      // flag is unreliable — always resume while Auto is presenting.
      resumeTimerRef.current = window.setInterval(() => {
        if (runIdRef.current !== runId || modeRef.current !== "auto") {
          clearTimers();
          return;
        }
        if (pausedRef.current) return;
        try {
          window.speechSynthesis.resume();
        } catch {
          /* ignore */
        }
      }, 4000);
    },
    [stopServerAudio, playBgm, advanceAfterVo, clearTimers, clearHighlightTimer],
  );

  const playServerUrl = useCallback(
    (slideIndex: number, runId: number, url: string, ownsUrl: boolean) => {
      const audio = ensureVoAudio();
      if (!audio) {
        speakWithBrowser(
          slideIndex,
          runId,
          prepareSpokenScript(slides[slideIndex]?.script || ""),
        );
        return;
      }

      clearTimers();
      engineRef.current = "server";
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (ownsUrl) {
        revokeObjectUrl();
        objectUrlRef.current = url;
      }

      audio.onended = () => {
        advanceAfterVo(slideIndex, runId);
      };
      audio.onerror = () => {
        if (runIdRef.current !== runId) return;
        // Mid-play failure → browser fallback for this slide.
        const slide = slides[slideIndex];
        if (!slide) {
          setSpeaking(false);
          pauseBgm();
          return;
        }
        speakWithBrowser(slideIndex, runId, prepareSpokenScript(slide.script));
      };

      audio.src = url;

      // Paused while audio was still fetching — arm the element; resume on click.
      if (pausedRef.current) {
        setSpeaking(false);
        return;
      }

      setSpeaking(true);
      playBgm();
      const spoken = prepareSpokenScript(slides[slideIndex]?.script || "");
      startServerHighlightSync(slideIndex, spoken);

      const play = audio.play();
      if (play && typeof play.catch === "function") {
        play.catch(() => {
          if (runIdRef.current !== runId) return;
          const slide = slides[slideIndex];
          if (!slide) return;
          speakWithBrowser(slideIndex, runId, prepareSpokenScript(slide.script));
        });
      }

      // If the element is unexpectedly paused (tab policy / stall), nudge it.
      resumeTimerRef.current = window.setInterval(() => {
        if (runIdRef.current !== runId || modeRef.current !== "auto") {
          clearTimers();
          return;
        }
        if (pausedRef.current) return;
        const current = voAudioRef.current;
        if (current?.src && current.paused && !current.ended) {
          current.play().catch(() => undefined);
        }
      }, 3000);

      // Warm the next slide while this one plays.
      prefetchSlide(slideIndex + 1);
    },
    [
      ensureVoAudio,
      speakWithBrowser,
      revokeObjectUrl,
      advanceAfterVo,
      pauseBgm,
      playBgm,
      prefetchSlide,
      clearTimers,
      startServerHighlightSync,
    ],
  );

  const speakSlide = useCallback(
    (slideIndex: number, fromUserGesture = false) => {
      if (typeof window === "undefined") return;

      const slide = slides[slideIndex];
      if (!slide) return;

      // Opening dua: do not speak Arabic until fullscreen reveal.
      if (slide.kind === "dua" && !isFullscreenRef.current) {
        pendingDuaSpeakRef.current = modeRef.current === "auto";
        runIdRef.current += 1;
        clearTimers();
        setPausedState(false);
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        stopServerAudio();
        setSpeaking(false);
        return;
      }
      pendingDuaSpeakRef.current = false;

      const runId = ++runIdRef.current;
      clearTimers();
      setPausedState(false);
      resetHighlight();
      // Clear old is-narrating immediately; hold new cues until enter finishes.
      armHighlightGate(fromUserGesture);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      stopServerAudio();

      const spokenScript = prepareSpokenScript(slide.script);
      // After fullscreen reveal, give the first ayah fade a beat before VO.
      const delay =
        slide.kind === "dua" && !fromUserGesture
          ? 420
          : fromUserGesture
            ? 40
            : 280;

      speakTimerRef.current = window.setTimeout(() => {
        if (runIdRef.current !== runId || modeRef.current !== "auto") return;

        const launchBrowser = () => {
          if (runIdRef.current !== runId || modeRef.current !== "auto") return;
          if ("speechSynthesis" in window && !window.speechSynthesis.getVoices().length) {
            const onVoices = () => {
              window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
              if (runIdRef.current === runId) {
                speakWithBrowser(slideIndex, runId, spokenScript);
              }
            };
            window.speechSynthesis.addEventListener("voiceschanged", onVoices);
            window.setTimeout(() => {
              window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
              if (runIdRef.current === runId) {
                speakWithBrowser(slideIndex, runId, spokenScript);
              }
            }, 400);
            return;
          }
          speakWithBrowser(slideIndex, runId, spokenScript);
        };

        const prefetched = takePrefetchedUrl(slideIndex);
        if (prefetched) {
          playServerUrl(slideIndex, runId, prefetched, true);
          return;
        }

        const abort = new AbortController();
        fetchAbortRef.current = abort;
        engineRef.current = "server";
        setSpeaking(true);

        fetchTtsAudio(spokenScript, abort.signal, slide.voice)
          .then((blob) => {
            if (fetchAbortRef.current === abort) fetchAbortRef.current = null;
            if (runIdRef.current !== runId || modeRef.current !== "auto") return;
            if (!blob) {
              launchBrowser();
              return;
            }
            const url = URL.createObjectURL(blob);
            playServerUrl(slideIndex, runId, url, true);
          })
          .catch(() => {
            if (fetchAbortRef.current === abort) fetchAbortRef.current = null;
            if (runIdRef.current !== runId || modeRef.current !== "auto") return;
            if (abort.signal.aborted) return;
            launchBrowser();
          });
      }, delay);
    },
    [
      clearTimers,
      setPausedState,
      stopServerAudio,
      takePrefetchedUrl,
      playServerUrl,
      speakWithBrowser,
      resetHighlight,
      armHighlightGate,
    ],
  );

  useEffect(() => {
    speakSlideRef.current = speakSlide;
  }, [speakSlide]);

  const onSlideClick = useCallback(() => {
    if (typeof window === "undefined") return;
    if (modeRef.current !== "auto") return;

    // Mid-utterance pause → resume
    if (pausedRef.current) {
      setPausedState(false);
      if (engineRef.current === "server") {
        const audio = voAudioRef.current;
        if (audio?.src) {
          const play = audio.play();
          if (play && typeof play.catch === "function") {
            play.catch(() => undefined);
          }
        }
        // If still fetching, playback starts when the blob arrives (pausedRef cleared).
      } else if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.resume();
        } catch {
          /* ignore */
        }
        const pending = pendingBrowserChunkRef.current;
        if (pending) {
          pendingBrowserChunkRef.current = null;
          pending();
        }
      }
      setSpeaking(true);
      playBgm();
      return;
    }

    // Speaking / loading → pause mid-utterance
    if (engineRef.current === "server") {
      const audio = voAudioRef.current;
      const loading = Boolean(fetchAbortRef.current);
      if (!loading && (!audio || audio.paused || audio.ended || !audio.src)) return;
      setPausedState(true);
      pauseBgm();
      audio?.pause();
      setSpeaking(false);
      return;
    }

    if (!("speechSynthesis" in window)) return;
    if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) return;

    setPausedState(true);
    pauseBgm();
    try {
      window.speechSynthesis.pause();
    } catch {
      /* ignore */
    }
    setSpeaking(false);
  }, [setPausedState, playBgm, pauseBgm]);

  const setPresenterMode = useCallback(
    (nextMode: PresenterMode) => {
      if (nextMode === "manual") {
        autoContinueRef.current = false;
        pendingDuaSpeakRef.current = false;
        modeRef.current = "manual";
        setMode("manual");
        stopSpeech();
        return;
      }

      autoContinueRef.current = false;
      modeRef.current = "auto";
      setMode("auto");
      // Unlock HTMLAudio / speechSynthesis inside this click, then start VO.
      unlockAudioForGesture();
      speakSlide(indexRef.current, true);
    },
    [speakSlide, stopSpeech, unlockAudioForGesture],
  );

  // Slide-to-slide autoplay: after VO ends (or nav in Auto), speak the new slide.
  useEffect(() => {
    if (modeRef.current !== "auto") return;

    // Drop previous slide's highlight before enter / new cues.
    setHighlightId(null);

    if (autoContinueRef.current) {
      autoContinueRef.current = false;
      speakSlideRef.current(index, false);
      return;
    }

    // User changed slides via nav while Auto is on — keep presenting.
    if ("speechSynthesis" in window) {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    }
    stopServerAudioRef.current();
    clearTimers();
    setPausedState(false);
    speakSlideRef.current(index, false);
  }, [index, clearTimers, setPausedState]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  useEffect(() => {
    return () => {
      stopBgm();
      bgmRef.current = null;
      stopServerAudio();
      clearPrefetch();
      voAudioRef.current = null;
    };
  }, [stopBgm, stopServerAudio, clearPrefetch]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", warm);
  }, []);

  return {
    mode,
    speaking,
    paused,
    supported,
    highlightId,
    setPresenterMode,
    onSlideClick,
    stopSpeech,
  };
}
