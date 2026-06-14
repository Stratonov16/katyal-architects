export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, execute } from "@/lib/db";

// GET — list all team members
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const members = await query(
    `SELECT * FROM team ORDER BY "order" ASC`
  );

  return NextResponse.json({ members });
}

// POST — add team member
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, role, photo_url } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  if (user.role === "super_admin") {
    const existing = await query(`SELECT id FROM team`);
    await execute(
      `INSERT INTO team (name, role, photo_url, "order", status, created_by) VALUES (?, ?, ?, ?, 'published', ?)`,
      [name, role || "", photo_url || "", existing.length, user.email]
    );
    return NextResponse.json({ success: true, message: "Published!" });
  } else {
    const draftData = JSON.stringify({ name, role, photo_url });
    await execute(
      `INSERT INTO drafts (type, action, data, submitted_by, status) VALUES ('team', 'create', ?, ?, 'pending')`,
      [draftData, user.email]
    );
    return NextResponse.json({ success: true, message: "Submitted for approval" });
  }
}

// PUT — update team member
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name, role, photo_url } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  if (user.role === "super_admin") {
    await execute(
      `UPDATE team SET name=?, role=?, photo_url=? WHERE id=?`,
      [name, role || "", photo_url || "", id]
    );
    return NextResponse.json({ success: true, message: "Updated!" });
  } else {
    const draftData = JSON.stringify({ id, name, role, photo_url });
    await execute(
      `INSERT INTO drafts (type, action, reference_id, data, submitted_by, status) VALUES ('team', 'edit', ?, ?, ?, 'pending')`,
      [id, draftData, user.email]
    );
    return NextResponse.json({ success: true, message: "Edit submitted for approval" });
  }
}

// DELETE — delete team member
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  if (user.role === "super_admin") {
    await execute(`DELETE FROM team WHERE id=?`, [id]);
    return NextResponse.json({ success: true, message: "Deleted" });
  } else {
    await execute(
      `INSERT INTO drafts (type, action, reference_id, submitted_by, status) VALUES ('team', 'delete', ?, ?, 'pending')`,
      [id, user.email]
    );
    return NextResponse.json({ success: true, message: "Delete submitted for approval" });
  }
}
