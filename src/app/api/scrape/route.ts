import { NextRequest, NextResponse } from "next/server";
import { extractSite } from "@/lib/extract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing ?url" }, { status: 400 });
  try {
    const data = await extractSite(url);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Scrape failed" }, { status: 500 });
  }
}
