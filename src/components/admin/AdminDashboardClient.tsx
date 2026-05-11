"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import {
  BarChart3,
  Inbox,
  MessageSquare,
  RefreshCw,
  Send,
} from "lucide-react";

type Stats = {
  inquiriesTotal: number;
  inquiriesNew: number;
  activeClientThreads: number;
  messagesLast7Days: number;
  pageViewsLast7Days: number;
};

type Inquiry = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  budget: string | null;
  service_slug: string;
  message: string;
  status: string;
  admin_notes: string | null;
};

type ThreadRow = {
  id: string;
  client_user_id: string;
  client_email: string | null;
  updated_at: string;
  messageCount: number;
  lastMessage: { body: string; created_at: string; is_admin: boolean } | null;
};

type DmMessage = {
  id: string;
  is_admin: boolean;
  body: string;
  created_at: string;
};

const tabs = [
  { id: "overview" as const, label: "Overview", icon: BarChart3 },
  { id: "inquiries" as const, label: "Inquiries", icon: Inbox },
  { id: "clients" as const, label: "Clients & chat", icon: MessageSquare },
];

export function AdminDashboardClient() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<DmMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setBusy(true);
    setLoadErr(null);
    try {
      const [sRes, iRes, tRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/inquiries"),
        fetch("/api/admin/threads"),
      ]);
      if (!sRes.ok) throw new Error("Stats failed");
      const sJson = (await sRes.json()) as Stats;
      setStats(sJson);
      if (iRes.ok) {
        const ij = (await iRes.json()) as { inquiries?: Inquiry[] };
        setInquiries(ij.inquiries ?? []);
      }
      if (tRes.ok) {
        const tj = (await tRes.json()) as { threads?: ThreadRow[] };
        setThreads(tj.threads ?? []);
      }
    } catch (e) {
      setLoadErr(e instanceof Error ? e.message : "Load failed");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function loadThreadMessages(threadId: string) {
    setSelectedThread(threadId);
    const res = await fetch(`/api/admin/threads/${threadId}/messages`);
    if (!res.ok) return;
    const j = (await res.json()) as { messages?: DmMessage[] };
    setThreadMessages(j.messages ?? []);
  }

  async function sendReply() {
    if (!selectedThread || !reply.trim()) return;
    const res = await fetch(
      `/api/admin/threads/${selectedThread}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply.trim() }),
      }
    );
    if (!res.ok) return;
    setReply("");
    await loadThreadMessages(selectedThread);
    void refresh();
  }

  async function patchInquiry(id: string, status: Inquiry["status"]) {
    await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    void refresh();
  }

  return (
    <div className="min-w-0 flex-1 px-4 py-6 supports-[padding:max(0px)]:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 md:p-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--color-text)] md:text-3xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Admin
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Inquiries, site activity, and client messaging.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] disabled:opacity-50"
        >
          <RefreshCw className={clsx("h-4 w-4", busy && "animate-spin")} />
          Refresh
        </button>
      </header>

      {loadErr ? (
        <p className="mb-6 text-sm text-red-400">{loadErr}</p>
      ) : null}

      <div
        className="mb-8 flex gap-2 overflow-x-auto border-b border-[var(--color-border)] pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
            )}
          >
            <t.icon className="h-4 w-4" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Total inquiries", stats.inquiriesTotal],
            ["New inquiries", stats.inquiriesNew],
            ["Client chat threads", stats.activeClientThreads],
            ["Messages (7 days)", stats.messagesLast7Days],
            ["Page views (7 days)", stats.pageViewsLast7Days],
          ].map(([label, val]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                {label}
              </p>
              <p
                className="mt-2 text-3xl font-bold text-[var(--color-text)]"
                style={{ fontFamily: "var(--font-display), sans-serif" }}
              >
                {val}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "inquiries" ? (
        <div className="max-h-[70vh] overflow-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/40">
              <tr>
                <th className="p-3 font-semibold text-[var(--color-text)]">
                  Date
                </th>
                <th className="p-3 font-semibold text-[var(--color-text)]">
                  Contact
                </th>
                <th className="p-3 font-semibold text-[var(--color-text)]">
                  Service
                </th>
                <th className="p-3 font-semibold text-[var(--color-text)]">
                  Message
                </th>
                <th className="p-3 font-semibold text-[var(--color-text)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="p-3 text-[var(--color-muted)]">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 text-[var(--color-text)]">
                    <div className="font-medium">{row.name}</div>
                    <a
                      href={`mailto:${row.email}`}
                      className="text-[var(--color-accent)] hover:underline"
                    >
                      {row.email}
                    </a>
                    {row.phone ? (
                      <div className="text-xs text-[var(--color-muted)]">
                        {row.phone}
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3 text-[var(--color-muted)]">
                    {row.service_slug}
                    {row.budget ? (
                      <div className="text-xs">Budget: {row.budget}</div>
                    ) : null}
                  </td>
                  <td className="max-w-xs p-3 text-[var(--color-muted)]">
                    <p className="line-clamp-4">{row.message}</p>
                  </td>
                  <td className="p-3">
                    <select
                      value={row.status}
                      onChange={(e) =>
                        void patchInquiry(
                          row.id,
                          e.target.value as Inquiry["status"]
                        )
                      }
                      className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)]"
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inquiries.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--color-muted)]">
              No inquiries yet. Submit the contact form once Supabase tables +
              service role key are configured.
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "clients" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/20">
            <div className="border-b border-[var(--color-border)] p-4">
              <h2 className="font-semibold text-[var(--color-text)]">
                Active clients (threads)
              </h2>
            </div>
            <ul className="max-h-[480px] divide-y divide-[var(--color-border)] overflow-y-auto">
              {threads.map((th) => (
                <li key={th.id}>
                  <button
                    type="button"
                    onClick={() => void loadThreadMessages(th.id)}
                    className={clsx(
                      "w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--color-surface)]/50",
                      selectedThread === th.id && "bg-[var(--color-accent-dim)]/30"
                    )}
                  >
                    <div className="font-medium text-[var(--color-text)]">
                      {th.client_email || th.client_user_id.slice(0, 8) + "…"}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {th.messageCount} messages · updated{" "}
                      {new Date(th.updated_at).toLocaleString()}
                    </div>
                    {th.lastMessage ? (
                      <div className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)]">
                        {th.lastMessage.is_admin ? "Team: " : "Client: "}
                        {th.lastMessage.body}
                      </div>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
            {threads.length === 0 ? (
              <p className="p-6 text-center text-sm text-[var(--color-muted)]">
                No threads until a client signs into /portal and opens
                Messages.
              </p>
            ) : null}
          </div>

          <div className="flex min-h-[420px] flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/20">
            <div className="border-b border-[var(--color-border)] p-4">
              <h2 className="font-semibold text-[var(--color-text)]">
                Conversation
              </h2>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {!selectedThread ? (
                <p className="text-sm text-[var(--color-muted)]">
                  Select a client thread.
                </p>
              ) : (
                threadMessages.map((m) => (
                  <div
                    key={m.id}
                    className={clsx(
                      "rounded-lg border p-2 text-sm",
                      m.is_admin
                        ? "border-[var(--color-accent)]/40 bg-[var(--color-accent-dim)]/25"
                        : "border-[var(--color-border)]"
                    )}
                  >
                    <p className="text-[var(--color-text)]">{m.body}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {m.is_admin ? "You" : "Client"} ·{" "}
                      {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-[var(--color-border)] p-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                disabled={!selectedThread}
                placeholder="Reply to client…"
                className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
              />
              <button
                type="button"
                disabled={!selectedThread || !reply.trim()}
                onClick={() => void sendReply()}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[#05080F] disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden />
                Send to client
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
