export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, createToken, checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rateCheck.remainingMinutes} minutes.` },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required." }, { status: 400 });
  }

  const user = validateCredentials(email, password);

  if (!user) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  resetAttempts(ip);
  const token = await createToken(user);

  const response = NextResponse.json({ success: true, role: user.role });
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });

  return response;
}
