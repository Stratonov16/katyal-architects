// Bakes a crop into a real image file using a canvas.
// Takes the source image URL + the pixel rectangle that react-easy-crop
// reports (croppedAreaPixels) and returns a new cropped File ready to upload.

export async function getCroppedImageFile(
  imageSrc: string,
  croppedAreaPixels: { x: number; y: number; width: number; height: number },
  fileName = "cropped.jpg"
): Promise<File> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(croppedAreaPixels.width);
  canvas.height = Math.round(croppedAreaPixels.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas is empty"))),
      "image/jpeg",
      0.92
    );
  });

  return new File([blob], fileName.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  // For remote (http/https) images, fetch as a blob first and load from an
  // object URL. This forces a clean CORS request and avoids the "tainted
  // canvas" error that happens when the browser reuses a cached, non-CORS
  // copy of an already-displayed image (e.g. an existing hero/about photo).
  let objectUrl: string | null = null;
  let imageSrc = src;
  if (/^https?:\/\//.test(src)) {
    try {
      const res = await fetch(src, { mode: "cors", cache: "reload" });
      if (!res.ok) throw new Error(`Failed to load image (${res.status})`);
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      imageSrc = objectUrl;
    } catch {
      // Fall back to a direct CORS image load if fetch is blocked.
      imageSrc = src;
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (e) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(e);
    };
    img.src = imageSrc;
  });
}
