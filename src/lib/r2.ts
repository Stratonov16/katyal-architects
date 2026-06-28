import { getRequestContext } from "@cloudflare/next-on-pages";

export function getR2() {
  const { env } = getRequestContext();
  return env.BUCKET;
}

function getPublicUrl(): string {
  try {
    const { env } = getRequestContext();
    return (env as unknown as Record<string, string>).R2_PUBLIC_URL || "";
  } catch {
    return process.env.R2_PUBLIC_URL || "";
  }
}

export async function uploadToR2(file: Buffer | ArrayBuffer, key: string, contentType: string): Promise<string> {
  const r2 = getR2();
  await r2.put(key, file, {
    httpMetadata: { contentType },
  });
  return `${getPublicUrl()}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
  const r2 = getR2();
  await r2.delete(key);
}

// Extract the R2 object key from a full public URL and delete it
export async function deleteByUrl(url: string): Promise<void> {
  if (!url) return;
  try {
    const publicUrl = getPublicUrl();
    let key = url;
    if (publicUrl && url.startsWith(publicUrl)) {
      key = url.slice(publicUrl.length).replace(/^\//, "");
    } else {
      // Fallback: take everything after the domain
      key = new URL(url).pathname.replace(/^\//, "");
    }
    if (key) {
      const r2 = getR2();
      await r2.delete(key);
    }
  } catch {
    // Ignore — don't block DB deletion if R2 delete fails
  }
}

export function generateKey(folder: string, filename: string): string {
  const timestamp = Date.now();
  const clean = filename.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  return `${folder}/${timestamp}-${clean}`;
}
