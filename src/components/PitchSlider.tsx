"use client";

import { slides, type Slide } from "@/data/slides";
import { usePitchPresenter } from "@/hooks/usePitchPresenter";
import AutomationGears from "@/components/liniqo/AutomationGears";
import GrowthChart from "@/components/liniqo/GrowthChart";
import { LiniqoSlideProvider } from "@/components/liniqo/LiniqoSlideContext";
import LiniqoStill from "@/components/liniqo/LiniqoStill";
import NotificationBell from "@/components/liniqo/NotificationBell";
import OfficePlant from "@/components/liniqo/OfficePlant";
import PlantGrowthScroll from "@/components/liniqo/PlantGrowthScroll";
import PricingTiersLive from "@/components/liniqo/PricingTiers";
import QuranBook from "@/components/liniqo/QuranBook";
import SmartHomeScroll from "@/components/liniqo/SmartHomeScroll";
import TeamAvatars from "@/components/liniqo/TeamAvatars";
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

function narrateClass(highlightId: string | null, id: string) {
  return highlightId === id ? " is-narrating" : "";
}

/** Icon + copy row — replaces card grids with Liniqo stills */
function FeatureLine({
  icon,
  title,
  body,
  i = 0,
  highlightId = null,
}: {
  icon: string;
  title: string;
  body: string;
  i?: number;
  highlightId?: string | null;
}) {
  return (
    <li
      className={`feature-line${narrateClass(highlightId, `card-${i}`)}`}
      style={{ "--i": i } as CSSProperties}
    >
      <LiniqoStill id={icon} alt="" className="feature-line__icon" />
      <div className="feature-line__copy">
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </li>
  );
}

function clampIndex(index: number) {
  return Math.max(0, Math.min(TOTAL - 1, index));
}

