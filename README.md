# FloraGuard Pitch

Standalone pitch website for **FloraGuard** — a single landing page with an interactive slide deck and a PPT download.

This project is separate from the Indoor Plant product website.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build (static export for Vercel)

```bash
npm run build
```

Output lands in `out/`. Deploy that folder (or connect the repo to Vercel).

## Features

- Header matching the FloraGuard / CIS Tech theme
- Full pitch slider (keyboard, swipe, dots)
- Deep links via `?s=3`
- **Download PPT** button at the bottom
