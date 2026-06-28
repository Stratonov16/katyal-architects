export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { AwsClient } from "aws4fetch";
import { getCurrentUser } from "@/lib/auth";
import { getRequestContext } from "@cloudflare/next-on-pages";

function env(key: string): string {
  try {
    const { env } = getRequestContext();
    return (env as unknown as Record<string, string>)[key] || process.env[key] || "";
  } catch {
    return process.env[key] || "";
  }
}

function buildKey(folder: string, filename: string): string {
  const timestamp = Date.now();
  const clean = filename.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  const safeFolder = folder.replace(/[^a-zA-Z0-9/_-]/g, "-");
  return `${safeFolder}/${timestamp}-${clean}`;
}

// POST — return a presigned URL the browser can PUT a file straight to R2 with.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType, folder } = await request.json();
  if (!filename || !contentType) {
    return NextResponse.json({ error: "filename and contentType required" }, { status: 400 });
  }

  const accountId = env("R2_ACCOUNT_ID");
  const accessKeyId = env("R2_ACCESS_KEY_ID");
  const secretAccessKey = env("R2_SECRET_ACCESS_KEY");
  const publicUrl = env("R2_PUBLIC_URL");
  const bucket = env("R2_BUCKET_NAME") || "katyal-architects-media";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return NextResponse.json(
      { error: "Direct upload is not configured. Missing R2 API credentials." },
      { status: 500 }
    );
  }

  const key = buildKey(folder || "uploads", filename);

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });

  // Presigned PUT, valid for 1 hour. We sign only the host (default for
  // query signing), so the browser is free to send the file's Content-Type.
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}?X-Amz-Expires=3600`;

  const signed = await client.sign(endpoint, {
    method: "PUT",
    aws: { signQuery: true },
  });

  return NextResponse.json({
    uploadUrl: signed.url,
    publicUrl: `${publicUrl}/${key}`,
    key,
  });
}
