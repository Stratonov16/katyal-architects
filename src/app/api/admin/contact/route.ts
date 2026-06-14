export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, queryOne, execute } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contact = await queryOne(`SELECT * FROM contact_info LIMIT 1`);
  const submissions = await query(`SELECT * FROM contact_submissions ORDER BY created_at DESC`);

  return NextResponse.json({
    contact: contact || { email: "", phone: "", address: "", maps_link: "" },
    submissions,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, phone, address, maps_link } = await request.json();

  if (user.role === "super_admin") {
    const existing = await queryOne(`SELECT id FROM contact_info LIMIT 1`);
    if (existing) {
      await execute(
        `UPDATE contact_info SET email=?, phone=?, address=?, maps_link=?, updated_by=?, updated_at=datetime('now') WHERE id=1`,
        [email || "", phone || "", address || "", maps_link || "", user.email]
      );
    } else {
      await execute(
        `INSERT INTO contact_info (email, phone, address, maps_link, updated_by) VALUES (?, ?, ?, ?, ?)`,
        [email || "", phone || "", address || "", maps_link || "", user.email]
      );
    }
    return NextResponse.json({ success: true, message: "Updated!" });
  } else {
    const draftData = JSON.stringify({ email, phone, address, maps_link });
    await execute(
      `INSERT INTO drafts (type, action, data, submitted_by, status) VALUES ('contact', 'edit', ?, ?, 'pending')`,
      [draftData, user.email]
    );
    return NextResponse.json({ success: true, message: "Submitted for approval" });
  }
}

export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const markRead = searchParams.get("markRead");

  if (markRead) {
    await execute(`UPDATE contact_submissions SET is_read=1 WHERE id=?`, [markRead]);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
