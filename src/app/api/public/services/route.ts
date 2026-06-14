export const runtime = "edge";

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const services = await query(`SELECT slug, name, image_url FROM services ORDER BY id ASC`);
  return NextResponse.json({ services });
}
