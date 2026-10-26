import { NextRequest, NextResponse } from "next/server";
import { findLeads } from "@/lib/overpass";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city")?.trim();
  const state = req.nextUrl.searchParams.get("state")?.trim();
  if (!city || !state) return NextResponse.json({ error: "Need ?city and ?state" }, { status: 400 });
  try {
    const { leads, area } = await findLeads(city, state);
    return NextResponse.json({ area, count: leads.length, leads });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lead search failed" }, { status: 500 });
  }
}
