"use client";

import { useEffect, useState } from "react";

const LOGO_URL = "https://media.katyalarchitects.com/static/logo/logo.jpg";

// Branded intro loader. Shows for `duration` ms, then fades out over 600ms.
export default function Loader({ duration = 1500 }: { duration?: number }) {
  const [hidden, setHidden] = useState(false);   // start fade-out
  const [removed, setRemoved] = useState(false);  // unmount after fade

  useEffect(() => {
    const fadeTimer = setTimeout(() => setHidden(true), duration);
    const removeTimer = setTimeout(() => setRemoved(true), duration + 600); // + fade
    // Lock scroll while the loader is up
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = "";
    };
  }, [duration]);

  useEffect(() => {
    if (hidden) document.body.style.overflow = "";
  }, [hidden]);

  if (removed) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg)] transition-opacity duration-[600ms] ease-in-out ${
        hidden ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Logo — fades + scales in */}
      <img
        src={LOGO_URL}
        alt="Katyal Architects"
        className="w-16 h-16 rounded-full object-cover mb-6 animate-loader-logo"
      />

      {/* Firm name — letterspacing eases open */}
      <h1
        className="text-lg md:text-xl font-light text-[var(--text)] animate-loader-title"
        style={{ fontFamily: "var(--font-display), serif" }}
      >
        KATYAL ARCHITECTS
      </h1>

      <p className="mt-2 text-[9px] uppercase tracking-[0.3em] text-[var(--text-muted)] animate-loader-tagline">
        Driven by Vision, Defined by Impact
      </p>
    </div>
  );
}
