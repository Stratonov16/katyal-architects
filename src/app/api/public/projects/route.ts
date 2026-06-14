import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  let projects;
  if (category) {
    projects = await query(
      `SELECT p.*,
        (SELECT image_url FROM project_images WHERE project_id = p.id AND is_featured = 1 LIMIT 1) as featured_image
      FROM projects p
      WHERE p.category = ? AND p.status = 'published'
      ORDER BY p.created_at DESC`,
      [category]
    );
  } else {
    projects = await query(
      `SELECT p.*,
        (SELECT image_url FROM project_images WHERE project_id = p.id AND is_featured = 1 LIMIT 1) as featured_image
      FROM projects p
      WHERE p.status = 'published'
      ORDER BY p.created_at DESC`
    );
  }

  return NextResponse.json({ projects });
}