/** Premium journey rail — used on sparse process slides */
function ShapeFlow({
  items,
  tone = "neutral",
  highlightId = null,
}: {
  items: string[];
  tone?: "neutral" | "decline";
  highlightId?: string | null;
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
              className={`journey__step${isLast && tone === "decline" ? " journey__step--end" : ""}${narrateClass(highlightId, `flow-${i}`)}`}
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
  const isDark =
    slide.kind === "dua" || slide.kind === "title" || slide.kind === "close";
  return (
    <article
      className={`slide ${isDark ? "slide--dark" : "slide--light"}`}
      data-kind={slide.kind}
      data-theme={isDark ? "dark" : "light"}
    >
      <div className="slide__inner">{children}</div>
    </article>
  );
}

function SlideBody({
  slide,
  revealDua,
  highlightId = null,
}: {
  slide: Slide;
  /** Surah Al-Fātiḥah after fullscreen; welcome message before. */
  revealDua: boolean;
  highlightId?: string | null;
}) {
  switch (slide.kind) {
    case "dua":
      return (
        <div className="layout layout--dua">
          {revealDua ? (
            <>
              <p className="eyebrow dua__eyebrow">{slide.eyebrow}</p>
              <div className="dua" dir="rtl" lang="ar">
                {(slide.arabicLines ?? []).map((line) => (
                  <p key={line} className="dua__arabic">
                    {line}
                  </p>
                ))}
              </div>
              {slide.translation ? (
                <blockquote className="dua__translation" lang="en">
                  <p>“{slide.translation}”</p>
                  {slide.citation ? (
                    <cite className="dua__citation">{slide.citation}</cite>
                  ) : null}
                </blockquote>
              ) : null}
              <div className="dua__book">
                <div className="lq-figure lq-figure--live lq-figure--outline lq-figure--dua-book">
                  <QuranBook
                    className="lq-figure__live"
                    bg="transparent"
                    line="#52b788"
                    accent="#d4bc7a"
                  />
                </div>
                <p className="dua__book-caption">The Holy Qur’an</p>
              </div>
            </>
          ) : (
            <div className="dua-welcome" aria-live="polite">
              <p className="dua-welcome__bismillah" dir="rtl" lang="ar">
                بِسْمِ اللَّهِ
              </p>
              <p className="dua-welcome__title">Welcome</p>
              <p className="dua-welcome__hint">Enter full screen to begin</p>
            </div>
          )}
        </div>
      );

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

    case "problem": {
      const problemIcons = [
        "watering-can",
        "weather-station-mast",
        "energy-saving-bulb-meter",
        "sprinkler-timer-controller",
      ];
      return (
        <div className="layout layout--problem layout--illustrated">
          <div className="illus-split">
            <div className="illus-split__copy">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h2 className="title title--problem">{slide.title}</h2>
              {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
              {slide.flow ? (
                <ShapeFlow items={slide.flow} tone="decline" highlightId={highlightId} />
              ) : null}
              <ul className="feature-lines">
                {slide.cards?.map((card, i) => (
                  <FeatureLine
                    key={card.title}
                    icon={problemIcons[i] ?? "watering-can"}
                    title={card.title}
                    body={card.body}
                    i={i}
                    highlightId={highlightId}
                  />
                ))}
              </ul>
            </div>
            <div className="illus-split__art">
              {slide.video ? (
                <div className="visual visual--hero visual--contained visual--art-video">
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
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    case "solution": {
      const solutionIcons = [
        "soil-sensor-probe",
        "drip-irrigation-line",
        "seedling-tray-rack",
        "weather-station-mast",
        "vertical-farm-racks",
        "widget-grid-layout",
      ];
      return (
        <div className="layout layout--solution layout--illustrated">
          <div className="illus-split">
            <div className="illus-split__copy">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h2 className="title">{slide.title}</h2>
              {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
              <ul className="feature-lines feature-lines--compact">
                {slide.cards?.map((card, i) => (
                  <FeatureLine
                    key={card.title}
                    icon={solutionIcons[i] ?? "soil-sensor-probe"}
                    title={card.title}
                    body={card.body}
                    i={i}
                    highlightId={highlightId}
                  />
                ))}
              </ul>
            </div>
            <div className="illus-split__art">
              {slide.video ? (
                <div className="visual visual--hero visual--contained visual--art-video">
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
                </div>
              ) : null}
            </div>
          </div>
        </div>
      );
    }

    case "roadmap": {
      const roadmapIcons = [
        "seedling-tray-rack",
        "kpi-tile-wall",
        "smart-meter-box",
        "smart-thermostat-wall",
      ];
      return (
        <div className="layout layout--roadmap layout--illustrated">
          <div className="illus-split">
            <div className="illus-split__copy">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h2 className="title">{slide.title}</h2>
              <ol className="timeline">
                {slide.steps?.map((step, i) => (
                  <li
                    key={step.index + step.title}
                    className={`timeline__item${narrateClass(highlightId, `step-${i}`)}`}
                    style={{ "--i": i } as CSSProperties}
                  >
                    <LiniqoStill
                      id={roadmapIcons[i] ?? "seedling-tray-rack"}
                      alt=""
                      className="timeline__icon"
                    />
                    <div>
                      <span className="timeline__index">{step.index}</span>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="illus-split__art">
              <div className="lq-figure lq-figure--still-lg">
                <LiniqoStill
                  id="smart-thermostat-wall"
                  alt="Smart thermostat"
                  className="lq-still lq-still--hero"
                />
              </div>
              <div className="lq-figure lq-figure--live">
                <SmartHomeScroll className="lq-figure__live" />
              </div>
              <p className="lq-hint">Auto rooms light up · hover to steer</p>
            </div>
          </div>
        </div>
      );
    }

    case "steps": {
      const stepIcons = [
        "sapling-planting-pot",
        "soil-sensor-probe",
        "sprinkler-timer-controller",
        "notification-center-popover",
        "flower-pot",
      ];
      return (
        <div className="layout layout--steps layout--illustrated">
          <aside className="steps-intro">
            <p className="eyebrow">{slide.eyebrow}</p>
            <h2 className="title">{slide.title}</h2>
            {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
            <div className="steps-intro__art">
              <div className="lq-figure lq-figure--live lq-figure--compact">
                <OfficePlant className="lq-figure__live" />
              </div>
              <p className="lq-hint">Auto sway · hover — leaves follow</p>
            </div>
          </aside>
          <ol className="timeline timeline--rail">
            {slide.steps?.map((step, i) => (
              <li
                key={step.index + step.title}
                className={`timeline__item${narrateClass(highlightId, `step-${i}`)}`}
                style={{ "--i": i } as CSSProperties}
              >
                <LiniqoStill id={stepIcons[i] ?? "flower-pot"} alt="" className="timeline__icon" />
                <div>
                  <span className="timeline__index">{step.index}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          {slide.note ? <p className="footnote">{slide.note}</p> : null}
        </div>
      );
    }

    case "market": {
      const marketIcons = [
        "raised-garden-bed",
        "sapling-planting-pot",
        "compost-bin-heap",
        "greenhouse-glass",
      ];
      return (
        <div className="layout layout--market layout--illustrated">
          <div className="illus-split">
            <div className="illus-split__copy">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h2 className="title">{slide.title}</h2>
              {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
              <div className="stats stats--inline">
                {slide.stats?.map((stat, i) => (
                  <div
                    key={stat.value}
                    className={`stat market-stat${narrateClass(highlightId, `stat-${i}`)}`}
                  >
                    <strong>{stat.value}</strong>
                    <p>{stat.label}</p>
                  </div>
                ))}
              </div>
              <ul className="feature-lines feature-lines--compact">
                {slide.cards?.map((card, i) => (
                  <FeatureLine
                    key={card.title}
                    icon={marketIcons[i] ?? "greenhouse-glass"}
                    title={card.title}
                    body={card.body}
                    i={i}
                    highlightId={highlightId}
                  />
                ))}
              </ul>
              {slide.note ? <p className="footnote">{slide.note}</p> : null}
            </div>
            <div className="illus-split__art illus-split__art--stack">
              <div className="lq-figure lq-figure--live">
                <GrowthChart className="lq-figure__live" />
              </div>
              <div className="lq-figure lq-figure--live lq-figure--secondary">
                <NotificationBell className="lq-figure__live" />
              </div>
              <p className="lq-hint">Auto tour · hover chart or bell</p>
            </div>
          </div>
        </div>
      );
    }

    case "pricing":
      return (
        <div className="layout layout--pricing layout--illustrated">
          <div className="illus-split">
            <div className="illus-split__copy">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h2 className="title">{slide.title}</h2>
              <div className="tiers tiers--bare">
                {slide.tiers?.map((tier, i) => (
                  <div
                    key={tier.name}
                    className={`tier pricing-tier tier--bare ${tier.featured ? "tier--featured" : ""} ${tier.name === "Starter" ? "tier--starter" : ""} ${tier.name === "Premium" ? "tier--premium" : ""}${narrateClass(highlightId, `tier-${i}`)}`}
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
            <div className="illus-split__art">
              <div className="lq-figure lq-figure--live">
                <PricingTiersLive className="lq-figure__live" />
              </div>
              <p className="lq-hint">Auto tour · hover a pedestal to lift it</p>
            </div>
          </div>
        </div>
      );

    case "business": {
      const businessIcons = [
        "pricing-tier-cards",
        "seedling-tray-rack",
        "sprinkler-timer-controller",
        "onboarding-stepper",
      ];
      return (
        <div className="layout layout--business layout--illustrated">
          <div className="illus-split">
            <div className="illus-split__copy">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h2 className="title">{slide.title}</h2>
              {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
              {slide.flow ? <ShapeFlow items={slide.flow} highlightId={highlightId} /> : null}
              <ul className="feature-lines">
                {slide.cards?.map((card, i) => (
                  <FeatureLine
                    key={card.title}
                    icon={businessIcons[i] ?? "pricing-tier-cards"}
                    title={card.title}
                    body={card.body}
                    i={i}
                    highlightId={highlightId}
                  />
                ))}
              </ul>
              {slide.note ? <p className="footnote">{slide.note}</p> : null}
            </div>
            <div className="illus-split__art">
              <div className="lq-figure lq-figure--live">
                <AutomationGears className="lq-figure__live" />
              </div>
              <p className="lq-hint">Auto spin · hover to turn the gears</p>
            </div>
          </div>
        </div>
      );
    }

    case "audience":
      return (
        <div className="layout layout--audience">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          <div className="share-list">
            {slide.shares?.map((share, i) => (
              <div
                key={share.label}
                className={`share-row forest-card${narrateClass(highlightId, `share-${i}`)}`}
              >
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

    case "advantage": {
      const advantageIcons = [
        "hydroponic-channel",
        "vertical-farm-racks",
        "smart-thermostat-wall",
      ];
      return (
        <div className="layout layout--advantage layout--illustrated">
          <div className="illus-split">
            <div className="illus-split__copy">
              <p className="eyebrow">{slide.eyebrow}</p>
              <h2 className="title">{slide.title}</h2>
              {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
              <ul className="feature-lines">
                {slide.cards?.map((card, i) => (
                  <FeatureLine
                    key={card.title}
                    icon={advantageIcons[i] ?? "hydroponic-channel"}
                    title={card.title}
                    body={card.body}
                    i={i}
                    highlightId={highlightId}
                  />
                ))}
              </ul>
            </div>
            <div className="illus-split__art">
              <div className="lq-figure lq-figure--still-lg">
                <LiniqoStill
                  id="vertical-farm-racks"
                  alt="Vertical farm racks"
                  className="lq-still lq-still--hero"
                />
              </div>
              <div className="lq-figure lq-figure--live">
                <PlantGrowthScroll className="lq-figure__live" />
              </div>
              <p className="lq-hint">Auto growth · hover to scrub the sprout</p>
            </div>
          </div>
        </div>
      );
    }

    case "validation":
      return (
        <div className="layout layout--validation">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          {slide.subtitle ? <p className="lede">{slide.subtitle}</p> : null}
          <div className="crops">
            {slide.crops?.map((crop, i) => (
              <figure
                key={crop.name}
                className={`crop forest-card${narrateClass(highlightId, `crop-${i}`)}`}
              >
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
        <div className="layout layout--team layout--illustrated">
          <p className="eyebrow">{slide.eyebrow}</p>
          <h2 className="title">{slide.title}</h2>
          <div className="team-live">
            <div className="lq-figure lq-figure--live lq-figure--team">
              <TeamAvatars className="lq-figure__live" />
            </div>
            <p className="lq-hint">Auto tour · hover an avatar to lift it</p>
          </div>
          <div className="team-grid">
            {slide.cards?.map((card, i) => (
              <article
                key={card.title}
                className={`team-card${narrateClass(highlightId, `card-${i}`)}`}
              >
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
          <div className="illus-split__art">
            <div className="lq-figure lq-figure--live lq-figure--outline">
              <OfficePlant
                className="lq-figure__live"
                bg="transparent"
                line="#52b788"
                accent="#d4bc7a"
              />
            </div>
            <p className="lq-hint">Auto sway · hover — leaves follow</p>
            {slide.video ? (
              <div className="visual visual--hero visual--contained visual--soft">
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
              </div>
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

  const {
    mode,
    speaking,
    paused,
    supported,
    highlightId,
    setPresenterMode,
    onSlideClick,
  } = usePitchPresenter({
    index,
    goTo,
    isFullscreen,
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
              ? slide.kind === "dua" && !isFullscreen
                ? "Enter full screen to begin the opening"
                : paused
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
            <LiniqoSlideProvider remountKey={`${index}-${animKey}-${slide.kind === "dua" ? (isFullscreen ? "reveal" : "welcome") : "on"}`}>
              <SlideShell slide={slide}>
                <SlideBody
                  slide={slide}
                  revealDua={isFullscreen}
                  highlightId={mode === "auto" ? highlightId : null}
                />
              </SlideShell>
            </LiniqoSlideProvider>
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
