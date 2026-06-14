export const runtime = "edge";

import { NextResponse } from "next/server";
import { queryOne } from "@/lib/db";

export async function GET() {
  const contact = await queryOne(
    `SELECT email, phone, address, maps_link FROM contact_info LIMIT 1`
  );

  return NextResponse.json({ contact: contact || { email: "", phone: "", address: "", maps_link: "" } });
}
