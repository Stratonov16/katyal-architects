"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import Toast from "@/components/Toast";

export default function ContactManager({ userRole }: { userRole: string }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Contact form submissions
  const [submissions, setSubmissions] = useState<{ id: number; name: string; email: string; phone: string; service: string; location: string; created_at: string; is_read: number }[]>([]);

  useEffect(() => {
    fetch("/api/admin/contact")
      .then((r) => r.json())
      .then((d) => {
        if (d.contact) {
          setEmail(d.contact.email || "");
          setPhone(d.contact.phone || "");
          setAddress(d.contact.address || "");
          setMapsLink(d.contact.maps_link || "");
        }
        if (d.submissions) setSubmissions(d.submissions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/admin/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, address, maps_link: mapsLink }),
    });

    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setToast({ message: data.message || "Saved!", type: "success" });
    } else {
      setToast({ message: data.error || "Failed to save", type: "error" });
    }
  };

  const markAsRead = async (id: number) => {
    await fetch(`/api/admin/contact?markRead=${id}`, { method: "PUT" });
    setSubmissions(submissions.map((s) => s.id === id ? { ...s, is_read: 1 } : s));
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
            Contact Info
          </h1>
        </div>

        {/* Contact info form */}
        <form onSubmit={handleSubmit} className="border border-[var(--border)] rounded-md p-6 mb-12 space-y-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">Update Contact Details</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />
          <input
            type="text"
            placeholder="Phone (e.g., +91 6377432778)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />
          <input
            type="text"
            placeholder="Google Maps Link"
            value={mapsLink}
            onChange={(e) => setMapsLink(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--border)] py-3 text-sm outline-none focus:border-[var(--text)] transition-colors"
          />
          <button
            type="submit"
            disabled={saving}
            className="text-xs uppercase tracking-[0.2em] border border-[var(--text)] px-6 py-3 rounded-md hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all duration-300 disabled:opacity-30"
          >
            {saving ? "Saving..." : userRole === "super_admin" ? "Update" : "Submit Draft"}
          </button>
        </form>

        {/* Contact form submissions */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">
            Quote Requests ({submissions.filter((s) => !s.is_read).length} unread)
          </p>
          {submissions.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <div key={sub.id} className={`border rounded-md p-4 ${sub.is_read ? "border-[var(--border)] opacity-60" : "border-[var(--review-border)]"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{sub.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{sub.email} · {sub.phone}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">{sub.service} · {sub.location}</p>
                      <p className="text-[9px] text-[var(--text-muted)] mt-2">{sub.created_at}</p>
                    </div>
                    {!sub.is_read && (
                      <button
                        onClick={() => markAsRead(sub.id)}
                        className="text-[9px] uppercase tracking-[0.1em] px-2 py-1 border border-[var(--border)] rounded hover:bg-[var(--text)]/5 transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
