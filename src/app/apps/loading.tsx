export default function AppsLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 h-10 w-48 animate-pulse rounded bg-[var(--color-surface)]/40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30" />
          <div className="h-64 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30" />
          <div className="h-64 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30" />
        </div>
      </div>
    </main>
  );
}
