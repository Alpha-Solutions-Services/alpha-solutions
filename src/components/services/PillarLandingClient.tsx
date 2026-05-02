"use client";

import * as Accordion from "@radix-ui/react-accordion";
import clsx from "clsx";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { PillarFaq } from "@/lib/pillar-landing";
import { serviceCardDescription } from "@/lib/service-card-utils";
import type { Service } from "@/data/services";

function StatusBadge({ service }: { service: Service }) {
  if (service.status === "new") {
    return (
      <span className="rounded bg-[var(--color-accent-dim)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
        New
      </span>
    );
  }
  if (service.status === "soon") {
    return (
      <span className="rounded border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
        Soon
      </span>
    );
  }
  return null;
}

export function PillarServiceGrid({ services }: { services: Service[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <Link
          key={service.slug}
          href={`/services/${service.slug}`}
          className={clsx(
            "group relative flex flex-col rounded-xl border border-[var(--color-border)]",
            "bg-[var(--color-surface)]/40 p-5 transition-colors",
            "hover:border-[var(--color-accent)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3
              className="text-lg font-bold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              {service.name}
            </h3>
            <StatusBadge service={service} />
          </div>
          <p className="mt-2 text-sm font-semibold text-[var(--color-accent)]">
            {service.price}
          </p>
          <p
            className={clsx(
              "mt-3 text-sm leading-relaxed text-[var(--color-muted)]",
              "max-lg:mt-4",
              "lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-300",
              "lg:group-hover:max-h-48 lg:group-hover:opacity-100 lg:group-focus-visible:max-h-48 lg:group-focus-visible:opacity-100"
            )}
          >
            {serviceCardDescription(service)}
          </p>
          <span className="mt-4 text-xs font-semibold text-[var(--color-accent)] lg:mt-auto lg:pt-4">
            View details →
          </span>
        </Link>
      ))}
    </div>
  );
}

export function PillarFAQ({ faqs }: { faqs: PillarFaq[] }) {
  return (
    <Accordion.Root type="single" collapsible className="space-y-2">
      {faqs.map((item, i) => (
        <Accordion.Item
          key={item.question}
          value={`item-${i}`}
          className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/30"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-accent-dim)]/50 data-[state=open]:text-[var(--color-accent)]">
              {item.question}
              <ChevronDown
                className="h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden">
            <div className="border-t border-[var(--color-border)] px-4 pb-4 pt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {item.answer}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
