export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { job_id, job_title, name, email, phone, resume_url, cover_letter } = await request.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  await execute(
    `INSERT INTO job_applications (job_id, job_title, name, email, phone, resume_url, cover_letter) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [job_id || 0, job_title || "", name, email, phone || "", resume_url || "", cover_letter || ""]
  );

  return NextResponse.json({ success: true, message: "Application submitted!" });
}
