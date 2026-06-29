// Helper to serve smaller, optimized versions of R2 images for thumbnails.
//
// Images live on media.katyalarchitects.com (a Cloudflare domain), so once
// Cloudflare "Image Transformations" is enabled for the zone we can resize on
// the fly with the /cdn-cgi/image/ prefix — no re-upload needed. A full 2000px
// photo is then delivered as e.g. a 600px thumbnail.
//
// SETUP TO TURN THIS ON:
//   1. Cloudflare dashboard -> the katyalarchitects.com zone -> Images ->
//      Transformations -> enable "Resize images from this zone".
//   2. Flip USE_CF_RESIZE below to true and redeploy.
// Until then this returns the original URL, so nothing breaks.

const USE_CF_RESIZE = false;

const MEDIA_HOST = "media.katyalarchitects.com";

type ThumbOpts = { width?: number; quality?: number };

export function thumb(url: string | undefined | null, opts: ThumbOpts = {}): string {
  if (!url) return "";
  if (!USE_CF_RESIZE) return url;

  // Only transform images on our own media domain.
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.hostname !== MEDIA_HOST) return url;
  // Don't transform videos.
  if (/\.(mp4|webm|mov)$/i.test(parsed.pathname)) return url;
  // Already a transform URL — leave it.
  if (parsed.pathname.startsWith("/cdn-cgi/image/")) return url;

  const width = opts.width ?? 600;
  const quality = opts.quality ?? 75;
  const params = `width=${width},quality=${quality},format=auto,fit=cover`;
  return `${parsed.origin}/cdn-cgi/image/${params}${parsed.pathname}`;
}
