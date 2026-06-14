"use client";

import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

export default function AdminHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 bg-[var(--bg)]/80 backdrop-blur-md">
      <a href="/">
        <Logo size="sm" />
      </a>
      <ThemeToggle />
    </div>
  );
}
