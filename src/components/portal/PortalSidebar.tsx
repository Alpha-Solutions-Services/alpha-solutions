import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

export function PortalSidebar({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/40">
      <div className="border-b border-[var(--color-border)] p-5">
        <Link
          href="/portal/dashboard"
          className="flex items-center gap-3 text-[var(--color-text)]"
        >
          <Image
            src="/alpha-logo.png"
            alt="Alpha Solutions"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-[var(--color-border)]"
          />
          <div>
            <p className="text-sm font-bold leading-tight">Client Portal</p>
            <p className="text-xs text-[var(--color-muted)]">Alpha Solutions</p>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Portal">
        <Link
          href="/portal/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)]"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
          Dashboard
        </Link>
      </nav>
      <div className="border-t border-[var(--color-border)] p-3">
        <div className="mb-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 px-3 py-2">
          <p className="truncate text-sm font-medium text-[var(--color-text)]">
            {name}
          </p>
          <p className="truncate text-xs text-[var(--color-muted)]">{email}</p>
        </div>
        <LogoutButton />
        <Link
          href="/"
          className="mt-2 block rounded-lg px-3 py-2 text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)]"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
