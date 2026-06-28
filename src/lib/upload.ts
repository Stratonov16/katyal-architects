// Client-side upload helper.
//
// Primary path: ask the server for a presigned R2 URL, then PUT the file
// straight to R2 from the browser. This skips the Cloudflare Worker entirely,
// so there's no ~100MB request cap and large videos upload fast.
//
// Fallback path: if presigning isn't configured yet (no R2 API credentials),
// fall back to the old Worker-proxied upload so nothing breaks.
//
// Both paths use XMLHttpRequest because only XHR exposes upload.onprogress
// (fetch does not), which is what drives the progress bar.

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type UploadResult = { url: string; key: string };

function xhrUpload(
  method: "PUT" | "POST",
  url: string,
  body: Document | XMLHttpRequestBodyInit,
  contentType: string | null,
  onProgress?: (p: UploadProgress) => void
): Promise<XMLHttpRequest> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (contentType) xhr.setRequestHeader("Content-Type", contentType);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress({ loaded: e.loaded, total: e.total, percent });
      }
    };

    xhr.onload = () => resolve(xhr);
    xhr.onerror = () => reject(new Error("Upload failed — network error"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));

    xhr.send(body);
  });
}

// Old path: stream the file through our Worker route.
async function uploadViaWorker(
  file: File,
  folder: string,
  onProgress?: (p: UploadProgress) => void
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const xhr = await xhrUpload("POST", "/api/admin/upload", formData, null, onProgress);
  let data: { url?: string; key?: string; error?: string } = {};
  try {
    data = JSON.parse(xhr.responseText);
  } catch {
    /* fall through */
  }
  if (xhr.status >= 200 && xhr.status < 300 && data.url) {
    return { url: data.url, key: data.key || "" };
  }
  throw new Error(data.error || `Upload failed (${xhr.status})`);
}

export async function uploadFileWithProgress(
  file: File,
  folder: string,
  onProgress?: (p: UploadProgress) => void
): Promise<UploadResult> {
  // Step 1: ask the server for a presigned URL.
  let presign: { uploadUrl?: string; publicUrl?: string; key?: string; error?: string } | null = null;
  try {
    const res = await fetch("/api/admin/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        folder,
      }),
    });
    presign = await res.json();
    if (!res.ok) {
      // Not configured (500) → fall back to the Worker path.
      if (res.status === 500) return uploadViaWorker(file, folder, onProgress);
      throw new Error(presign?.error || `Could not start upload (${res.status})`);
    }
  } catch (err) {
    // If presign request itself failed unexpectedly, try the Worker path once.
    if (!presign) return uploadViaWorker(file, folder, onProgress);
    throw err;
  }

  if (!presign?.uploadUrl || !presign.publicUrl) {
    return uploadViaWorker(file, folder, onProgress);
  }

  // Step 2: PUT the file straight to R2.
  const xhr = await xhrUpload(
    "PUT",
    presign.uploadUrl,
    file,
    file.type || "application/octet-stream",
    onProgress
  );

  if (xhr.status >= 200 && xhr.status < 300) {
    return { url: presign.publicUrl, key: presign.key || "" };
  }
  throw new Error(`Upload to storage failed (${xhr.status})`);
}
