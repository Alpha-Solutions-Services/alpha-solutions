"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import clsx from "clsx";

const RESOURCES = [
  {
    id: "web-checklist" as const,
    title: "Web Development Project Checklist",
    subtitle: "Essential steps to ensure your web project success",
    bullets: [
      "Project planning guide",
      "Technical requirements checklist",
      "Timeline estimation template",
      "Budget planning worksheet",
    ],
    filePath: "/resources/web-development-project-checklist.txt",
  },
  {
    id: "mobile-calculator" as const,
    title: "Mobile App Cost Calculator",
    subtitle: "Interactive tool to estimate your mobile app development costs",
    bullets: [
      "Platform cost estimation",
      "Feature complexity analysis",
      "Timeline calculator",
      "Budget optimization tips",
    ],
    filePath: "/resources/mobile-app-cost-calculator.xlsx",
  },
  {
    id: "ecommerce-guide" as const,
    title: "10 Must-Have Features for E-commerce Sites",
    subtitle: "Complete guide to essential e-commerce functionality",
    bullets: [
      "Payment gateway integration",
      "Inventory management",
      "SEO optimization checklist",
      "Security best practices",
    ],
    filePath: "/resources/ecommerce-must-have-features.txt",
  },
];

export function FreeResourcesSection() {
  return (
    <section
      className="border-t border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="free-resources-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2
            id="free-resources-heading"
            className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Free Resources &amp; Tools
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--color-muted)]">
            Get instant access to our expert guides and calculators. No credit
            card required.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--color-chrome)]">
            Instant download link sent to you after submission
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {RESOURCES.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-[var(--color-muted)]">
          Join 1,000+ professionals who use our resources to plan successful
          projects
        </p>
      </div>
    </section>
  );
}

function ResourceCard({
  resource,
}: {
  resource: (typeof RESOURCES)[number];
}) {
  const [email, setEmail] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/resource-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), resourceId: resource.id }),
      });
      const payload = (await res.json()) as { downloadUrl?: string };
      setDownloadUrl(payload.downloadUrl || resource.filePath);
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-6 sm:p-8">
      <h3
        className="text-lg font-bold text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {resource.title}
      </h3>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{resource.subtitle}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        What you&apos;ll get:
      </p>
      <ul className="mt-3 flex-1 space-y-2">
        {resource.bullets.map((b) => (
          <li
            key={b}
            className="flex gap-2 text-sm text-[var(--color-muted)]"
          >
            <CheckCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]"
              aria-hidden
            />
            {b}
          </li>
        ))}
      </ul>
      {status === "done" ? (
        <p className="mt-6 rounded-lg border border-[var(--color-border-glow)] bg-[var(--color-accent-dim)] px-4 py-3 text-center text-sm text-[var(--color-text)]">
          Download ready.{" "}
          <a
            href={downloadUrl || resource.filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Open your resource
          </a>
          .
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text)] outline-none ring-offset-[var(--color-bg)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30"
            autoComplete="email"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className={clsx(
              "w-full rounded-lg py-3 text-sm font-semibold transition-opacity",
              "bg-[var(--color-accent)] text-[#05080F] hover:opacity-90",
              status === "loading" && "opacity-70"
            )}
          >
            {status === "loading" ? "Sending…" : "Get Free Resource"}
          </button>
          {status === "error" ? (
            <p className="text-center text-xs text-red-400">
              Something went wrong. Try again or email info@alphasolutions.software
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
