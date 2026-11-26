import { PPT_FILENAME } from "@/data/slides";
import { generateFlorIqPptx } from "@/lib/generate-pptx";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Generates a FlorIQ pitch PPTX from the same `slides` data the website renders.
 * Prefer this over the stale Canva export in /public.
 */
export async function GET() {
  try {
    const buffer = await generateFlorIqPptx();
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${PPT_FILENAME}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/pptx]", err);
    return NextResponse.json(
      { error: "Failed to generate pitch deck PPTX" },
      { status: 500 },
    );
  }
}
