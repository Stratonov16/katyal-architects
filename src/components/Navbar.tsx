"use client";

import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
        setConnectOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 h-14 bg-[var(--bg)] border-b border-[var(--border)]">
        {/* Hamburger — left (mobile) */}
        <button
          className="md:hidden flex flex-col gap-[4px] w-5"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="w-full h-[1.5px] bg-[var(--text)]" />
          <span className="w-full h-[1.5px] bg-[var(--text)]" />
          <span className="w-full h-[1.5px] bg-[var(--text)]" />
        </button>

        {/* Logo — left (desktop) */}
        <a href="/" className="hidden md:block">
          <Logo size="sm" />
        </a>

        {/* Nav links — center (desktop only) */}
        <div className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.15em] font-normal" style={{ fontFamily: "var(--font-body), sans-serif" }}>
          <a href="/" className="hover:opacity-60 transition-opacity">HOME</a>
          <a href="#about" className="hover:opacity-60 transition-opacity">ABOUT</a>
          <div className="relative">
            <button
              onClick={() => { setServicesOpen(!servicesOpen); setConnectOpen(false); }}
              className="hover:opacity-60 transition-opacity"
            >
              SERVICES
            </button>
            {servicesOpen && (
              <div className="absolute top-8 left-0 bg-[var(--bg)] border border-[var(--border)] rounded-md shadow-lg p-4 flex flex-col gap-3 min-w-[150px]">
                <a href="/projects/residential" className="text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">RESIDENTIAL</a>
                <a href="/projects/hospitality" className="text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">HOSPITALITY</a>
                <a href="/projects/interiors" className="text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">INTERIORS</a>
                <a href="/projects/landscape" className="text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">LANDSCAPE</a>
                <a href="/projects/commercial" className="text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">COMMERCIAL</a>
                <a href="/projects/township" className="text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">TOWNSHIP</a>
              </div>
            )}
          </div>
          <a href="/careers" className="hover:opacity-60 transition-opacity">CAREERS</a>
          <div className="relative">
            <button
              onClick={() => { setConnectOpen(!connectOpen); setServicesOpen(false); }}
              className="contact-cta"
            >
              CONTACT US
            </button>
            {connectOpen && (
              <div className="absolute top-8 right-0 bg-[var(--bg)] border border-[var(--border)] rounded-md shadow-lg p-4 flex flex-col gap-3 min-w-[150px]">
                <a href="https://instagram.com/katyal_architects" target="_blank" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  INSTAGRAM
                </a>
                <a href="https://facebook.com" target="_blank" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                  FACEBOOK
                </a>
                <a href="https://linkedin.com" target="_blank" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                  LINKEDIN
                </a>
                <hr className="border-[var(--border)]" />
                <a href="#contact" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] hover:opacity-60 transition-opacity font-normal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  GET QUOTE
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Theme toggle — right */}
        <ThemeToggle />
      </nav>

      {/* Mobile overlay — slides from left */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <div
          className={`absolute top-0 left-0 h-full w-[60%] bg-[var(--bg)] border-r border-[var(--border)] p-8 flex flex-col transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="self-end mb-10 text-[var(--text)] hover:opacity-60"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Menu links */}
          <div className="flex flex-col gap-6 text-xs uppercase tracking-[0.2em] font-normal" style={{ fontFamily: "var(--font-body), sans-serif" }}>
            <a href="/" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">HOME</a>
            <a href="#about" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">ABOUT</a>
            <div>
              <button onClick={() => setMobileServicesOpen(!mobileServicesOpen)} className="hover:opacity-60 transition-opacity">SERVICES</button>
              {mobileServicesOpen && (
                <div className="flex flex-col gap-3 mt-3 ml-4 text-[10px] text-[var(--text-muted)]">
                  <a href="/projects/residential" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">RESIDENTIAL</a>
                  <a href="/projects/hospitality" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">HOSPITALITY</a>
                  <a href="/projects/interiors" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">INTERIORS</a>
                  <a href="/projects/landscape" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">LANDSCAPE</a>
                  <a href="/projects/commercial" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">COMMERCIAL</a>
                  <a href="/projects/township" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">TOWNSHIP</a>
                </div>
              )}
            </div>
            <a href="/careers" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">CAREERS</a>
            <a href="#contact" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity">CONTACT US</a>
            <a href="/admin" onClick={() => setMenuOpen(false)} className="hover:opacity-60 transition-opacity text-[var(--text-muted)]">ADMIN</a>
          </div>

          {/* Socials in mobile menu */}
          <div className="flex items-center gap-4 mt-10">
            <a href="https://instagram.com/katyal_architects" target="_blank" className="hover:opacity-60 transition-opacity">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </a>
            <a href="https://facebook.com" target="_blank" className="hover:opacity-60 transition-opacity">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" className="hover:opacity-60 transition-opacity">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
            </a>
          </div>

          {/* Logo + info at bottom */}
          <div className="mt-auto">
            <div className="mb-4"><Logo size="lg" /></div>
            <div className="text-[10px] text-[var(--text-muted)] space-y-2">
              <p>@katyal_architects</p>
              <p>info@katyalarchitects.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
