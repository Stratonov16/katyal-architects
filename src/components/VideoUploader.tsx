"use client";

import { useState, useRef } from "react";

type VideoData = {
  type: "upload" | "youtube";
  file?: File;
  localUrl?: string;
  youtubeUrl?: string;
  youtubeId?: string;
};

type VideoUploaderProps = {
  onSelect: (video: VideoData) => void;
  onCancel: () => void;
};

const MAX_SIZE_MB = 200;

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\s]+)/,
    /(?:youtu\.be\/)([^?\s]+)/,
    /(?:youtube\.com\/embed\/)([^?\s]+)/,
    /(?:youtube\.com\/shorts\/)([^?\s]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VideoUploader({ onSelect, onCancel }: VideoUploaderProps) {
  const [mode, setMode] = useState<"choice" | "upload" | "youtube">("choice");
  const [error, setError] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [preview, setPreview] = useState<VideoData | null>(null);
  const [quality, setQuality] = useState(100);
  const [compressing, setCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [compressed, setCompressed] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCompress = async () => {
    if (!preview?.file) return;
    setCompressing(true);
    setCompressProgress(0);

    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile } = await import("@ffmpeg/util");

      const ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({ progress }) => {
        setCompressProgress(Math.round(progress * 100));
      });

      await ffmpeg.load();

      const inputName = "input.mp4";
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(preview.file));

      const crf = Math.round(51 - (quality / 100) * 30);
      await ffmpeg.exec(["-i", inputName, "-crf", String(crf), "-preset", "fast", outputName]);

      const data = await ffmpeg.readFile(outputName);
      const compressedFile = new File([data as unknown as BlobPart], preview.file.name, { type: "video/mp4" });

      setCompressed(compressedFile);
      setCompressing(false);
    } catch (err) {
      setError("Compression failed. Try uploading original instead.");
      setCompressing(false);
    }
  };

  const resetCompression = () => {
    setQuality(100);
    setCompressing(false);
    setCompressProgress(0);
    setCompressed(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file.");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_SIZE_MB) {
      setError(`Video too large (${sizeMB.toFixed(0)}MB). Maximum is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setError("");
    resetCompression();
    const url = URL.createObjectURL(file);
    setPreview({ type: "upload", file, localUrl: url });
  };

  const handleYoutubeSubmit = () => {
    const id = extractYoutubeId(youtubeUrl);
    if (!id) {
      setError("Invalid YouTube URL.");
      return;
    }
    setError("");
    setPreview({ type: "youtube", youtubeUrl, youtubeId: id });
  };

  const handleConfirm = () => {
    if (!preview) return;
    if (compressed && preview.type === "upload") {
      const url = URL.createObjectURL(compressed);
      onSelect({ ...preview, file: compressed, localUrl: url });
    } else {
      onSelect(preview);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[90vw] max-w-lg bg-[var(--bg)] rounded-lg overflow-hidden shadow-2xl p-6">

        {mode === "choice" && (
          <div className="space-y-6">
            <p className="text-sm text-center">Add Video</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode("upload")}
                className="border border-[var(--border)] rounded-md p-6 text-center hover:bg-[var(--text)]/5 transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.15em]">Upload</p>
                <p className="text-[9px] text-[var(--text-muted)] mt-2">MP4, WebM — max {MAX_SIZE_MB}MB</p>
                <p className="text-[9px] text-[var(--text-muted)]">No watermark</p>
              </button>
              <button
                onClick={() => setMode("youtube")}
                className="border border-[var(--border)] rounded-md p-6 text-center hover:bg-[var(--text)]/5 transition-colors"
              >
                <p className="text-xs uppercase tracking-[0.15em]">YouTube</p>
                <p className="text-[9px] text-[var(--text-muted)] mt-2">Paste URL</p>
                <p className="text-[9px] text-yellow-500">Has YouTube watermark</p>
              </button>
            </div>
            <div className="flex justify-center">
              <button onClick={onCancel} className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {mode === "upload" && !preview && (
          <div className="space-y-6">
            <p className="text-sm text-center">Upload Video</p>
            <div
              className="border-2 border-dashed border-[var(--border)] rounded-md p-8 text-center cursor-pointer hover:border-[var(--text)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-xs text-[var(--text-muted)]">Drop video or click to select</p>
              <p className="text-[9px] text-[var(--text-muted)] mt-2">MP4, WebM — max {MAX_SIZE_MB}MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            <div className="flex justify-between">
              <button onClick={() => { setMode("choice"); resetCompression(); setError(""); }} className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                ← Back
              </button>
            </div>
          </div>
        )}

        {mode === "youtube" && !preview && (
          <div className="space-y-6">
            <p className="text-sm text-center">YouTube Video</p>
            <div className="border border-yellow-500/30 rounded-md p-3 bg-yellow-500/5">
              <p className="text-[9px] text-yellow-500 text-center">YouTube embeds will show the YouTube logo watermark</p>
            </div>
            <input
              type="text"
              placeholder="Paste YouTube URL"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-between">
              <button onClick={() => { setMode("choice"); resetCompression(); setError(""); }} className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                ← Back
              </button>
              <button
                onClick={handleYoutubeSubmit}
                className="text-[10px] uppercase tracking-[0.2em] px-4 py-2 border border-[var(--text)] rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all"
              >
                Preview
              </button>
            </div>
          </div>
        )}

        {preview && (
          <div className="space-y-6">
            <p className="text-sm text-center">Preview</p>
            <div className="aspect-video bg-black rounded-md overflow-hidden">
              {preview.type === "upload" && preview.localUrl && (
                <video src={preview.localUrl} className="w-full h-full object-cover" controls muted />
              )}
              {preview.type === "youtube" && preview.youtubeId && (
                <iframe
                  src={`https://www.youtube.com/embed/${preview.youtubeId}?autoplay=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {preview.type === "upload" && preview.file && (
              <div className="space-y-4">
                <p className="text-[10px] text-[var(--text-muted)] text-center">
                  {preview.file.name} — {(preview.file.size / (1024 * 1024)).toFixed(1)}MB
                </p>

                {/* Compression option */}
                <div className="border border-[var(--border)] rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-[0.15em]">Compress (optional)</p>
                    <p className="text-[9px] text-[var(--text-muted)]">
                      Est. output: ~{Math.round((preview.file.size / (1024 * 1024)) * (quality / 100))}MB
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-[var(--text-muted)]">Smaller</span>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="flex-1 h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer"
                    />
                    <span className="text-[9px] text-[var(--text-muted)]">Original</span>
                  </div>
                  <p className="text-[9px] text-[var(--text-muted)] text-center">
                    {quality === 100 ? "No compression — original quality" : `Quality: ${quality}%`}
                  </p>
                  {quality < 100 && !compressing && !compressed && (
                    <button
                      onClick={handleCompress}
                      className="w-full text-[10px] uppercase tracking-[0.15em] py-2 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 transition-colors"
                    >
                      Compress Video
                    </button>
                  )}
                  {compressing && (
                    <div className="space-y-2">
                      <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--text)] transition-all duration-300" style={{ width: `${compressProgress}%` }} />
                      </div>
                      <p className="text-[9px] text-[var(--text-muted)] text-center">Compressing... {compressProgress}%</p>
                    </div>
                  )}
                  {compressed && (
                    <p className="text-[9px] text-green-500 text-center">
                      Compressed: {(compressed.size / (1024 * 1024)).toFixed(1)}MB (saved {Math.round((1 - compressed.size / preview.file!.size) * 100)}%)
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => { setPreview(null); resetCompression(); }}
                className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                ← Change
              </button>
              <button
                onClick={handleConfirm}
                disabled={compressing}
                className="text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-md bg-[var(--text)] text-[var(--bg)] hover:opacity-80 transition-opacity disabled:opacity-30"
              >
                {compressed ? "Add Compressed Video" : "Add Original Video"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
