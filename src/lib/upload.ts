// Client-side upload helper.
// Uses XMLHttpRequest (not fetch) because only XHR exposes upload progress
// events. Reports 0–100% as the file is sent to the upload route.

export type UploadProgress = {
  loaded: number;
  total: number;
  percent: number;
};

export type UploadResult = { url: string; key: string };

export function uploadFileWithProgress(
  file: File,
  folder: string,
  onProgress?: (p: UploadProgress) => void
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress({ loaded: e.loaded, total: e.total, percent });
      }
    };

    xhr.onload = () => {
      let data: { url?: string; key?: string; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // fall through to generic error below
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.url) {
        resolve({ url: data.url, key: data.key || "" });
      } else {
        reject(new Error(data.error || `Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed — network error"));
    xhr.ontimeout = () => reject(new Error("Upload timed out"));

    xhr.send(formData);
  });
}
