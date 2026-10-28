import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
/** Bilgi sızdırmayan canlılık ucu. */
export function GET() {
  return NextResponse.json({ ok: true });
}
