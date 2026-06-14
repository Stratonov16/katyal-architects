import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, execute } from "@/lib/db";

export const runtime = "edge";

// GET — fetch all hero slides
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slides = await query(
    `SELECT * FROM hero_slides WHERE status = 'published' ORDER BY "order" ASC`
  );

  return NextResponse.json({ slides });
}

// POST — save hero slides (super admin publishes, client admin drafts)
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slides } = await request.json();

  if (user.role === "super_admin") {
    // Delete existing and insert new
    await execute(`DELETE FROM hero_slides`);

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      await execute(
        `INSERT INTO hero_slides (image_url, project_title, project_link, "order", status, created_by) VALUES (?, ?, ?, ?, 'published', ?)`,
        [slide.imageUrl, slide.projectTitle, slide.projectLink, i, user.email]
      );
    }

    return NextResponse.json({ success: true, message: "Published" });
  } else {
    // Client admin — save as draft
    await execute(
      `INSERT INTO drafts (type, action, data, submitted_by, status) VALUES ('hero', 'edit', ?, ?, 'pending')`,
      [JSON.stringify(slides), user.email]
    );

    return NextResponse.json({ success: true, message: "Saved as draft for approval" });
  }
}
