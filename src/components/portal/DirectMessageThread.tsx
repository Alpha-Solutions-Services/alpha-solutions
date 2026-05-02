"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

type DmRow = {
  id: string;
  is_admin: boolean;
  body: string;
  created_at: string;
};

export function DirectMessageThread() {
  const [messages, setMessages] = useState<DmRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/dm");
      const json = (await res.json()) as { messages?: DmRow[]; error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setMessages(json.messages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function send() {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Send failed");
      }
      setText("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30">
      <div className="border-b border-[var(--color-border)] p-6">
        <h2
          className="flex items-center gap-2 text-xl font-bold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          <MessageSquare
            className="h-5 w-5 text-[var(--color-accent)]"
            aria-hidden
          />
          Messages
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Direct line to the Alpha Solutions team. Replies appear here when
          staff respond from the admin console.
        </p>
      </div>
      <div className="flex max-h-[min(520px,70vh)] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-6">
          {loading ? (
            <p className="text-sm text-[var(--color-muted)]">Loading…</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-[var(--color-muted)]">
              No messages yet. Say hello below — we typically reply within one
              business day.
            </p>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-lg border p-3 ${
                  m.is_admin
                    ? "ml-0 border-[var(--color-accent)]/35 bg-[var(--color-accent-dim)]/40"
                    : "mr-0 border-[var(--color-border)] bg-[var(--color-bg)]/40"
                }`}
              >
                <p className="text-sm text-[var(--color-text)]">{m.body}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {m.is_admin ? "Alpha Solutions" : "You"} ·{" "}
                  {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-[var(--color-border)] p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Write a message…"
            className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none ring-[var(--color-accent)] focus:ring-2"
          />
          <button
            type="button"
            disabled={sending || !text.trim()}
            onClick={() => void send()}
            className="mt-3 w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </div>
      </div>
    </div>
  );
}
