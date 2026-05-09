export default function AdminLoading() {
  return (
    <div className="min-w-0 flex-1 p-6 md:p-8">
      <div className="mb-4 h-9 w-40 animate-pulse rounded bg-[var(--color-surface)]/40" />
      <div className="h-48 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30" />
    </div>
  );
}
