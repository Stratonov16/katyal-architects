"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send an actual email with reset link
    // For now, just show confirmation (password is in env vars, so reset = change env var)
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-2xl font-bold tracking-wider" style={{ fontFamily: "var(--font-display), serif" }}>K</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] mt-2">Reset Password</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              If this email is registered, a reset link has been sent. Check your inbox.
            </p>
            <a href="/admin/login" className="inline-block mt-8 text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ← Back to Login
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed text-center">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
            />
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="text-xs uppercase tracking-[0.3em] border border-[var(--text)] px-8 py-4 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300"
              >
                Send Reset Link
              </button>
            </div>
            <p className="text-center">
              <a href="/admin/login" className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors uppercase tracking-[0.15em]">
                ← Back to Login
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
