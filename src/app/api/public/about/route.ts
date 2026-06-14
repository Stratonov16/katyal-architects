export const runtime = "edge";

import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET() {
  const about = await queryOne(
    `SELECT headline, description, photo_url FROM about WHERE status = 'published' LIMIT 1`
  );

  return NextResponse.json({ about: about || { headline: "", description: "", photo_url: "" } });
}
