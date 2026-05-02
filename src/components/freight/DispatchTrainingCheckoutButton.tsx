"use client";

import { useState } from "react";

export function DispatchTrainingCheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/dispatch-training", {
        method: "POST",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-accent)] px-8 py-4 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90 disabled:opacity-70 sm:w-auto"
      >
        {loading ? "Redirecting…" : "Pay $120 — Secure Checkout"}
      </button>
      {error ? (
        <p className="mt-3 text-xs text-red-400">
          {error}. You can still enroll via WhatsApp.
        </p>
      ) : null}
    </div>
  );
}

