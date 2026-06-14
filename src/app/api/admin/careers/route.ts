export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await query(`SELECT * FROM careers ORDER BY created_at DESC`);
  const applications = await query(`SELECT * FROM job_applications ORDER BY created_at DESC`);
  return NextResponse.json({ jobs, applications });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, department, location, type, description, requirements } = await request.json();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const status = user.role === "super_admin" ? "published" : "draft";

  await execute(
    `INSERT INTO careers (title, department, location, type, description, requirements, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, department || "", location || "", type || "Full-time", description || "", requirements || "", status, user.email]
  );

  return NextResponse.json({ success: true, message: status === "published" ? "Published!" : "Submitted for approval" });
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, department, location, type, description, requirements } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const status = user.role === "super_admin" ? "published" : "draft";

  await execute(
    `UPDATE careers SET title=?, department=?, location=?, type=?, description=?, requirements=?, status=? WHERE id=?`,
    [title, department || "", location || "", type || "Full-time", description || "", requirements || "", status, id]
  );

  return NextResponse.json({ success: true, message: "Updated!" });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  if (user.role === "super_admin") {
    await execute(`DELETE FROM careers WHERE id=?`, [id]);
    return NextResponse.json({ success: true, message: "Deleted" });
  } else {
    await execute(
      `INSERT INTO drafts (type, action, reference_id, submitted_by, status) VALUES ('career', 'delete', ?, ?, 'pending')`,
      [id, user.email]
    );
    return NextResponse.json({ success: true, message: "Delete submitted for approval" });
  }
}
