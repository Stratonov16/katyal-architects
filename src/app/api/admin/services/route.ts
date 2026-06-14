export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, execute } from "@/lib/db";

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

  await execute(
    `UPDATE services SET image_url=?, updated_by=?, updated_at=datetime('now') WHERE slug=?`,
    [image_url, user.email, slug]
  );

  return NextResponse.json({ success: true, message: "Updated!" });
}
