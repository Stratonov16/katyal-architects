"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-14 bg-[var(--bg)]/80 backdrop-blur-md">
        <a href="/" className="text-lg font-bold tracking-wider hover:opacity-60 transition-opacity" style={{ fontFamily: "var(--font-display), serif" }}>K</a>
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)]">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="text-xs uppercase tracking-[0.3em] border border-[var(--text)] px-8 py-4 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="text-center mt-6 space-y-3">
            <a href="/admin/register" className="block text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors uppercase tracking-[0.15em]">
              Create Account
            </a>
            <a href="/admin/forgot-password" className="block text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors uppercase tracking-[0.15em]">
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}
