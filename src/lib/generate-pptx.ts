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

function isDark(slide: Slide) {
  return slide.kind === "title" || slide.kind === "close";
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
  // Accent bar
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
  opts: { y?: number; h?: number; fontSize?: number } = {},
) {
  slide.addText(text, {
    x: M,
    y: opts.y ?? 0.7,
    w: W - M * 2,
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
) {
  if (!text) return;
  slide.addText(text, {
    x: M,
    y,
    w: W - M * 2,
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
) {
  const gap = 0.18;
  const usable = W - M * 2;
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

function addFlow(pptx: PptxGenJS, slide: PptxGenJS.Slide, items: string[], y: number) {
  const gap = 0.12;
  const usable = W - M * 2;
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

function buildTitleSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, true);
  addEyebrow(s, data.eyebrow, true, 1.4);
  s.addText(data.title, {
    x: M,
    y: 1.85,
    w: 7.5,
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
      w: 7.5,
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
      w: 7.8,
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
      w: 7,
      h: 0.32,
      fontSize: 13,
      fontFace: "Calibri",
      color: C.ivory,
    });
  });
  // Decorative panel
  s.addShape(pptx.ShapeType.rect, {
    x: 9.2,
    y: 0,
    w: 4.133,
    h: H,
    fill: { color: C.forest },
    line: { color: C.forest },
  });
  s.addText("CIS Tech", {
    x: 9.5,
    y: 3.2,
    w: 3.5,
    h: 0.4,
    fontSize: 16,
    fontFace: "Calibri",
    color: C.gold,
    align: "center",
    bold: true,
  });
  s.addText("Indoor Growing", {
    x: 9.5,
    y: 3.6,
    w: 3.5,
    h: 0.35,
    fontSize: 12,
    fontFace: "Calibri",
    color: "B8C9BE",
    align: "center",
  });
}

function buildProblemSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.75, fontSize: 26 });
  addSubtitle(s, data.subtitle, false, 1.45);
  if (data.flow) addFlow(pptx, s, data.flow, 2.15);
  if (data.cards) cardGrid(pptx, s, data.cards, data.flow ? 2.9 : 2.2, 2);
}

function buildSolutionSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, false);
  addEyebrow(s, data.eyebrow, false);
  addTitle(s, data.title, false, { y: 0.65, h: 0.7, fontSize: 24 });
  addSubtitle(s, data.subtitle, false, 1.4);
  if (data.cards) cardGrid(pptx, s, data.cards, 2.1, 3);
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
    s.addText(step.index, {
      x: x + 0.12,
      y: y + 0.2,
      w: cardW - 0.24,
      h: 0.4,
      fontSize: 18,
      fontFace: "Calibri",
      color: C.gold,
      bold: true,
    });
    s.addText(step.title, {
      x: x + 0.12,
      y: y + 0.7,
      w: cardW - 0.24,
      h: 0.7,
      fontSize: 14,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      valign: "top",
    });
    s.addText(step.body, {
      x: x + 0.12,
      y: y + 1.5,
      w: cardW - 0.24,
      h: 2.5,
      fontSize: 12,
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
      y: 2.2,
      w: cw,
      h: 3.5,
      fill: { color: C.cardDark },
      line: { color: C.cardDark },
      rectRadius: 0.1,
    });
    s.addText(crop.name, {
      x: x + 0.2,
      y: 3.5,
      w: cw - 0.4,
      h: 0.6,
      fontSize: 20,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "center",
    });
    s.addText("Pilot crop", {
      x: x + 0.2,
      y: 4.2,
      w: cw - 0.4,
      h: 0.35,
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
  addTitle(s, data.title, false, { y: 0.65, h: 0.55, fontSize: 28 });

  const members = data.cards ?? [];
  const cols = 4;
  const gap = 0.18;
  const usable = W - M * 2;
  const cardW = (usable - gap * (cols - 1)) / cols;
  const cardH = 1.7;
  const startY = 1.5;

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
    s.addText(m.title, {
      x: x + 0.15,
      y: y + 0.4,
      w: cardW - 0.3,
      h: 0.55,
      fontSize: 13,
      fontFace: "Calibri",
      color: C.ivory,
      bold: true,
      align: "center",
      valign: "middle",
    });
    s.addText(m.body, {
      x: x + 0.15,
      y: y + 1.0,
      w: cardW - 0.3,
      h: 0.35,
      fontSize: 11,
      fontFace: "Calibri",
      color: C.gold,
      align: "center",
    });
  });
}

function buildCloseSlide(pptx: PptxGenJS, data: Slide) {
  const s = pptx.addSlide();
  addBackground(pptx, s, true);
  addEyebrow(s, data.eyebrow, true, 1.8);
  s.addText(data.title, {
    x: M,
    y: 2.3,
    w: W - M * 2,
    h: 0.9,
    fontSize: 40,
    fontFace: "Calibri",
    color: C.ivory,
    bold: true,
    align: "center",
  });
  if (data.subtitle) {
    s.addText(data.subtitle, {
      x: M + 1.5,
      y: 3.4,
      w: W - M * 2 - 3,
      h: 0.8,
      fontSize: 15,
      fontFace: "Calibri",
      color: "B8C9BE",
      align: "center",
    });
  }
  data.contacts?.forEach((c, i) => {
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
  });
}

function addSlideByKind(pptx: PptxGenJS, data: Slide) {
  switch (data.kind) {
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
