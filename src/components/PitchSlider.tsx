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
          <div className="visual visual--hero">
            {slide.image ? (
              <Image
                src={slide.image}
                alt={slide.imageAlt || slide.title}
                width={1400}
                height={788}
                priority
                className="visual__img"
              />
            ) : null}
          </div>
        </div>
      );

    case "solution":
      return (
        <div className="layout layout--split">
          <div className="copy">
            <p className="eyebrow">{slide.eyebrow}</p>
            <h2 className="title">{slide.title}</h2>
            {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
            {slide.cards ? (
              <div className="stack">
                {slide.cards.slice(0, 3).map((card) => (
                  <div key={card.title} className="mini-card">
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div className="copy">
            <div className="visual visual--panel" style={{ marginBottom: "0.85rem" }}>
              {slide.image ? (
                <Image
                  src={slide.image}
                  alt={slide.imageAlt || slide.title}
                  width={1400}
                  height={788}
                  className="visual__img"
                />
              ) : null}
            </div>
            {slide.cards ? (
              <div className="stack">
                {slide.cards.slice(3).map((card) => (
                  <div key={card.title} className="mini-card">
                    <h3>{card.title}</h3>
                    <p>{card.body}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      );

    case "steps":
    case "roadmap":
      return (
        <div className="layout">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          <div className={`steps ${slide.kind === "roadmap" || (slide.steps?.length ?? 0) === 4 ? "steps--four" : ""}`}>
            {slide.steps?.map((step) => (
              <div key={step.index + step.title} className="step">
                <span className="step__index">{step.index}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
          {slide.note ? <p className="footnote">{slide.note}</p> : null}
        </div>
      );

    case "market":
      return (
        <div className="layout">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          <div className="stats">
            {slide.stats?.map((stat) => (
              <div key={stat.value} className="stat">
                <strong>{stat.value}</strong>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid--4">
            {slide.cards?.map((card) => (
              <div key={card.title} className="card">
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
        <div className="layout">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          <div className="tiers">
            {slide.tiers?.map((tier) => (
              <div
                key={tier.name}
                className={`tier ${tier.featured ? "tier--featured" : ""}`}
              >
                <p className="tier__name">{tier.name}</p>
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

    case "validation":
      return (
        <div className="layout">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          <div className="crops">
            {slide.crops?.map((crop) => (
              <figure key={crop.name} className="crop">
                <Image src={crop.image} alt={crop.name} width={800} height={800} />
                <figcaption>{crop.name}</figcaption>
              </figure>
            ))}
          </div>
          {slide.note ? <p className="status">{slide.note}</p> : null}
        </div>
      );

    case "close":
      return (
        <div className="layout layout--close">
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
      );

    default:
      return (
        <div className="layout">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          {slide.cards ? (
            <div
              className={`grid ${
                slide.cards.length > 4 ? "grid--3" : slide.cards.length === 4 ? "grid--2" : "grid--2"
              }`}
            >
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
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex((current) => {
      const clamped = clampIndex(next);
      if (clamped !== current) setAnimKey((key) => key + 1);
      return clamped;
    });
  }, []);

  const { mode, speaking, supported, setPresenterMode } = usePitchPresenter({
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
            ? "Voice not supported in this browser"
            : mode === "auto"
              ? speaking
                ? "AI presenting this slide…"
                : "AI ready — advancing automatically"
              : "Manual mode — you present; AI is silent"}
        </p>
      </div>

      <div className="slider__stage" key={animKey}>
        <SlideShell slide={slide}>
          <SlideBody slide={slide} />
        </SlideShell>
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
