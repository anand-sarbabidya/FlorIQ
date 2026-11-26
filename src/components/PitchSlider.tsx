"use client";

import { slides, type Slide } from "@/data/slides";
import { usePitchPresenter } from "@/hooks/usePitchPresenter";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const TOTAL = slides.length;

function clampIndex(index: number) {
  return Math.max(0, Math.min(TOTAL - 1, index));
}

/** Premium journey rail — used on sparse process slides */
function ShapeFlow({
  items,
  tone = "neutral",
}: {
  items: string[];
  tone?: "neutral" | "decline";
}) {
  return (
    <div className={`journey ${tone === "decline" ? "journey--decline" : ""}`} aria-label="Process flow">
      <div className="journey__rail" aria-hidden="true" />
      <ol className="journey__list">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li
              key={item}
              className={`journey__step ${isLast && tone === "decline" ? "journey__step--end" : ""}`}
              style={{ "--i": i } as CSSProperties}
            >
              <span className="journey__orb">
                <span className="journey__orb-ring" />
                <span className="journey__orb-core">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <span className="journey__label">{item}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SlideShell({ slide, children }: { slide: Slide; children: ReactNode }) {
  const isDark = slide.kind === "title" || slide.kind === "close";
  return (
    <article
      className={`slide ${isDark ? "slide--dark" : "slide--light"}`}
      data-kind={slide.kind}
    >
      <div className="slide__inner">{children}</div>
    </article>
  );
}

function SlideBody({ slide }: { slide: Slide }) {
  switch (slide.kind) {
    case "title":
      return (
        <div className="layout layout--split">
          <div className="copy">
            <p className="eyebrow">{slide.eyebrow}</p>
            <h1 className="brand">{slide.title}</h1>
            <p className="tagline">{slide.subtitle}</p>
            <p className="lede">{slide.note}</p>
            <ul className="contacts">
              {slide.contacts?.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="visual visual--hero visual--contained">
            {slide.video ? (
              <video
                className="visual__video"
                src={slide.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={slide.imageAlt || slide.title}
              />
            ) : slide.image ? (
              <Image
                src={slide.image}
                alt={slide.imageAlt || slide.title}
                width={900}
                height={506}
                priority
                className="visual__img"
              />
            ) : null}
          </div>
        </div>
      );

    case "problem":
      return (
        <div className="layout layout--problem">
          <header className="problem-head">
            <div className="problem-head__copy">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h2 className="title title--problem">{slide.title}</h2>
              {slide.subtitle ? <p className="lede problem-head__lede">{slide.subtitle}</p> : null}
            </div>
            {slide.video ? (
              <div className="problem-head__visual">
                <video
                  className="problem-video"
                  src={slide.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={slide.imageAlt || slide.title}
                />
              </div>
            ) : null}
          </header>
          {slide.flow ? <ShapeFlow items={slide.flow} tone="decline" /> : null}
          <div className="grid grid--2 problem-grid">
            {slide.cards?.map((card, i) => (
              <div key={card.title} className="problem-card" style={{ "--i": i } as CSSProperties}>
                <span className="problem-card__index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="problem-card__body">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "solution":
      return (
        <div className="layout layout--split layout--solution">
          <div className="copy">
            <p className="eyebrow">{slide.eyebrow}</p>
            <h2 className="title">{slide.title}</h2>
            {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
            <div className="solution-stack">
              {slide.cards?.slice(0, 3).map((card, i) => (
                <div
                  key={card.title}
                  className="feature-card"
                  style={{ "--i": i } as CSSProperties}
                >
                  <span className="feature-card__index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="feature-card__body">
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="copy">
            <div className="visual visual--panel visual--contained">
              {slide.video ? (
                <video
                  className="visual__video"
                  src={slide.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={slide.imageAlt || slide.title}
                />
              ) : slide.image ? (
                <Image
                  src={slide.image}
                  alt={slide.imageAlt || slide.title}
                  width={900}
                  height={506}
                  className="visual__img"
                />
              ) : null}
            </div>
            <div className="solution-stack solution-stack--right">
              {slide.cards?.slice(3).map((card, i) => (
                <div
                  key={card.title}
                  className="feature-card"
                  style={{ "--i": i + 3 } as CSSProperties}
                >
                  <span className="feature-card__index" aria-hidden="true">
                    {String(i + 4).padStart(2, "0")}
                  </span>
                  <div className="feature-card__body">
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "roadmap":
      return (
        <div className="layout layout--roadmap">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          <div className="roadmap-grid">
            {slide.steps?.map((step, i) => (
              <div
                key={step.index + step.title}
                className="feature-card feature-card--step roadmap-card"
                style={{ "--i": i } as CSSProperties}
              >
                <span className="feature-card__index">{step.index}</span>
                <div className="feature-card__body">
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "steps":
      return (
        <div className="layout">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          <div
            className={`steps ${
              (slide.steps?.length ?? 0) === 4 ? "steps--four" : ""
            }`}
          >
            {slide.steps?.map((step, i) => {
              const inPhone = i >= 1 && i <= 3;
              return (
                <div
                  key={step.index + step.title}
                  className="step-col"
                  style={{ "--i": i } as CSSProperties}
                >
                  <div className="feature-card feature-card--step">
                    <span className="feature-card__index">{step.index}</span>
                    <div className="feature-card__body">
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </div>
                  {step.image ? (
                    <div className={`step-col__media ${inPhone ? "step-col__media--phone" : ""}`}>
                      {inPhone ? (
                        <div className="phone-frame" aria-hidden={false}>
                          <span className="phone-frame__speaker" />
                          <span className="phone-frame__notch" />
                          <div className="phone-frame__screen">
                            <Image
                              src={step.image}
                              alt={step.title}
                              width={480}
                              height={960}
                              className="step-col__img step-col__img--phone"
                            />
                          </div>
                          <span className="phone-frame__btn phone-frame__btn--silent" />
                          <span className="phone-frame__btn phone-frame__btn--vol-up" />
                          <span className="phone-frame__btn phone-frame__btn--vol-down" />
                          <span className="phone-frame__btn phone-frame__btn--power" />
                        </div>
                      ) : (
                        <Image
                          src={step.image}
                          alt={step.title}
                          width={480}
                          height={480}
                          className="step-col__img"
                        />
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          {slide.note ? <p className="footnote">{slide.note}</p> : null}
        </div>
      );

    case "market":
      return (
        <div className="layout layout--market">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          <div className="stats">
            {slide.stats?.map((stat) => (
              <div key={stat.value} className="stat market-stat">
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid--4 market-grid">
            {slide.cards?.map((card) => (
              <div key={card.title} className="card market-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
          {slide.note ? <p className="footnote">{slide.note}</p> : null}
        </div>
      );

    case "pricing":
      return (
        <div className="layout layout--pricing">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          <div className="tiers">
            {slide.tiers?.map((tier) => (
              <div
                key={tier.name}
                className={`tier pricing-tier ${tier.featured ? "tier--featured" : ""} ${tier.name === "Starter" ? "tier--starter" : ""}`}
              >
                <p
                  className="tier__name"
                  style={tier.name === "Starter" ? { color: "#e8eaee" } : undefined}
                >
                  {tier.name}
                </p>
                <p className="tier__price">{tier.price}</p>
                <ul>
                  {tier.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );

    case "business":
      return (
        <div className="layout layout--business">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          {slide.flow ? <ShapeFlow items={slide.flow} /> : null}
          <div className="grid grid--3">
            {slide.cards?.map((card) => (
              <div key={card.title} className="card forest-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
          {slide.note ? <p className="footnote">{slide.note}</p> : null}
        </div>
      );

    case "audience":
      return (
        <div className="layout layout--audience">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          <div className="share-list">
            {slide.shares?.map((share) => (
              <div key={share.label} className="share-row forest-card">
                <div className="share-row__top">
                  <strong>{share.label}</strong>
                  <span>{share.pct}%</span>
                </div>
                <div className="share-row__track" aria-hidden="true">
                  <span style={{ width: `${share.pct}%` }} />
                </div>
                <p>{share.body}</p>
              </div>
            ))}
          </div>
          {slide.note ? <p className="footnote">{slide.note}</p> : null}
        </div>
      );

    case "advantage":
      return (
        <div className="layout layout--advantage">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          <div className="grid grid--3">
            {slide.cards?.map((card) => (
              <div key={card.title} className="card forest-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case "validation":
      return (
        <div className="layout layout--validation">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          <div className="crops">
            {slide.crops?.map((crop) => (
              <figure key={crop.name} className="crop forest-card">
                <div className="crop__media">
                  <Image
                    src={crop.image}
                    alt={crop.name}
                    width={480}
                    height={480}
                  />
                </div>
                <figcaption>{crop.name}</figcaption>
              </figure>
            ))}
          </div>
          {slide.note ? <p className="status">{slide.note}</p> : null}
        </div>
      );

    case "team":
      return (
        <div className="layout layout--team">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          <div className="team-grid">
            {slide.cards?.map((card) => (
              <article key={card.title} className="team-card">
                <div className="team-card__photo">
                  {card.image ? (
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={256}
                      height={256}
                      className="team-card__img"
                    />
                  ) : (
                    <span className="team-card__initials" aria-hidden="true">
                      {card.title
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </span>
                  )}
                </div>
                <div className="team-card__body">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      );

    case "close":
      return (
        <div className="layout layout--split layout--close">
          <div className="copy">
            <p className="eyebrow">{slide.eyebrow}</p>
            <h2 className="title title--display">{slide.title}</h2>
            {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
            <ul className="contacts contacts--close">
              {slide.contacts?.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className="visual visual--hero visual--contained">
            {slide.video ? (
              <video
                className="visual__video"
                src={slide.video}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={slide.imageAlt || slide.title}
              />
            ) : slide.image ? (
              <Image
                src={slide.image}
                alt={slide.imageAlt || slide.title}
                width={900}
                height={506}
                className="visual__img"
              />
            ) : null}
          </div>
        </div>
      );

    default:
      return (
        <div className="layout">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          {slide.cards ? (
            <div className={`grid ${slide.cards.length > 4 ? "grid--3" : "grid--2"}`}>
              {slide.cards.map((card) => (
                <div key={card.title} className="card">
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
              ))}
            </div>
          ) : null}
          {slide.note ? <p className="footnote">{slide.note}</p> : null}
        </div>
      );
  }
}

export default function PitchSlider() {
  const [index, setIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex((current) => {
      const clamped = clampIndex(next);
      if (clamped !== current) setAnimKey((key) => key + 1);
      return clamped;
    });
  }, []);

  const { mode, speaking, paused, supported, setPresenterMode, onSlideClick } =
    usePitchPresenter({
      index,
      goTo,
    });

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") {
      event.preventDefault();
      goTo(index + 1);
    }
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      goTo(index - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      goTo(TOTAL - 1);
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = Number(params.get("s"));
    if (!Number.isNaN(fromQuery) && fromQuery >= 1) {
      setIndex(clampIndex(fromQuery - 1));
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("s", String(index + 1));
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [index]);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  useEffect(() => {
    const syncFullscreen = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      setIsFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const node = stageRef.current;
    if (!node) return;

    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const el = node as HTMLDivElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };

    const active = document.fullscreenElement || doc.webkitFullscreenElement;

    try {
      if (active) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        setIsFullscreen(false);
      } else if (node.requestFullscreen) {
        setIsFullscreen(true); // apply centered layout immediately — avoids late jump
        await node.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        setIsFullscreen(true);
        await el.webkitRequestFullscreen();
      }
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement || doc.webkitFullscreenElement));
    }
  }, []);

  const progress = ((index + 1) / TOTAL) * 100;
  const slide = slides[index];

  return (
    <section
      className="slider"
      style={{ "--progress": `${progress}%` } as CSSProperties}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current == null) return;
        const delta = event.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(delta) < 48) return;
        if (delta < 0) next();
        else prev();
      }}
    >
      <div className="slider__progress" aria-hidden="true">
        <span />
      </div>

      <div className="presenter-bar">
        <div className="presenter-bar__modes" role="group" aria-label="Presentation mode">
          <button
            type="button"
            className={`presenter-bar__mode ${mode === "manual" ? "is-active" : ""}`}
            onClick={() => setPresenterMode("manual")}
            aria-pressed={mode === "manual"}
          >
            Manual
          </button>
          <button
            type="button"
            className={`presenter-bar__mode ${mode === "auto" ? "is-active" : ""}`}
            onClick={() => setPresenterMode("auto")}
            aria-pressed={mode === "auto"}
            disabled={!supported}
          >
            Auto · AI Voice
          </button>
        </div>
        <p className="presenter-bar__status">
          {!supported
            ? "Voice not supported in this browser — try Chrome or Edge"
            : mode === "auto"
              ? paused
                ? "Paused — click the slide to resume"
                : speaking
                  ? "AI presenting… auto-advances · click slide to pause"
                  : "Starting voice… unmute the tab if needed"
              : "Manual mode — you present; AI is silent"}
        </p>
      </div>

      <div
        ref={stageRef}
        className={`slider__stage ${isFullscreen ? "is-fullscreen" : ""}`}
      >
        <div
          className={`slider__canvas ${mode === "auto" ? "slider__canvas--interactive" : ""}`}
          onClick={() => {
            if (mode === "auto") onSlideClick();
          }}
          role={mode === "auto" ? "button" : undefined}
          tabIndex={mode === "auto" ? 0 : undefined}
          onKeyDown={(event) => {
            if (mode !== "auto") return;
            if (event.key === "Enter" || event.key === "p") {
              event.preventDefault();
              onSlideClick();
            }
          }}
          aria-label={
            mode === "auto"
              ? paused
                ? "Resume AI voice"
                : "Pause AI voice"
              : undefined
          }
        >
          <div className="slider__stage-inner" key={animKey}>
            <SlideShell slide={slide}>
              <SlideBody slide={slide} />
            </SlideShell>
          </div>

          {mode === "auto" && paused ? (
            <div className="slide-pause" aria-hidden="true">
              <span className="slide-pause__circle">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                  <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                </svg>
              </span>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="slide-fullscreen"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void toggleFullscreen();
          }}
          onMouseDown={(event) => event.stopPropagation()}
          aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
          title={isFullscreen ? "Exit full screen" : "Full screen"}
        >
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7 14H5v5h5v-2H7v-3zm12 0h-2v3h-3v2h5v-5zM7 5h3V3H5v5h2V5zm12-2h-5v2h3v3h2V3z"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M7 14H5v5h5v-2H7v-3zm0-9h3V3H5v5h2V5zm12 9h-2v3h-3v2h5v-5zm-2-9V3h-3v2h3v3h2V5h-2z"
              />
            </svg>
          )}
        </button>
      </div>

      <nav className="slider__nav" aria-label="Pitch navigation">
        <button
          type="button"
          className="slider__btn"
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous slide"
        >
          ←
        </button>

        <div className="slider__dots" role="tablist" aria-label="Slides">
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}: ${item.title}`}
              className={`slider__dot ${i === index ? "is-active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <button
          type="button"
          className="slider__btn"
          onClick={next}
          disabled={index === TOTAL - 1}
          aria-label="Next slide"
        >
          →
        </button>
      </nav>

      <p className="slider__meta">
        <span>
          {String(index + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>
        <span className="slider__hint">Arrow keys · Space · Swipe</span>
      </p>
    </section>
  );
}
