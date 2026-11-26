# FlorIQ Pitch

Standalone pitch website for **FlorIQ** — a single landing page with an interactive slide deck, Auto/Manual AI voice presenting, and a PPT download.

This project is separate from the Indoor Plant product website.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI Voice

Auto · AI Voice uses **Microsoft Edge neural TTS** (`en-US-JennyNeural`) via `/api/tts` — upbeat, clear female presenter quality with **no API key and no paid plan**. Manual mode stays silent. Click the slide to pause/resume; Sparkle BGM plays under the VO when the theme file is present.

If the server TTS route fails (or you use pure static export without a proxy), the deck falls back to browser `speechSynthesis`.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `TTS_VOICE` | server | Edge voice short name (default `en-US-JennyNeural`) |
| `NEXT_PUBLIC_TTS_PROXY_URL` | client | Optional external proxy for static hosts |

### How to test

1. `npm run dev`
2. Open the pitch and click **Auto · AI Voice**
3. Confirm spoken VO + auto-advance; click the slide to pause/resume; switch to **Manual** for silence

## Build

Default build keeps API routes (Node / Vercel serverless — needed for `/api/tts`):

```bash
npm run build
npm start
```

Pure static `out/` export (stashes `/api` for the build; use `NEXT_PUBLIC_TTS_PROXY_URL` or browser fallback for VO):

```bash
npm run build:static
```

## Features

- Header matching the FlorIQ / CIS Tech theme
- Full pitch slider (keyboard, swipe, dots)
- Auto AI voice (Edge Jenny by default, speechSynthesis fallback) / Manual presenter mode
- Deep links via `?s=3`
- **Download PPT** button — generates a PPTX from the same `src/data/slides.ts` content as the live slider (`/api/pptx`; static builds use a refreshed `public/` file)
