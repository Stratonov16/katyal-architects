"use client";

import { useState } from "react";
import AdminHeader from "@/components/AdminHeader";

type Draft = {
  id: string;
  type: "project" | "review" | "team" | "about";
  title: string;
  action: "create" | "edit" | "delete";
  submittedBy: string;
  submittedAt: string;
};

export default function DraftsView() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const handleApprove = (id: string) => {
    setDrafts(drafts.filter((d) => d.id !== id));
  };

  const handleReject = (id: string) => {
    setDrafts(drafts.filter((d) => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <AdminHeader />
      <div className="max-w-4xl mx-auto px-8 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <a href="/admin" className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ← Dashboard
            </a>
            <h1 className="text-2xl font-light mt-2" style={{ fontFamily: "var(--font-display), serif" }}>
              Pending Drafts
            </h1>
          </div>
          <p className="text-xs text-[var(--text-muted)]">{drafts.length} pending</p>
        </div>

        {/* Drafts list */}
        {drafts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[var(--text-muted)] text-sm">No pending drafts to review.</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-2">When an admin makes changes, they&apos;ll appear here for approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="border border-[var(--border)] rounded-md p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] uppercase tracking-[0.1em] px-2 py-0.5 rounded ${
                      draft.action === "create" ? "bg-green-500/10 text-green-500" :
                      draft.action === "edit" ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-red-500/10 text-red-500"
                    }`}>
                      {draft.action}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">{draft.type}</span>
                  </div>
                  <p className="text-sm mt-2">{draft.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">
                    by {draft.submittedBy} · {draft.submittedAt}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleApprove(draft.id)}
                    className="text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(draft.id)}
                    className="text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
