export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { queryOne, execute } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const about = await queryOne(`SELECT * FROM about LIMIT 1`);
  return NextResponse.json({ about: about || { headline: "", description: "", photo_url: "" } });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { headline, description, photo_url } = await request.json();

  if (user.role === "super_admin") {
    const existing = await queryOne(`SELECT id FROM about LIMIT 1`);
    if (existing) {
      await execute(
        `UPDATE about SET headline=?, description=?, photo_url=?, status='published', updated_by=?, updated_at=datetime('now') WHERE id=1`,
        [headline || "", description || "", photo_url || "", user.email]
      );
    } else {
      await execute(
        `INSERT INTO about (headline, description, photo_url, status, updated_by) VALUES (?, ?, ?, 'published', ?)`,
        [headline || "", description || "", photo_url || "", user.email]
      );
    }
    return NextResponse.json({ success: true, message: "Published!" });
  } else {
    const draftData = JSON.stringify({ headline, description, photo_url });
    await execute(
      `INSERT INTO drafts (type, action, data, submitted_by, status) VALUES ('about', 'edit', ?, ?, 'pending')`,
      [draftData, user.email]
    );
    return NextResponse.json({ success: true, message: "Submitted for approval" });
  }
}
