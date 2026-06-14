import { getRequestContext } from "@cloudflare/next-on-pages";

export function getR2() {
  const { env } = getRequestContext();
  return env.BUCKET;
}

export async function uploadToR2(file: Buffer | ArrayBuffer, key: string, contentType: string): Promise<string> {
  const r2 = getR2();
  await r2.put(key, file, {
    httpMetadata: { contentType },
  });
  // Return the public URL (configured via custom domain or R2 public access)
  return `${process.env.R2_PUBLIC_URL || ""}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const r2 = getR2();
  await r2.delete(key);
}

export function generateKey(folder: string, filename: string): string {
  const timestamp = Date.now();
  const clean = filename.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  return `${folder}/${timestamp}-${clean}`;
}
