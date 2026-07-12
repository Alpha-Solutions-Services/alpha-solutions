"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDashboardMobileNavClose } from "@/components/layout/ResponsiveDashboardShell";

export function AdminSidebar({
  email,
  onNavigate,
}: {
  email: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const closeFromShell = useDashboardMobileNavClose();
  function handleNavigate() {
    onNavigate?.();
    closeFromShell?.();
  }

  async function signOut() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)]/30 md:block">
      <div className="flex h-full flex-col gap-6 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Admin
          </p>
          <p className="mt-1 truncate text-sm text-[var(--color-text)]">{email}</p>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link
            href="/admin/dashboard"
            onClick={handleNavigate}
            className="rounded-lg px-3 py-2 text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            Dashboard
          </Link>
          <Link
            href="/"
            onClick={handleNavigate}
            className="rounded-lg px-3 py-2 text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            Public site
          </Link>
          <Link
            href="/portal/dashboard"
            onClick={handleNavigate}
            className="rounded-lg px-3 py-2 text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            Client portal
          </Link>
          <Link
            href="/freight/dispatcher/academy"
            onClick={handleNavigate}
            className="rounded-lg px-3 py-2 text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            Academy payments
          </Link>
          <Link
            href="/freight/instructor/dashboard"
            onClick={handleNavigate}
            className="rounded-lg px-3 py-2 text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
          >
            Instructor portal
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-auto rounded-lg border border-[var(--color-border)] px-3 py-2 text-left text-sm text-[var(--color-muted)] hover:text-[var(--color-text)]"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
