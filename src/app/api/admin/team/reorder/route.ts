export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { execute } from "@/lib/db";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await request.json();

  for (let i = 0; i < ids.length; i++) {
    await execute(`UPDATE team SET "order"=? WHERE id=?`, [i, ids[i]]);
  }

  return NextResponse.json({ success: true });
}
