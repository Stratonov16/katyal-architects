export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query, execute } from "@/lib/db";

// GET — list all projects OR get images for a specific project
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const wantImages = searchParams.get("images");

  if (id && wantImages) {
    const images = await query(
      `SELECT id, image_url, is_featured, "order" FROM project_images WHERE project_id = ? ORDER BY "order" ASC`,
      [id]
    );
    return NextResponse.json({ images });
  }

  const projects = await query(
    `SELECT * FROM projects ORDER BY created_at DESC`
  );

  return NextResponse.json({ projects });
}

// POST — create new project
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, slug, category, location, year, description, video_url, newImages, featuredUrl } = await request.json();

  if (!title || !category) {
    return NextResponse.json({ error: "Title and category required" }, { status: 400 });
  }

  if (user.role === "super_admin") {
    await execute(
      `INSERT INTO projects (title, slug, category, description, location, year, video_url, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?)`,
      [title, slug, category, description || "", location || "", year || 2026, video_url || "", user.email]
    );

    const project = await query<{ id: number }>(
      `SELECT id FROM projects WHERE slug = ? ORDER BY created_at DESC LIMIT 1`,
      [slug]
    );

    if (project.length > 0 && newImages && newImages.length > 0) {
      const projectId = project[0].id;
      for (let i = 0; i < newImages.length; i++) {
        const isFeatured = newImages[i] === featuredUrl ? 1 : 0;
        await execute(
          `INSERT INTO project_images (project_id, image_url, is_featured, "order") VALUES (?, ?, ?, ?)`,
          [projectId, newImages[i], isFeatured, i]
        );
      }
    }

    return NextResponse.json({ success: true, message: "Published!" });
  } else {
    // Client admin — save to drafts for approval
    const draftData = JSON.stringify({ title, slug, category, location, year, description, video_url, images: newImages, featuredUrl });
    await execute(
      `INSERT INTO drafts (type, action, data, submitted_by, status) VALUES ('project', 'create', ?, ?, 'pending')`,
      [draftData, user.email]
    );
    return NextResponse.json({ success: true, message: "Submitted for approval" });
  }
}

// PUT — update project
export async function PUT(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, slug, category, location, year, description, video_url, newImages, deletedImageIds, featuredUrl } = await request.json();

  if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

  if (user.role === "super_admin") {
    await execute(
      `UPDATE projects SET title=?, slug=?, category=?, description=?, location=?, year=?, video_url=?, status='published', updated_at=datetime('now') WHERE id=?`,
      [title, slug, category, description || "", location || "", year || 2026, video_url || "", id]
    );

    // Delete removed images
    if (deletedImageIds && deletedImageIds.length > 0) {
      for (const imgId of deletedImageIds) {
        await execute(`DELETE FROM project_images WHERE id=? AND project_id=?`, [imgId, id]);
      }
    }

    // Add new images
    if (newImages && newImages.length > 0) {
      const existing = await query<{ id: number }>(`SELECT id FROM project_images WHERE project_id=?`, [id]);
      const startOrder = existing.length;
      for (let i = 0; i < newImages.length; i++) {
        const isFeatured = newImages[i] === featuredUrl ? 1 : 0;
        await execute(
          `INSERT INTO project_images (project_id, image_url, is_featured, "order") VALUES (?, ?, ?, ?)`,
          [id, newImages[i], isFeatured, startOrder + i]
        );
      }
    }

    // Update featured flag on existing images
    if (featuredUrl) {
      await execute(`UPDATE project_images SET is_featured=0 WHERE project_id=?`, [id]);
      await execute(`UPDATE project_images SET is_featured=1 WHERE project_id=? AND image_url=?`, [id, featuredUrl]);
    }

    return NextResponse.json({ success: true, message: "Updated!" });
  } else {
    // Client admin — save edit to drafts
    const draftData = JSON.stringify({ id, title, slug, category, location, year, description, video_url, newImages, deletedImageIds, featuredUrl });
    await execute(
      `INSERT INTO drafts (type, action, reference_id, data, submitted_by, status) VALUES ('project', 'edit', ?, ?, ?, 'pending')`,
      [id, draftData, user.email]
    );
    return NextResponse.json({ success: true, message: "Edit submitted for approval" });
  }
}

// DELETE — delete project
export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 });

  if (user.role === "super_admin") {
    await execute(`DELETE FROM project_images WHERE project_id=?`, [id]);
    await execute(`DELETE FROM projects WHERE id=?`, [id]);
    return NextResponse.json({ success: true, message: "Deleted" });
  } else {
    await execute(
      `INSERT INTO drafts (type, action, reference_id, submitted_by, status) VALUES ('project', 'delete', ?, ?, 'pending')`,
      [id, user.email]
    );
    return NextResponse.json({ success: true, message: "Delete request submitted for approval" });
  }
}
