export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export async function GET() {
  try {
    const { env } = getRequestContext();
    const envKeys = Object.keys(env);
    const hasEmail = "SUPER_ADMIN_EMAIL" in env;
    const hasPassword = "SUPER_ADMIN_PASSWORD" in env;
    const hasJwt = "JWT_SECRET" in env;
    const emailValue = (env as unknown as Record<string, string>).SUPER_ADMIN_EMAIL;

    return NextResponse.json({
      envKeys,
      hasEmail,
      hasPassword,
      hasJwt,
      emailFirstChar: emailValue ? emailValue[0] : "MISSING",
      processEnvEmail: process.env.SUPER_ADMIN_EMAIL || "NOT_SET",
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}
