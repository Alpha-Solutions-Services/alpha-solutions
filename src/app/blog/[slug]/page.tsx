import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostBody } from "@/components/blog/BlogPostBody";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/data/site";
import { urlForImage } from "@/lib/sanity/image";
import { getAllPosts, getPostBySlug } from "@/lib/sanity/queries";

export const revalidate = 3600;

type BlogPostDoc = {
  _id: string;
  title: string | null;
  slug: { current?: string | null } | null;
  publishedAt: string | null;
  image?: SanityImageSource | null;
  body?: PortableTextBlock[] | null;
  excerpt?: string | null;
  category?: string | null;
  _updatedAt?: string | null;
};

type PostSlugRow = { slug: { current?: string | null } | null };

function formatDate(iso: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export async function generateStaticParams() {
  const posts = await getAllPosts<PostSlugRow>();
  return posts
    .map((p) => p.slug?.current)
    .filter((s): s is string => Boolean(s))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug<BlogPostDoc>(params.slug);
  if (!post?.title) {
    return { title: "Post | Alpha Solutions Services LLC" };
  }

  const title = post.title;
  const description =
    post.excerpt?.trim().slice(0, 160) ||
    `Read "${title}" on the ${SITE_NAME} blog.`;
  const canonical = `${SITE_URL}/blog/${params.slug}`;
  const ogFromImage = urlForImage(post.image, 1200);
  const ogImage = ogFromImage ?? absoluteUrl("/alpha-logo.png");

  return {
    title,
    description,
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post._updatedAt ?? undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  };
}

function blogPostingJsonLd(post: BlogPostDoc, slug: string) {
  const url = `${SITE_URL}/blog/${slug}`;
  const imageUrl = urlForImage(post.image, 1200) ?? absoluteUrl("/alpha-logo.png");
  const published = post.publishedAt ?? undefined;
  const modified = post._updatedAt ?? post.publishedAt ?? undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt?.slice(0, 300) || undefined,
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    image: [imageUrl],
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/alpha-logo.png"),
      },
    },
    url,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug<BlogPostDoc>(params.slug);
  if (!post?.slug?.current || !post.title) {
    notFound();
  }

  const jsonLd = blogPostingJsonLd(post, params.slug);
  const hero = urlForImage(post.image, 1400);
  const category = post.category?.trim() || "Blog";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="min-h-screen bg-[var(--color-bg)] pt-[100px]">
        <header className="border-b border-[var(--color-border)] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <nav
              className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-[var(--color-accent)]">
                Home
              </Link>
              <span aria-hidden>/</span>
              <Link href="/blog" className="hover:text-[var(--color-accent)]">
                Blog
              </Link>
              <span aria-hidden>/</span>
              <span className="text-[var(--color-text)] line-clamp-1">
                {post.title}
              </span>
            </nav>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted)]">
              <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-400">
                {category}
              </span>
              {post.publishedAt ? (
                <time dateTime={post.publishedAt}>
                  {formatDate(post.publishedAt)}
                </time>
              ) : null}
            </div>
            <h1
              className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-6 text-lg leading-relaxed text-[var(--color-muted)]">
                {post.excerpt}
              </p>
            ) : null}
          </div>
        </header>

        {hero ? (
          <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-[var(--color-border)]">
              <Image
                src={hero}
                alt={post.title ?? "Article cover"}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          </div>
        ) : null}

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <BlogPostBody value={post.body ?? []} />
          <div className="mt-16 border-t border-[var(--color-border)] pt-10">
            <Link
              href="/blog"
              className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
            >
              ← Back to blog
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
