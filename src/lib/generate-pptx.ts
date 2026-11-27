import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import PptxGenJS from "pptxgenjs";
import { slides, type Slide } from "@/data/slides";

/** Brand tokens mirrored from globals.css */
const C = {
  forest: "14261C",
  forestDeep: "0B1812",
  forestMid: "2D6A4F",
  sage: "52B788",
  gold: "D4BC7A",
  ivory: "F7F4EE",
  cream: "FFFCF7",
  white: "FFFFFF",
  muted: "5A6B60",
  cardDark: "163226",
} as const;

const W = 13.333;
const H = 7.5;
const M = 0.55;

/** Site video URLs → PowerPoint-safe MP4 + poster under public/assets/videos/for-pptx */
const VIDEO_FOR_PPTX: Record<string, { mp4: string; poster: string }> = {
  "/assets/videos/hero.mp4": {
    mp4: "/assets/videos/for-pptx/hero.mp4",
    poster: "/assets/videos/for-pptx/hero-poster.jpg",
  },
  "/assets/videos/render.webm": {
    mp4: "/assets/videos/for-pptx/render.mp4",
    poster: "/assets/videos/for-pptx/render-poster.jpg",
  },
  "/assets/videos/plant-system.webm": {
    mp4: "/assets/videos/for-pptx/plant-system.mp4",
    poster: "/assets/videos/for-pptx/plant-system-poster.jpg",
  },
};

function publicFile(url?: string | null): string | null {
  if (!url) return null;
  const clean = url.split("?")[0].replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", clean);
  return existsSync(abs) ? abs : null;
}

function addLocalImage(
  slide: PptxGenJS.Slide,
  url: string | undefined,
  opts: PptxGenJS.ImageProps,
): boolean {
  const file = publicFile(url);
  if (!file) return false;
  slide.addImage({ ...opts, path: file });
  return true;
}

function fileAsDataUri(absPath: string): string {
  const ext = path.extname(absPath).toLowerCase().replace(".", "") || "jpeg";
  const mime = ext === "jpg" ? "jpeg" : ext;
  const b64 = readFileSync(absPath).toString("base64");
  return `data:image/${mime};base64,${b64}`;
}

function addLocalVideo(
  slide: PptxGenJS.Slide,
  videoUrl: string | undefined,
  opts: { x: number; y: number; w: number; h: number },
): boolean {
  if (!videoUrl) return false;
  const key = videoUrl.split("?")[0];
  const mapped = VIDEO_FOR_PPTX[key];
  const mp4 = publicFile(mapped?.mp4 ?? (key.endsWith(".mp4") ? key : null));
  const coverPath = publicFile(mapped?.poster);
  if (mp4) {
    slide.addMedia({
      type: "video",
      path: mp4,
      cover: coverPath ? fileAsDataUri(coverPath) : undefined,
      x: opts.x,
      y: opts.y,
      w: opts.w,
      h: opts.h,
    });
    return true;
  }
  // Fallback: poster / product still
  if (
    mapped?.poster &&
    addLocalImage(slide, mapped.poster, {
      ...opts,
      sizing: { type: "cover", w: opts.w, h: opts.h },
    })
  ) {
    return true;
  }
  return addLocalImage(slide, "/assets/product.png", {
    ...opts,
    sizing: { type: "cover", w: opts.w, h: opts.h },
  });
}

function addBackground(pptx: PptxGenJS, slide: PptxGenJS.Slide, dark: boolean) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: dark ? C.forestDeep : C.cream },
    line: { color: dark ? C.forestDeep : C.cream },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.12,
    h: H,
    fill: { color: dark ? C.gold : C.forestMid },
    line: { color: dark ? C.gold : C.forestMid },
  });
}

function addEyebrow(slide: PptxGenJS.Slide, text: string, dark: boolean, y = 0.35) {
  slide.addText(text.toUpperCase(), {
    x: M,
    y,
    w: W - M * 2,
    h: 0.32,
    fontSize: 11,
    fontFace: "Calibri",
    color: dark ? C.gold : C.forestMid,
    bold: true,
    charSpacing: 2,
  });
}

function addTitle(
  slide: PptxGenJS.Slide,
  text: string,
  dark: boolean,
  opts: { y?: number; h?: number; fontSize?: number; w?: number } = {},
) {
  slide.addText(text, {
    x: M,
    y: opts.y ?? 0.7,
    w: opts.w ?? W - M * 2,
    h: opts.h ?? 0.85,
    fontSize: opts.fontSize ?? 32,
    fontFace: "Calibri",
    color: dark ? C.ivory : C.forest,
    bold: true,
    valign: "top",
  });
}

