"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
} from "lucide-react";
import { useDashboardMobileNavClose } from "@/components/layout/ResponsiveDashboardShell";
import { LogoutButton } from "./LogoutButton";

const NAV = [
  { href: "/portal/dashboard", label: "Overview", icon: LayoutDashboard, hash: "overview" },
  { href: "/portal/dashboard?tab=projects", label: "Projects", icon: FolderKanban, hash: "projects" },
  { href: "/portal/dashboard?tab=files", label: "Files", icon: FileText, hash: "files" },
  { href: "/portal/dashboard?tab=messages", label: "Messages", icon: MessageSquare, hash: "messages" },
] as const;

export function PortalSidebar({
  name,
  email,
  onNavigate,
}: {
  name: string;
  email: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const closeFromShell = useDashboardMobileNavClose();
  function handleNavigate() {
    onNavigate?.();
    closeFromShell?.();
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-surface)]/40">
      <div className="border-b border-[var(--color-border)] p-5">
        <Link
          href="/portal/dashboard"
          onClick={handleNavigate}
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
        {NAV.map((item) => {
          const active = pathname.startsWith("/portal/dashboard");
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleNavigate}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "text-[var(--color-text)] hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)]",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--color-border)] p-3">
        <div className="mb-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 px-3 py-2">
          <p className="truncate text-sm font-medium text-[var(--color-text)]">{name}</p>
          <p className="truncate text-xs text-[var(--color-muted)]">{email}</p>
        </div>
        <p className="mb-2 px-1 text-[10px] text-[var(--color-muted)]">
          Support:{" "}
          <a href="mailto:info@alphasolutions.software" className="text-[var(--color-accent)]">
            info@alphasolutions.software
          </a>
        </p>
        <LogoutButton />
        <Link
          href="/"
          onClick={handleNavigate}
          className="mt-2 block rounded-lg px-3 py-2 text-center text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)]"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
