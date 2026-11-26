"use client";

import { slides } from "@/data/slides";
import { useCallback, useEffect, useRef, useState } from "react";

export type PresenterMode = "auto" | "manual";

type Options = {
  index: number;
  goTo: (next: number) => void;
};

/**
 * Browser Speech Synthesis presenter.
 * - auto: narrates the current slide, then advances until the end
 * - manual: cancels speech immediately so a human can present
 * - switching back to auto (or changing slides in auto) starts from the current slide
 */
export function usePitchPresenter({ index, goTo }: Options) {
  const [mode, setMode] = useState<PresenterMode>("manual");
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const modeRef = useRef<PresenterMode>("manual");
  const indexRef = useRef(index);
  const goToRef = useRef(goTo);
  const runIdRef = useRef(0);

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
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const stopSpeech = useCallback(() => {
    runIdRef.current += 1;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speakSlide = useCallback((slideIndex: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    const slide = slides[slideIndex];
    if (!slide) return;

    const runId = ++runIdRef.current;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(slide.script);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /en(-|_)US/i.test(v.lang) && /female|samantha|google/i.test(v.name)) ||
      voices.find((v) => /en(-|_)GB/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      if (runIdRef.current === runId && modeRef.current === "auto") {
        setSpeaking(true);
      }
    };

    utterance.onerror = () => {
      if (runIdRef.current === runId) setSpeaking(false);
    };

    utterance.onend = () => {
      if (runIdRef.current !== runId) return;
      setSpeaking(false);

      // Auto-advance only; speaking the next slide is handled by the index effect
      if (modeRef.current !== "auto") return;
      if (indexRef.current !== slideIndex) return;

      const next = slideIndex + 1;
      if (next >= slides.length) return;
      goToRef.current(next);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const setPresenterMode = useCallback(
    (nextMode: PresenterMode) => {
      if (nextMode === "manual") {
        modeRef.current = "manual";
        setMode("manual");
        stopSpeech();
        return;
      }

      modeRef.current = "auto";
      setMode("auto");
      speakSlide(indexRef.current);
    },
    [speakSlide, stopSpeech],
  );

  // Slide changes while auto is on → restart narration from that slide
  useEffect(() => {
    if (modeRef.current !== "auto") return;
    speakSlide(index);
  }, [index, speakSlide]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  useEffect(() => {
    if (!supported) return;
    const warm = () => window.speechSynthesis.getVoices();
    warm();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", warm);
  }, [supported]);

  return {
    mode,
    speaking,
    supported,
    setPresenterMode,
    stopSpeech,
  };
}
