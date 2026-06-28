export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne, execute } from "@/lib/db";
import { deleteByUrl } from "@/lib/r2";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await query(`SELECT * FROM reviews ORDER BY "order" ASC`);
  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { client_name, project_name, quote, photo_url } = await request.json();
  if (!client_name || !quote) return NextResponse.json({ error: "Name and quote required" }, { status: 400 });

  if (user.role === "super_admin") {
    const existing = await query(`SELECT id FROM reviews`);
    await execute(
      `INSERT INTO reviews (client_name, project_name, quote, photo_url, "order", status, created_by) VALUES (?, ?, ?, ?, ?, 'published', ?)`,
      [client_name, project_name || "", quote, photo_url || "", existing.length, user.email]
    );
    return NextResponse.json({ success: true, message: "Published!" });
  } else {
    const draftData = JSON.stringify({ client_name, project_name, quote, photo_url });
    await execute(
      `INSERT INTO drafts (type, action, data, submitted_by, status) VALUES ('review', 'create', ?, ?, 'pending')`,
      [draftData, user.email]
    );
    return NextResponse.json({ success: true, message: "Submitted for approval" });
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, client_name, project_name, quote, photo_url } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  if (user.role === "super_admin") {
    await execute(
      `UPDATE reviews SET client_name=?, project_name=?, quote=?, photo_url=? WHERE id=?`,
      [client_name, project_name || "", quote, photo_url || "", id]
    );
    return NextResponse.json({ success: true, message: "Updated!" });
  } else {
    const draftData = JSON.stringify({ id, client_name, project_name, quote, photo_url });
    await execute(
      `INSERT INTO drafts (type, action, reference_id, data, submitted_by, status) VALUES ('review', 'edit', ?, ?, ?, 'pending')`,
      [id, draftData, user.email]
    );
    return NextResponse.json({ success: true, message: "Edit submitted for approval" });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  if (user.role === "super_admin") {
    const review = await queryOne<{ photo_url: string }>(`SELECT photo_url FROM reviews WHERE id=?`, [id]);
    if (review?.photo_url) await deleteByUrl(review.photo_url);
    await execute(`DELETE FROM reviews WHERE id=?`, [id]);
    return NextResponse.json({ success: true, message: "Deleted" });
  } else {
    await execute(
      `INSERT INTO drafts (type, action, reference_id, submitted_by, status) VALUES ('review', 'delete', ?, ?, 'pending')`,
      [id, user.email]
    );
    return NextResponse.json({ success: true, message: "Delete submitted for approval" });
  }
}
