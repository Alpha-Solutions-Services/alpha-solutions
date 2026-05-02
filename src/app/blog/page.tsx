import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import Link from "next/link";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, SITE_URL } from "@/data/site";
import { urlForImage } from "@/lib/sanity/image";
import { getAllPosts } from "@/lib/sanity/queries";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = "Blog";
  const description =
    "Insights on web development, SaaS, AI automation, and digital operations from Alpha Solutions Services LLC.";
  const canonical = `${SITE_URL}/blog`;
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

  return {
    title,
    description,
    keywords: [
      "Alpha Solutions blog",
      "web development blog",
      "SaaS insights",
      "AI automation articles",
      "Utah software company blog",
    ],
    alternates: { canonical: "/blog" },
    openGraph: {
      title: `${title} | Alpha Solutions Services LLC`,
      description,
      url: canonical,
      siteName: "Alpha Solutions Services LLC",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Alpha Solutions Services LLC`,
      description,
      images: [ogImage],
    },
  };
}

type PostCard = {
  _id: string;
  title: string | null;
  slug: { current?: string | null } | null;
  publishedAt: string | null;
  excerpt?: string | null;
  category?: string | null;
  image?: SanityImageSource | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function BlogPage() {
  const posts = await getAllPosts<PostCard>();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] pt-[100px]">
      <header className="border-b border-[var(--color-border)] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
            Insights
          </p>
          <h1
            className="mt-3 text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Blog
          </h1>
          <p className="mt-4 text-lg text-[var(--color-muted)]">
            Practical notes on shipping software, growing products, and running
            lean operations.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-10 text-center text-[var(--color-muted)]">
            No posts yet. Add documents of type{" "}
            <code className="text-[var(--color-text)]">post</code> in Sanity
            Studio, or check{" "}
            <code className="text-[var(--color-text)]">
              NEXT_PUBLIC_SANITY_PROJECT_ID
            </code>
            .
          </p>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const slug = post.slug?.current;
              if (!slug) return null;
              const href = `/blog/${slug}`;
              const imgUrl = urlForImage(post.image, 800);
              const excerpt =
                post.excerpt?.trim() ||
                "Read the full article for details and takeaways.";
              const category = post.category?.trim() || "Blog";

              return (
                <li key={post._id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 transition-colors hover:border-[var(--color-accent)]/40">
                    <Link href={href} className="block shrink-0">
                      <div className="relative aspect-[16/10] bg-[var(--color-surface)]">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={post.title ? `${post.title} cover` : ""}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
                            No cover image
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
                        <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-blue-400">
                          {category}
                        </span>
                        {post.publishedAt ? (
                          <time dateTime={post.publishedAt}>
                            {formatDate(post.publishedAt)}
                          </time>
                        ) : null}
                      </div>
                      <Link href={href}>
                        <h2
                          className="text-lg font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]"
                          style={{
                            fontFamily: "var(--font-display), sans-serif",
                          }}
                        >
                          {post.title || "Untitled"}
                        </h2>
                      </Link>
                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
                        {excerpt}
                      </p>
                      <Link
                        href={href}
                        className="mt-4 inline-flex text-sm font-semibold text-[var(--color-accent)] hover:underline"
                      >
                        Read article →
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
