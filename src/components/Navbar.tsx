"use client";

import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]">
      {/* Logo — left */}
      <a href="/" className="text-2xl font-bold tracking-wider" style={{ fontFamily: "var(--font-display), serif" }}>
        K
      </a>

      {/* Nav links — center */}
      <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-body), sans-serif" }}>
        <a href="/" className="hover:opacity-60 transition-opacity">Home</a>
        <a href="#projects" className="hover:opacity-60 transition-opacity">Projects</a>
        <a href="#services" className="hover:opacity-60 transition-opacity">Services</a>
        <a href="#about" className="hover:opacity-60 transition-opacity">About Us</a>
        <a href="#contact" className="hover:opacity-60 transition-opacity">Contact Us</a>
      </div>

      {/* Theme toggle — extreme right */}
      <ThemeToggle />
    </nav>
  );
}
