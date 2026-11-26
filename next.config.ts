import type { NextConfig } from "next";

/**
 * Static `out/` export is opt-in via ENABLE_STATIC_EXPORT=1.
 * Default (and `next dev`) omit export so `/api/tts` can run Edge neural TTS.
 */
const enableStaticExport = process.env.ENABLE_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(enableStaticExport ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["msedge-tts", "pptxgenjs"],
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
