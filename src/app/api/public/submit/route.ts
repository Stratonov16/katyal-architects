export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { name, email, phone, service, location } = await request.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email required" }, { status: 400 });
  }

  await execute(
    `INSERT INTO contact_submissions (name, email, phone, service, location) VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone || "", service || "", location || ""]
  );

  return NextResponse.json({ success: true, message: "Thank you! We'll get back to you soon." });
}
