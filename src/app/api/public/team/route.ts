export const runtime = "edge";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const team = await query(
    `SELECT name, role, photo_url FROM team WHERE status = 'published' ORDER BY "order" ASC`
  );

  return NextResponse.json({ team });
}
