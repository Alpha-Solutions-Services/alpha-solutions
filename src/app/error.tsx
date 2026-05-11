"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[app:error]", error?.digest, error?.message, error?.stack ?? "");
  }, [error]);

  const showVerbose =
    process.env.NEXT_PUBLIC_VERBOSE_ERRORS === "1" ||
    process.env.NODE_ENV === "development";

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-8 text-center">
        <h1
          className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          We hit an unexpected error while loading this page.
        </p>
        {error?.digest ? (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Error ID: {error.digest}
          </p>
        ) : null}
        {showVerbose && error?.message ? (
          <pre className="mt-4 max-h-48 overflow-auto rounded-lg border border-[var(--color-border)] bg-black/40 p-3 text-left text-[10px] whitespace-pre-wrap break-words text-red-100/90">
            {error.message}
          </pre>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
