import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { uploadToR2, generateKey } from "@/lib/r2";

export const runtime = "edge";

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const folder = formData.get("folder") as string || "uploads";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    const maxMB = maxSize / (1024 * 1024);
    return NextResponse.json({ error: `File too large. Max ${maxMB}MB.` }, { status: 400 });
  }

  const key = generateKey(folder, file.name);
  const buffer = await file.arrayBuffer();
  const url = await uploadToR2(buffer, key, file.type);

  return NextResponse.json({ url, key });
}
