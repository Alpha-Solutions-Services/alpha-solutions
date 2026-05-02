"use client";

import { MessageSquare } from "lucide-react";
import type { PortalMessage } from "@/lib/sanity/portal-data";

export function MessageThread({
  messages,
  onWhatsApp,
}: {
  messages: PortalMessage[];
  onWhatsApp?: () => void;
}) {
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
          Logged touchpoints with your project team.
        </p>
      </div>
      <div className="p-6">
        {messages.length > 0 ? (
          <ul className="space-y-3">
            {messages.map((m) => (
              <li
                key={m._id}
                className="rounded-lg border border-[var(--color-border)] p-3"
              >
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {m.message}
                </p>
                <div className="mt-1 flex justify-between text-xs text-[var(--color-muted)]">
                  <span>
                    {m.projectTitle
                      ? `Project: ${m.projectTitle}`
                      : "General"}
                  </span>
                  <span>
                    {m.timestamp
                      ? new Date(m.timestamp).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-12 text-center">
            <MessageSquare
              className="mx-auto mb-4 h-12 w-12 text-[var(--color-muted)]"
              aria-hidden
            />
            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              No messages yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-muted)]">
              Start a conversation with the Alpha Solutions team on WhatsApp.
            </p>
            {onWhatsApp ? (
              <button
                type="button"
                onClick={onWhatsApp}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageSquare className="h-4 w-4" aria-hidden />
                Send WhatsApp message
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
