"use client";

import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Menu } from "lucide-react";

/**
 * Sidebar + main layout: drawer navigation on small screens, fixed sidebar from md up.
 */
export function ResponsiveDashboardShell({
  sidebar,
  mobileTitle,
  children,
}: {
  sidebar: (closeMobile: () => void) => ReactNode;
  mobileTitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  function closeMobile() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] w-full border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] md:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      ) : null}

      <div
        id="dashboard-sidebar"
        className={clsx(
          "fixed left-0 top-20 z-50 flex h-[calc(100vh-5rem)] max-w-[85vw] transition-transform duration-200 ease-out md:static md:z-0 md:h-auto md:max-w-none md:min-h-[calc(100vh-5rem)] md:translate-x-0 md:transition-none",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0",
        )}
      >
        {sidebar(closeMobile)}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-20 z-30 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 py-3 backdrop-blur-md supports-[padding:max(0px)]:pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
          <button
            type="button"
            className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text)] hover:bg-[var(--color-surface)]"
            aria-expanded={open}
            aria-controls="dashboard-sidebar"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5 shrink-0" aria-hidden />
          </button>
          <span className="min-w-0 truncate text-sm font-semibold text-[var(--color-text)]">
            {mobileTitle}
          </span>
        </header>
        {children}
      </div>
    </div>
  );
}
