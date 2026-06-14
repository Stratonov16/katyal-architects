export const runtime = "edge";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";


export async function GET() {
  const slides = await query(
    `SELECT image_url, project_title, project_link FROM hero_slides WHERE status = 'published' ORDER BY "order" ASC`
  );

  return NextResponse.json({ slides });
}
