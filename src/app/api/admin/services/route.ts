export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne, execute } from "@/lib/db";
import { deleteByUrl } from "@/lib/r2";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const services = await query(`SELECT * FROM services ORDER BY id ASC`);
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, image_url } = await request.json();
  if (!slug || !image_url) return NextResponse.json({ error: "Slug and image required" }, { status: 400 });

  // Delete the old cover image from R2 if it's being replaced
  const existing = await queryOne<{ image_url: string }>(`SELECT image_url FROM services WHERE slug=?`, [slug]);
  if (existing?.image_url && existing.image_url !== image_url) {
    await deleteByUrl(existing.image_url);
  }

  await execute(
    `UPDATE services SET image_url=?, updated_by=?, updated_at=datetime('now') WHERE slug=?`,
    [image_url, user.email, slug]
  );

  return NextResponse.json({ success: true, message: "Updated!" });
}
