import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { urlForImage } from "@/lib/sanity/image";

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1
        className="mt-10 scroll-mt-24 text-3xl font-bold text-[var(--color-text)] first:mt-0"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className="mt-10 scroll-mt-24 text-2xl font-bold text-[var(--color-text)] first:mt-0"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 text-xl font-bold text-[var(--color-text)]">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-[var(--color-accent)] pl-4 text-[var(--color-muted)] italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="my-4 leading-relaxed text-[var(--color-muted)]">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 list-outside space-y-2 pl-6 text-[var(--color-muted)] marker:text-[var(--color-accent)] [list-style-type:disc]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 list-outside space-y-2 pl-6 text-[var(--color-muted)] marker:text-[var(--color-accent)] [list-style-type:decimal]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="leading-relaxed [&>p]:my-1">{children}</li>
    ),
    number: ({ children }) => (
      <li className="leading-relaxed [&>p]:my-1">{children}</li>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = /^https?:\/\//.test(href);
      if (external) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          href={href}
          className="font-medium text-[var(--color-accent)] underline-offset-2 hover:underline"
        >
          {children}
        </Link>
      );
    },
    strong: ({ children }) => (
      <strong className="font-semibold text-[var(--color-text)]">{children}</strong>
    ),
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-sm text-[var(--color-accent)]">
        {children}
      </code>
    ),
  },
  types: {
    image: ({ value }) => {
      const src = urlForImage(value, 900);
      if (!src) return null;
      const alt = value?.alt || "";
      return (
        <figure className="my-8">
          <Image
            src={src}
            alt={alt}
            width={900}
            height={506}
            className="h-auto w-full rounded-xl border border-[var(--color-border)] object-cover"
          />
          {value?.caption ? (
            <figcaption className="mt-2 text-center text-sm text-[var(--color-muted)]">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function BlogPostBody({ value }: { value: PortableTextBlock[] }) {
  if (!value?.length) {
    return (
      <p className="text-[var(--color-muted)]">
        This post does not have any content yet.
      </p>
    );
  }

  return <PortableText value={value} components={components} />;
}