function addSubtitle(
  slide: PptxGenJS.Slide,
  text: string | undefined,
  dark: boolean,
  y: number,
  w = W - M * 2,
) {
  if (!text) return;
  slide.addText(text, {
    x: M,
    y,
    w,
    h: 0.55,
    fontSize: 14,
    fontFace: "Calibri",
    color: dark ? "B8C9BE" : C.muted,
    valign: "top",
  });
}

function addNote(slide: PptxGenJS.Slide, text: string | undefined, dark: boolean) {
  if (!text) return;
  slide.addText(text, {
    x: M,
    y: H - 0.55,
    w: W - M * 2,
    h: 0.35,
    fontSize: 10,
    fontFace: "Calibri",
    color: dark ? "8FA396" : C.muted,
    italic: true,
  });
}

function cardGrid(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  cards: { title: string; body: string }[],
  startY: number,
  cols: number,
  darkCards = true,
  opts: { maxW?: number } = {},
) {
  const gap = 0.18;
  const usable = (opts.maxW ?? W - M * 2);
  const cardW = (usable - gap * (cols - 1)) / cols;
  const rows = Math.ceil(cards.length / cols);
  const availableH = H - startY - 0.7;
  const cardH = Math.min(1.55, (availableH - gap * (rows - 1)) / rows);

  cards.forEach((card, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = M + col * (cardW + gap);
    const y = startY + row * (cardH + gap);

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      fill: { color: darkCards ? C.cardDark : C.ivory },
      line: { color: darkCards ? C.cardDark : "E8E2D6" },
      rectRadius: 0.08,
    });
    slide.addText(card.title, {
      x: x + 0.16,
      y: y + 0.14,
      w: cardW - 0.32,
      h: 0.35,
      fontSize: 13,
      fontFace: "Calibri",
      color: darkCards ? C.gold : C.forest,
      bold: true,
      valign: "top",
    });
    slide.addText(card.body, {
      x: x + 0.16,
      y: y + 0.48,
      w: cardW - 0.32,
      h: cardH - 0.6,
      fontSize: 11,
      fontFace: "Calibri",
      color: darkCards ? "D5DED8" : C.muted,
      valign: "top",
    });
  });
}

function addFlow(pptx: PptxGenJS, slide: PptxGenJS.Slide, items: string[], y: number, maxW?: number) {
  const gap = 0.12;
  const usable = maxW ?? W - M * 2;
  const n = items.length;
  const arrowW = 0.22;
  const boxW = (usable - arrowW * (n - 1) - gap * (n - 1) * 2) / n;
  const boxH = 0.48;

  items.forEach((item, i) => {
    const x = M + i * (boxW + arrowW + gap * 2);
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: boxW,
      h: boxH,
      fill: { color: C.forest },
      line: { color: C.forest },
      rectRadius: 0.06,
    });
    slide.addText(item, {
      x,
      y,
      w: boxW,
      h: boxH,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.ivory,
      align: "center",
      valign: "middle",
      bold: true,
    });
    if (i < n - 1) {
      slide.addText("→", {
        x: x + boxW + gap * 0.3,
        y,
        w: arrowW + gap,
        h: boxH,
        fontSize: 16,
        fontFace: "Calibri",
        color: C.forestMid,
        align: "center",
        valign: "middle",
      });
    }
  });
}

function buildDuaSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, true);
  addEyebrow(s, data.eyebrow || "00 · Opening", true, 0.55);

  const arabic = (data.arabicLines ?? []).join("\n");
  if (arabic) {
    s.addText(arabic, {
      x: M,
      y: 0.95,
      w: W - M * 2,
      h: 3.35,
      fontSize: 20,
      fontFace: "Arial",
      color: C.ivory,
      align: "center",
      valign: "middle",
    });
  }

  if (data.translation) {
    s.addText(`"${data.translation}"`, {
      x: M + 0.8,
      y: 4.4,
      w: W - M * 2 - 1.6,
      h: 1.55,
      fontSize: 12,
      fontFace: "Calibri",
      color: "A8B5AD",
      align: "center",
      valign: "top",
    });
  }

  if (data.citation) {
    s.addText(data.citation, {
      x: M,
      y: 6.05,
      w: W - M * 2,
      h: 0.3,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.gold,
      align: "center",
    });
  }

  s.addText("The Holy Qur’an", {
    x: M,
    y: 6.45,
    w: W - M * 2,
    h: 0.28,
    fontSize: 10,
    fontFace: "Calibri",
    color: "7A8A82",
    align: "center",
  });
}

function buildTitleSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, true);
  const copyW = 7.2;
  addEyebrow(s, data.eyebrow, true, 1.4);
  s.addText(data.title, {
    x: M,
    y: 1.85,
    w: copyW,
    h: 1.1,
    fontSize: 54,
    fontFace: "Calibri",
    color: C.ivory,
    bold: true,
  });
  if (data.subtitle) {
    s.addText(data.subtitle, {
      x: M,
      y: 3.05,
      w: copyW,
      h: 0.45,
      fontSize: 20,
      fontFace: "Calibri",
      color: C.gold,
    });
  }
  if (data.note) {
    s.addText(data.note, {
      x: M,
      y: 3.65,
      w: copyW,
      h: 0.9,
      fontSize: 14,
      fontFace: "Calibri",
      color: "B8C9BE",
    });
  }
  data.contacts?.forEach((c, i) => {
    s.addText(`${c.label}:  ${c.value}`, {
      x: M,
      y: 5.5 + i * 0.35,
      w: copyW,
      h: 0.32,
      fontSize: 13,
      fontFace: "Calibri",
      color: C.ivory,
    });
  });

  const media = { x: 8.35, y: 0.55, w: 4.5, h: 6.4 };
  s.addShape(pptx.ShapeType.roundRect, {
    x: media.x - 0.08,
    y: media.y - 0.08,
    w: media.w + 0.16,
    h: media.h + 0.16,
    fill: { color: C.forest },
    line: { color: C.forest },
    rectRadius: 0.1,
  });
  if (!addLocalVideo(s, data.video, media)) {
    addLocalImage(s, data.image ?? "/assets/product.png", {
      ...media,
      sizing: { type: "cover", w: media.w, h: media.h },
    });
  }
}

function buildProblemSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  const hasMedia = Boolean(data.video || data.image);
  const copyW = hasMedia ? 7.6 : W - M * 2;

  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.75, fontSize: 24, w: copyW });
  addSubtitle(s, data.subtitle, false, 1.45, copyW);

  if (hasMedia) {
    const media = { x: 8.55, y: 0.45, w: 4.3, h: 2.55 };
    if (!addLocalVideo(s, data.video, media)) {
      addLocalImage(s, data.image, {
        ...media,
        sizing: { type: "cover", w: media.w, h: media.h },
      });
    }
  }

  if (data.flow) addFlow(pptx, s, data.flow, 2.15);
  if (data.cards) cardGrid(pptx, s, data.cards, data.flow ? 2.9 : 2.2, 2);
}

function buildSolutionSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  const hasMedia = Boolean(data.video || data.image);
  const copyW = hasMedia ? 7.4 : W - M * 2;

  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.7, fontSize: 22, w: copyW });
  addSubtitle(s, data.subtitle, false, 1.4, copyW);

  if (data.cards) {
    cardGrid(pptx, s, data.cards.slice(0, 6), 2.1, hasMedia ? 2 : 3, true, {
      maxW: copyW,
    });
  }

  if (hasMedia) {
    const media = { x: 8.45, y: 1.5, w: 4.4, h: 5.2 };
    if (!addLocalVideo(s, data.video, media)) {
      addLocalImage(s, data.image, {
        ...media,
        sizing: { type: "cover", w: media.w, h: media.h },
      });
    }
  }
}

function buildStepsSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.55, fontSize: 28 });
  const steps = data.steps ?? [];
  const n = steps.length;
  const gap = 0.16;
  const usable = W - M * 2;
  const cardW = (usable - gap * (n - 1)) / n;
  const cardH = 4.6;
  const y = 1.5;
  const imgH = 1.55;

  steps.forEach((step, i) => {
    const x = M + i * (cardW + gap);
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      fill: { color: C.cardDark },
      line: { color: C.cardDark },
      rectRadius: 0.08,
    });

    let textTop = y + 0.2;
    if (step.image) {
      addLocalImage(s, step.image, {
        x: x + 0.12,
        y: y + 0.14,
        w: cardW - 0.24,
        h: imgH,
        sizing: { type: "cover", w: cardW - 0.24, h: imgH },
      });
      textTop = y + 0.14 + imgH + 0.12;
    }

    s.addText(step.index, {
      x: x + 0.12,
      y: textTop,
      w: cardW - 0.24,
      h: 0.32,
      fontSize: 14,
      fontFace: "Calibri",
      color: C.gold,
      bold: true,
    });
    s.addText(step.title, {
      x: x + 0.12,
      y: textTop + 0.32,
      w: cardW - 0.24,
      h: 0.55,
      fontSize: 13,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      valign: "top",
    });
    s.addText(step.body, {
      x: x + 0.12,
      y: textTop + 0.9,
      w: cardW - 0.24,
      h: y + cardH - (textTop + 0.9) - 0.15,
      fontSize: 11,
      fontFace: "Calibri",
      color: "D5DED8",
      valign: "top",
    });
  });
  addNote(s, data.note, false);
}

function buildRoadmapSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.55, fontSize: 28 });
  const steps = data.steps ?? [];
  const n = steps.length;
  const gap = 0.2;
  const usable = W - M * 2;
  const cardW = (usable - gap * (n - 1)) / n;
  const y = 1.6;

  steps.forEach((step, i) => {
    const x = M + i * (cardW + gap);
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: 4.2,
      fill: { color: C.cardDark },
      line: { color: C.cardDark },
      rectRadius: 0.08,
    });
    s.addText(step.index, {
      x: x + 0.18,
      y: y + 0.3,
      w: cardW - 0.36,
      h: 0.4,
      fontSize: 14,
      fontFace: "Calibri",
      color: C.gold,
      bold: true,
    });
    s.addText(step.title, {
      x: x + 0.18,
      y: y + 0.9,
      w: cardW - 0.36,
      h: 0.8,
      fontSize: 16,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      valign: "top",
    });
    s.addText(step.body, {
      x: x + 0.18,
      y: y + 1.9,
      w: cardW - 0.36,
      h: 1.8,
      fontSize: 13,
      fontFace: "Calibri",
      color: "D5DED8",
      valign: "top",
    });
  });
}

function buildMarketSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.55, fontSize: 28 });
  addSubtitle(s, data.subtitle, false, 1.25);

  const stats = data.stats ?? [];
  const gap = 0.2;
  const usable = W - M * 2;
  const sw = (usable - gap * (stats.length - 1)) / Math.max(stats.length, 1);
  stats.forEach((stat, i) => {
    const x = M + i * (sw + gap);
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.0,
      w: sw,
      h: 1.7,
      fill: { color: C.cardDark },
      line: { color: C.cardDark },
      rectRadius: 0.08,
    });
    s.addText(stat.value, {
      x: x + 0.15,
      y: 2.15,
      w: sw - 0.3,
      h: 0.6,
      fontSize: 28,
      fontFace: "Calibri",
      color: C.gold,
      bold: true,
      align: "center",
    });
    s.addText(stat.label, {
      x: x + 0.15,
      y: 2.8,
      w: sw - 0.3,
      h: 0.7,
      fontSize: 11,
      fontFace: "Calibri",
      color: "D5DED8",
      align: "center",
      valign: "top",
    });
  });

  if (data.cards) cardGrid(pptx, s, data.cards, 4.0, 4, true);
  addNote(s, data.note, false);
}

function buildPricingSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.55, fontSize: 28 });

  const tiers = data.tiers ?? [];
  const gap = 0.28;
  const usable = W - M * 2;
  const tw = (usable - gap * (tiers.length - 1)) / Math.max(tiers.length, 1);
  const y = 1.55;

  tiers.forEach((tier, i) => {
    const x = M + i * (tw + gap);
    const featured = Boolean(tier.featured);
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: tw,
      h: 4.8,
      fill: { color: featured ? C.forest : C.cardDark },
      line: { color: featured ? C.gold : C.cardDark, width: featured ? 1.5 : 0 },
      rectRadius: 0.1,
    });
    s.addText(tier.name, {
      x: x + 0.25,
      y: y + 0.35,
      w: tw - 0.5,
      h: 0.4,
      fontSize: 16,
      fontFace: "Calibri",
      color: C.gold,
      bold: true,
      align: "center",
    });
    s.addText(tier.price, {
      x: x + 0.25,
      y: y + 0.9,
      w: tw - 0.5,
      h: 0.7,
      fontSize: 36,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "center",
    });
    tier.items.forEach((item, j) => {
      s.addText(`•  ${item}`, {
        x: x + 0.35,
        y: y + 2.0 + j * 0.45,
        w: tw - 0.7,
        h: 0.4,
        fontSize: 13,
        fontFace: "Calibri",
        color: "D5DED8",
      });
    });
  });
}

function buildBusinessSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.55, fontSize: 28 });
  addSubtitle(s, data.subtitle, false, 1.25);
  if (data.flow) addFlow(pptx, s, data.flow, 1.9);
  if (data.cards) cardGrid(pptx, s, data.cards, data.flow ? 2.65 : 2.0, 3);
  addNote(s, data.note, false);
}

function buildAudienceSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.55, fontSize: 28 });

  const shares = data.shares ?? [];
  shares.forEach((share, i) => {
    const y = 1.5 + i * 1.15;
    s.addShape(pptx.ShapeType.roundRect, {
      x: M,
      y,
      w: W - M * 2,
      h: 1.0,
      fill: { color: C.cardDark },
      line: { color: C.cardDark },
      rectRadius: 0.08,
    });
    s.addText(`${share.pct}%`, {
      x: M + 0.25,
      y: y + 0.22,
      w: 1.2,
      h: 0.55,
      fontSize: 24,
      fontFace: "Calibri",
      color: C.gold,
      bold: true,
      valign: "middle",
    });
    s.addText(share.label, {
      x: M + 1.6,
      y: y + 0.12,
      w: 10,
      h: 0.35,
      fontSize: 15,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
    });
    s.addText(share.body, {
      x: M + 1.6,
      y: y + 0.5,
      w: 10,
      h: 0.35,
      fontSize: 12,
      fontFace: "Calibri",
      color: "D5DED8",
    });
  });
  addNote(s, data.note, false);
}

function buildAdvantageSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.55, fontSize: 26 });
  addSubtitle(s, data.subtitle, false, 1.3);
  if (data.cards) cardGrid(pptx, s, data.cards, 2.0, 3);
}

function buildValidationSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.55, fontSize: 28 });
  addSubtitle(s, data.subtitle, false, 1.3);

  const crops = data.crops ?? [];
  const gap = 0.3;
  const usable = W - M * 2;
  const cw = (usable - gap * (crops.length - 1)) / Math.max(crops.length, 1);
  crops.forEach((crop, i) => {
    const x = M + i * (cw + gap);
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.0,
      w: cw,
      h: 3.9,
      fill: { color: C.cardDark },
      line: { color: C.cardDark },
      rectRadius: 0.1,
    });
    const imgSize = Math.min(cw - 0.5, 2.2);
    const imgX = x + (cw - imgSize) / 2;
    addLocalImage(s, crop.image, {
      x: imgX,
      y: 2.25,
      w: imgSize,
      h: imgSize,
      sizing: { type: "contain", w: imgSize, h: imgSize },
    });
    s.addText(crop.name, {
      x: x + 0.2,
      y: 2.25 + imgSize + 0.2,
      w: cw - 0.4,
      h: 0.45,
      fontSize: 18,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "center",
    });
    s.addText("Pilot crop", {
      x: x + 0.2,
      y: 2.25 + imgSize + 0.65,
      w: cw - 0.4,
      h: 0.3,
      fontSize: 12,
      fontFace: "Calibri",
      color: C.gold,
      align: "center",
    });
  });
  addNote(s, data.note, false);
}

function buildTeamSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.55, h: 0.45, fontSize: 26 });

  const members = data.cards ?? [];
  const cols = 4;
  const gap = 0.16;
  const usable = W - M * 2;
  const cardW = (usable - gap * (cols - 1)) / cols;
  const cardH = 2.55;
  const startY = 1.2;
  const photo = 1.15;

  members.forEach((m, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = M + col * (cardW + gap);
    const y = startY + row * (cardH + gap);
    s.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: cardW,
      h: cardH,
      fill: { color: C.cardDark },
      line: { color: C.cardDark },
      rectRadius: 0.08,
    });

    const photoX = x + (cardW - photo) / 2;
    if (m.image) {
      addLocalImage(s, m.image, {
        x: photoX,
        y: y + 0.18,
        w: photo,
        h: photo,
        rounding: true,
        sizing: { type: "cover", w: photo, h: photo },
      });
    } else {
      s.addShape(pptx.ShapeType.ellipse, {
        x: photoX,
        y: y + 0.18,
        w: photo,
        h: photo,
        fill: { color: C.forestMid },
        line: { color: C.forestMid },
      });
    }

    s.addText(m.title, {
      x: x + 0.1,
      y: y + 1.45,
      w: cardW - 0.2,
      h: 0.55,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "center",
      valign: "top",
    });
    s.addText(m.body, {
      x: x + 0.1,
      y: y + 2.05,
      w: cardW - 0.2,
      h: 0.35,
      fontSize: 10,
      fontFace: "Calibri",
      color: C.gold,
      align: "center",
    });
  });
}

function buildCloseSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, true);

  const hasMedia = Boolean(data.video || data.image);
  const copyW = hasMedia ? 7.2 : W - M * 2;

  addEyebrow(s, data.eyebrow, true, hasMedia ? 1.5 : 1.8);
  s.addText(data.title, {
    x: M,
    y: hasMedia ? 2.1 : 2.3,
    w: copyW,
    h: 0.9,
    fontSize: hasMedia ? 34 : 40,
    fontFace: "Calibri",
    color: C.ivory,
    bold: true,
    align: hasMedia ? "left" : "center",
  });
  if (data.subtitle) {
    s.addText(data.subtitle, {
      x: M,
      y: hasMedia ? 3.15 : 3.4,
      w: copyW,
      h: 0.8,
      fontSize: 15,
      fontFace: "Calibri",
      color: "B8C9BE",
      align: hasMedia ? "left" : "center",
    });
  }
  data.contacts?.forEach((c, i) => {
    if (hasMedia) {
      s.addText(`${c.label}:  ${c.value}`, {
        x: M,
        y: 4.4 + i * 0.4,
        w: copyW,
        h: 0.35,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.ivory,
      });
    } else {
      const total = data.contacts!.length;
      const blockW = 3.5;
      const totalW = total * blockW;
      const startX = (W - totalW) / 2;
      s.addText(c.label, {
        x: startX + i * blockW,
        y: 4.8,
        w: blockW,
        h: 0.3,
        fontSize: 11,
        fontFace: "Calibri",
        color: C.gold,
        align: "center",
        bold: true,
      });
      s.addText(c.value, {
        x: startX + i * blockW,
        y: 5.15,
        w: blockW,
        h: 0.35,
        fontSize: 13,
        fontFace: "Calibri",
        color: C.ivory,
        align: "center",
      });
    }
  });

  if (hasMedia) {
    const media = { x: 8.35, y: 0.55, w: 4.5, h: 6.4 };
    if (!addLocalVideo(s, data.video, media)) {
      addLocalImage(s, data.image ?? "/assets/product.png", {
        ...media,
        sizing: { type: "cover", w: media.w, h: media.h },
      });
    }
  }
}

function addSlideByKind(pptx: PptxGenJS, data: Slide) {
  switch (data.kind) {
    case "dua":
      buildDuaSlide(pptx, data);
      break;
    case "title":
      buildTitleSlide(pptx, data);
      break;
    case "problem":
      buildProblemSlide(pptx, data);
      break;
    case "solution":
      buildSolutionSlide(pptx, data);
      break;
    case "steps":
      buildStepsSlide(pptx, data);
      break;
    case "market":
      buildMarketSlide(pptx, data);
      break;
    case "pricing":
      buildPricingSlide(pptx, data);
      break;
    case "business":
      buildBusinessSlide(pptx, data);
      break;
    case "audience":
      buildAudienceSlide(pptx, data);
      break;
    case "advantage":
      buildAdvantageSlide(pptx, data);
      break;
    case "validation":
      buildValidationSlide(pptx, data);
      break;
    case "roadmap":
      buildRoadmapSlide(pptx, data);
      break;
    case "team":
      buildTeamSlide(pptx, data);
      break;
    case "close":
      buildCloseSlide(pptx, data);
      break;
    default: {
      const s = pptx.addSlide();
      addBackground(pptx, s, false);
      addEyebrow(s, data.eyebrow, false);
      addTitle(s, data.title, false);
      addSubtitle(s, data.subtitle, false, 1.6);
    }
  }
}

/** Build a FlorIQ pitch PPTX from the same `slides` source the website uses. */
export async function generateFlorIqPptx(): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "WIDE_16x9", width: W, height: H });
  pptx.layout = "WIDE_16x9";
  pptx.author = "CIS Tech";
  pptx.company = "CIS Tech";
  pptx.title = "FlorIQ Pitch Deck";
  pptx.subject = "FlorIQ — Grow Calm. Grow Green. Indoors.";

  for (const slide of slides) {
    addSlideByKind(pptx, slide);
  }

  const output = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(output as ArrayBuffer);
}
