"use client";

import { useState, useEffect, useRef } from "react";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";
import { uploadFileWithProgress } from "@/lib/upload";

type Service = {
  id: number;
  slug: string;
  name: string;
  image_url: string;
};

export default function ServicesManager({ userRole }: { userRole: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => { if (d.services) setServices(d.services); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleImageClick = (slug: string) => {
    setActiveSlug(slug);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlug) return;

    setUploading(activeSlug);
    setUploadProgress(0);

    // Upload directly to R2
    let url: string;
    try {
      const result = await uploadFileWithProgress(file, "services", (p) => setUploadProgress(p.percent));
      url = result.url;
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Upload failed", type: "error" });
      setUploading(null);
      setActiveSlug(null);
      e.target.value = "";
      return;
    }

    // Save to DB
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: activeSlug, image_url: url }),
    });

    if (res.ok) {
      setServices(services.map((s) => s.slug === activeSlug ? { ...s, image_url: url } : s));
      setToast({ message: "Updated!", type: "success" });
    } else {
      setToast({ message: "Failed to save", type: "error" });
    }

    setUploading(null);
    setActiveSlug(null);
    e.target.value = "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)]">
        <AdminHeader />
        <div className="flex items-center justify-center pt-32">
          <p className="text-sm text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AdminHeader />
      <div className="max-w-4xl mx-auto px-8 pt-20 pb-20">
        <div className="mb-8">
          <a href="/admin" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
            ← Dashboard
          </a>
          <h1 className="text-2xl font-light mt-2" style={{ fontFamily: "var(--font-display), serif" }}>
            Services
          </h1>
          <p className="text-[10px] text-[var(--text-muted)] mt-2">Click on any card to upload/change the cover image for that category</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.slug}
              className="relative aspect-[4/3] rounded-md overflow-hidden cursor-pointer group"
              onClick={() => handleImageClick(service.slug)}
            >
              {service.image_url ? (
                <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-[var(--border)]" />
              )}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                {uploading === service.slug ? (
                  <div className="w-3/4">
                    <p className="text-[10px] text-white text-center mb-1.5 tabular-nums">Uploading {uploadProgress}%</p>
                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white transition-all duration-200 ease-out" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-white">{service.name}</p>
                    <p className="text-[9px] text-white/60 mt-1">{service.image_url ? "Click to change" : "Click to upload"}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
