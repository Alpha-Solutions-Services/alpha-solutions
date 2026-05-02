"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ChevronDown, Menu, MessageCircle, Shield, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PILLARS } from "@/data/services";

function useHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const read = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  return hash;
}

const WEB = PILLARS[1].slug;
const BUSINESS = PILLARS[2].slug;
const SAAS = PILLARS[3].slug;
const AI = PILLARS[4].slug;

const SERVICES_DROPDOWN = [
  { label: "Web Development", href: `/services/${WEB}` },
  { label: "Mobile Apps", href: `/services/${WEB}#mobile` },
  { label: "AI & Automation", href: `/services/${AI}` },
  { label: "SaaS Products", href: `/services/${SAAS}` },
  { label: "Business Setup", href: `/services/${BUSINESS}` },
  { label: "Digital Marketing", href: `/services/${WEB}#marketing` },
] as const;

/** Single row, compact on lg–xl so Contact does not wrap under other links */
const navPillBase =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-2.5 py-1.5 text-xs font-medium outline-none transition-colors xl:px-3.5 xl:py-2 xl:text-sm";

function NavLink({
  href,
  children,
  active,
  className,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      prefetch
      onClick={onClick}
      className={clsx(
        navPillBase,
        active
          ? "border-[var(--color-accent)]/60 bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]/50 text-[var(--color-text)] hover:border-[var(--color-accent)]/35 hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const hash = useHash();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prefetch core routes so first navigation feels instant.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const warm = () => {
      [
        "/services",
        `/services/${WEB}`,
        `/services/${AI}`,
        `/services/${SAAS}`,
        `/services/${BUSINESS}`,
        "/projects",
        "/pricing",
        "/apps",
        "/about",
        "/contact",
      ].forEach((href) => router.prefetch(href));
    };

    const win = window as Window & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(warm, { timeout: 1500 });
      return () => win.cancelIdleCallback?.(id);
    }
    const t = globalThis.setTimeout(warm, 600);
    return () => globalThis.clearTimeout(t);
  }, [router]);

  const isServicesActive = pathname.startsWith("/services");
  const isPortalActive = pathname.startsWith("/portal");

  const linkActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 border-b border-[var(--color-border)]",
        "bg-[var(--color-bg)]/80 backdrop-blur-md backdrop-saturate-150"
      )}
    >
      <div className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:gap-3">
        <div className="flex min-w-0 shrink-0 items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--color-text)] transition-opacity hover:opacity-90 xl:gap-2.5"
          >
            <Image
              src="/alpha-logo.png"
              alt="Alpha Solutions Services LLC"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-lg object-cover"
              priority
            />
            <span
              className="whitespace-nowrap text-left text-xs font-bold leading-snug tracking-tight text-[var(--color-accent)] sm:text-sm xl:text-base"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Alpha Solutions Services LLC
            </span>
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-center xl:flex"
          aria-label="Main"
        >
          <div className="flex max-w-full flex-nowrap items-center justify-center gap-1 overflow-x-auto overflow-y-visible py-1 [-ms-overflow-style:none] [scrollbar-width:none] xl:gap-2 [&::-webkit-scrollbar]:hidden">
          <NavLink href="/" active={pathname === "/"}>
            Home
          </NavLink>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className={clsx(
                  navPillBase,
                  "gap-0.5 xl:gap-1",
                  "focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
                  isServicesActive
                    ? "border-[var(--color-accent)]/50 bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]/50 text-[var(--color-text)] hover:border-[var(--color-accent)]/35 hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)]"
                )}
              >
                Services
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-80 xl:h-4 xl:w-4" aria-hidden />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="center"
                sideOffset={10}
                className={clsx(
                  "z-[100] min-w-[14rem] overflow-hidden rounded-lg border border-[var(--color-border)]",
                  "bg-[var(--color-surface)] p-1 shadow-xl"
                )}
              >
                {SERVICES_DROPDOWN.map((item) => (
                  <DropdownMenu.Item key={item.href} asChild>
                    <Link
                      href={item.href}
                      prefetch
                      className={clsx(
                        "flex cursor-pointer select-none rounded-md px-3 py-2 text-sm outline-none",
                        "text-[var(--color-text)] hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)]",
                        "focus:bg-[var(--color-accent-dim)] focus:text-[var(--color-accent)]"
                      )}
                    >
                      {item.label}
                    </Link>
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
                <DropdownMenu.Item asChild>
                  <Link
                    href="/services"
                    prefetch
                    className={clsx(
                      "flex cursor-pointer select-none rounded-md px-3 py-2 text-sm font-medium outline-none",
                      "text-[var(--color-accent)] hover:bg-[var(--color-accent-dim)]",
                      "focus:bg-[var(--color-accent-dim)]"
                    )}
                  >
                    All Services →
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <NavLink href="/freight" active={linkActive("/freight")}>
            <span className="xl:hidden">Freight</span>
            <span className="hidden xl:inline">Alpha Freight</span>
          </NavLink>
          <NavLink href="/pricing" active={linkActive("/pricing")}>
            Pricing
          </NavLink>
          <NavLink href="/projects" active={linkActive("/projects")}>
            Projects
          </NavLink>
          <NavLink href="/apps" active={linkActive("/apps")}>
            Apps
          </NavLink>
          <NavLink href="/about" active={linkActive("/about")}>
            About
          </NavLink>
          <NavLink href="/contact" active={linkActive("/contact")}>
            Contact
          </NavLink>
          </div>
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/portal"
            className={clsx(
              "hidden shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-opacity xl:gap-2 xl:px-4 xl:text-sm xl:inline-flex",
              "bg-[var(--color-accent)] text-[#05080F] hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]",
              isPortalActive &&
                "ring-2 ring-[var(--color-accent)]/35 ring-offset-2 ring-offset-[var(--color-bg)]"
            )}
          >
            <Shield className="h-4 w-4 shrink-0" aria-hidden />
            Client Portal
          </Link>

          <button
            type="button"
            className="inline-flex rounded-md p-2 text-[var(--color-text)] transition-colors hover:bg-[var(--color-accent-dim)] hover:text-[var(--color-accent)] xl:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen ? (
          <motion.div
            id="mobile-nav-panel"
            key="mobile-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[var(--color-border)] xl:hidden"
          >
            <div
              className={clsx(
                "max-h-[min(85vh,calc(100dvh-4.25rem))] space-y-1 overflow-y-auto px-4 py-4",
                "bg-[var(--color-surface)]/95 backdrop-blur-md"
              )}
            >
              <NavLink
                href="/"
                active={pathname === "/"}
                className="block w-full justify-start px-4 py-2.5"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </NavLink>

              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                Services
              </div>
              {SERVICES_DROPDOWN.map((item) => {
                const [base, frag] = item.href.split("#");
                const itemHash = frag ? `#${frag}` : "";
                const onBase = pathname === base || pathname.startsWith(`${base}/`);
                const subActive =
                  onBase &&
                  (itemHash === ""
                    ? hash === "" || hash === "#"
                    : hash === itemHash);
                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    active={subActive}
                    className="ml-2 block w-[calc(100%-0.5rem)] justify-start py-2 pl-4 pr-3"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
              <div className="my-2 h-px bg-[var(--color-border)]" />
              <NavLink
                href="/services"
                active={isServicesActive}
                className="block w-full justify-start px-4 py-2.5 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                All Services →
              </NavLink>

              <NavLink
                href="/freight"
                active={linkActive("/freight")}
                className="block w-full justify-start px-4 py-2.5"
                onClick={() => setMobileOpen(false)}
              >
                Alpha Freight
              </NavLink>
              <NavLink
                href="/pricing"
                active={linkActive("/pricing")}
                className="block w-full justify-start px-4 py-2.5"
                onClick={() => setMobileOpen(false)}
              >
                Pricing
              </NavLink>
              <NavLink
                href="/projects"
                active={linkActive("/projects")}
                className="block w-full justify-start px-4 py-2.5"
                onClick={() => setMobileOpen(false)}
              >
                Projects
              </NavLink>
              <NavLink
                href="/apps"
                active={linkActive("/apps")}
                className="block w-full justify-start px-4 py-2.5"
                onClick={() => setMobileOpen(false)}
              >
                Apps
              </NavLink>
              <NavLink
                href="/about"
                active={linkActive("/about")}
                className="block w-full justify-start px-4 py-2.5"
                onClick={() => setMobileOpen(false)}
              >
                About
              </NavLink>
              <NavLink
                href="/contact"
                active={linkActive("/contact")}
                className="block w-full justify-start px-4 py-2.5"
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </NavLink>

              <Link
                href="/portal"
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  "mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold",
                  "bg-[var(--color-accent)] text-[#05080F]"
                )}
              >
                <Shield className="h-4 w-4" aria-hidden />
                Client Portal
              </Link>

              <a
                href="https://wa.me/923494206922"
                target="_blank"
                rel="noopener noreferrer"
                className={clsx(
                  "mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm font-medium",
                  "text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                )}
              >
                <MessageCircle className="h-4 w-4 text-[var(--color-accent)]" aria-hidden />
                WhatsApp
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
