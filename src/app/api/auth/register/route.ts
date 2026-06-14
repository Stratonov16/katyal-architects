import { NextRequest, NextResponse } from "next/server";
import { registerClientAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const success = registerClientAdmin(email, password);

  if (!success) {
    return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  }

  return NextResponse.json({ success: true, message: "Account created. You can now sign in." });
}
