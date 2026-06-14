export const runtime = "edge";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const reviews = await query(
    `SELECT client_name, project_name, quote, photo_url FROM reviews WHERE status = 'published' ORDER BY "order" ASC`
  );

  return NextResponse.json({ reviews });
}
