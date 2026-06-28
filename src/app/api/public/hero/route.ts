export const runtime = "edge";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  // Join hero slides with projects to get location (matched by slug in the project_link)
  const slides = await query(
    `SELECT
       h.image_url,
       h.project_title,
       h.project_link,
       h.duration,
       (SELECT p.location FROM projects p WHERE h.project_link LIKE '%/' || p.slug) as location
     FROM hero_slides h
     WHERE h.status = 'published'
     ORDER BY h."order" ASC`
  );

  return NextResponse.json({ slides });
}
