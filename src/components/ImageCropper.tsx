"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

export type CropData = {
  x: number;
  y: number;
  zoom: number;
  aspect: number;
  croppedAreaPixels: { x: number; y: number; width: number; height: number } | null;
};

type AspectPreset = {
  label: string;
  value: number;
};

const ASPECT_PRESETS: Record<string, AspectPreset[]> = {
  hero: [
    { label: "16:9", value: 16 / 9 },
    { label: "16:7", value: 16 / 7 },
    { label: "21:9", value: 21 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
    { label: "1:1", value: 1 },
    { label: "Free", value: 0 },
  ],
  project: [
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
    { label: "16:9", value: 16 / 9 },
    { label: "1:1", value: 1 },
    { label: "9:16", value: 9 / 16 },
    { label: "2:3", value: 2 / 3 },
    { label: "Free", value: 0 },
  ],
  profile: [
    { label: "1:1", value: 1 },
    { label: "4:5", value: 4 / 5 },
    { label: "Free", value: 0 },
  ],
  portrait: [
    { label: "4:5", value: 4 / 5 },
    { label: "3:4", value: 3 / 4 },
    { label: "2:3", value: 2 / 3 },
    { label: "1:1", value: 1 },
    { label: "Free", value: 0 },
  ],
};

type ImageCropperProps = {
  imageUrl: string;
  type: "hero" | "project" | "profile" | "portrait";
  initialCrop?: CropData;
  onApply: (cropData: CropData) => void;
  onCancel: () => void;
};

export default function ImageCropper({ imageUrl, type, initialCrop, onApply, onCancel }: ImageCropperProps) {
  const presets = ASPECT_PRESETS[type];
  const [crop, setCrop] = useState({ x: initialCrop?.x || 0, y: initialCrop?.y || 0 });
  const [zoom, setZoom] = useState(initialCrop?.zoom || 1);
  const [aspect, setAspect] = useState(initialCrop?.aspect || presets[0].value);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropData["croppedAreaPixels"]>(null);

  const onCropComplete = useCallback((_: unknown, croppedPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = () => {
    onApply({
      x: crop.x,
      y: crop.y,
      zoom,
      aspect,
      croppedAreaPixels,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[90vw] max-w-3xl bg-[var(--bg)] rounded-lg overflow-hidden shadow-2xl">
        {/* Crop area */}
        <div className="relative h-[50vh] bg-black">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={true}
            cropShape={type === "profile" && aspect === 1 ? "round" : "rect"}
          />
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4">
          {/* Zoom slider */}
          <div className="flex items-center gap-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] w-12">Zoom</p>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1 bg-[var(--border)] rounded-full appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-[var(--text-muted)] w-8">{zoom.toFixed(1)}x</span>
          </div>

          {/* Aspect ratio presets */}
          {presets.length > 1 && (
            <div className="flex items-center gap-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] w-12">Ratio</p>
              <div className="flex gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setAspect(preset.value)}
                    className={`text-[10px] px-3 py-1.5 rounded border transition-colors ${
                      aspect === preset.value
                        ? "border-[var(--text)] bg-[var(--text)] text-[var(--bg)]"
                        : "border-[var(--border)] hover:border-[var(--text)]"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-md border border-[var(--border)] hover:bg-[var(--text)]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="text-[10px] uppercase tracking-[0.2em] px-5 py-2.5 rounded-md bg-[var(--text)] text-[var(--bg)] hover:opacity-80 transition-opacity"
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
