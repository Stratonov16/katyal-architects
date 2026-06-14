"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
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

      router.push("/admin/login");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[var(--bg)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-2xl font-bold tracking-wider" style={{ fontFamily: "var(--font-display), serif" }}>K</p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--text-muted)] mt-2">Create Admin Account</p>
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
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>

          <p className="text-center mt-6">
            <a href="/admin/login" className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors uppercase tracking-[0.15em]">
              Already have an account? Sign In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
