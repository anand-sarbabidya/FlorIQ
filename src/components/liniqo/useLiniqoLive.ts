"use client";

import { useLiniqoSlide } from "@/components/liniqo/LiniqoSlideContext";
import { useEffect, useRef } from "react";

const SRC = "https://liniqo.com/live/embed.js";

type LiniqoHandle = {
  destroy(): void;
  play?(on: boolean): boolean;
};

type LiniqoDef = {
  name: string;
};

type LiniqoLiveApi = {
  api?: string;
  scan(root?: Element): void;
  load(slug: string, src?: string | null): Promise<LiniqoDef>;
  mount(el: Element, def: LiniqoDef, opts?: object): LiniqoHandle;
};

type LiniqoEl = HTMLDivElement & {
  __liniqo?: LiniqoHandle;
  __lq?: number;
};

declare global {
  interface Window {
    LiniqoLive?: LiniqoLiveApi;
    /** When set before embed.js runs, disables MutationObserver auto-scan. */
    LiniqoLiveManual?: boolean;
  }
}

function getApi(): LiniqoLiveApi | undefined {
  return window.LiniqoLive;
}

function ensureScript(): Promise<LiniqoLiveApi> {
  // Own the mount lifecycle — don't let IntersectionObserver auto-scan race us.
  window.LiniqoLiveManual = true;

  const existing = getApi();
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    let s = document.querySelector(
      `script[src="${SRC}"]`,
    ) as HTMLScriptElement | null;
    const done = () => {
      const api = getApi();
      if (api) resolve(api);
      else reject(new Error("LiniqoLive missing after embed.js load"));
    };
    if (!s) {
      window.LiniqoLiveManual = true;
      s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      document.head.appendChild(s);
    }
    if (getApi()) {
      done();
      return;
    }
    s.addEventListener("load", done, { once: true });
    s.addEventListener(
      "error",
      () => reject(new Error("Failed to load Liniqo embed.js")),
      { once: true },
    );
  });
}

function readMountOpts(el: HTMLElement) {
  const intensity = parseFloat(el.getAttribute("data-intensity") || "");
  return {
    accent: el.getAttribute("data-accent") || undefined,
    line: el.getAttribute("data-line") || undefined,
    bg: el.getAttribute("data-bg") || undefined,
    theme: el.getAttribute("data-theme") || undefined,
    scroll: el.getAttribute("data-scroll") || undefined,
    intensity: Number.isFinite(intensity) ? intensity : 0.5,
  };
}

function loadSrc(api: LiniqoLiveApi, slug: string, key: string | null) {
  if (!key) return null;
  const base = api.api || "https://liniqo.com/api/live";
  return `${base}?id=${encodeURIComponent(slug)}&t=${encodeURIComponent(key)}`;
}

/**
 * Mount a Liniqo Live figure and optionally start its ambient auto-tour.
 * Manual pointer still wins — the ghost tour yields to a real cursor.
 *
 * Explicit load+mount (with license key) — never wait on IntersectionObserver
 * scan, which misses figures inside overflow:hidden / enter-anim slides until
 * a click forces a reflow.
 */
export function useLiniqoLive({
  auto = true,
  remountKey,
}: {
  auto?: boolean;
  /** Bump when the host slide becomes active so the figure remounts fresh. */
  remountKey?: string | number;
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const slideCtx = useLiniqoSlide();
  const mountKey = remountKey ?? slideCtx.remountKey;

  useEffect(() => {
    const el = ref.current as LiniqoEl | null;
    if (!el) return;

    let cancelled = false;
    let timer = 0;
    let raf = 0;
    const started = Date.now();
    const slug = el.getAttribute("data-liniqo");
    if (!slug) return;

    // Claim immediately so a late scan() cannot observe / double-mount us.
    el.__lq = 1;

    const armPlay = () => {
      if (cancelled || !auto) return;
      if (el.__liniqo?.play) {
        el.__liniqo.play(true);
        // Nudge hairline's visibility IO so the tick loop marks the stage visible.
        window.dispatchEvent(new Event("scroll"));
        return;
      }
      if (Date.now() - started > 12000) return;
      timer = window.setTimeout(armPlay, 140);
    };

    const afterLayout = (fn: () => void) => {
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(fn);
      });
    };

    (async () => {
      try {
        const api = await ensureScript();
        if (cancelled) return;

        el.__liniqo?.destroy?.();
        el.__liniqo = undefined;
        el.replaceChildren();

        const key = el.getAttribute("data-key");
        const def = await api.load(slug, loadSrc(api, slug, key));
        if (cancelled) return;

        const handle = api.mount(el, def, readMountOpts(el));
        el.__liniqo = handle;
        el.__lq = 1;

        afterLayout(() => {
          if (cancelled) return;
          window.dispatchEvent(new Event("scroll"));
          armPlay();
        });
      } catch {
        // Soft-fail: leave the empty mount node; other slides stay unaffected.
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      el.__liniqo?.destroy();
      el.__liniqo = undefined;
      el.__lq = 0;
    };
  }, [auto, mountKey]);

  return ref;
}
