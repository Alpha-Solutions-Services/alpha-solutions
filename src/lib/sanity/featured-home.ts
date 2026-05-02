import type { SanityImageSource } from "@sanity/image-url";
import { urlForImage } from "@/lib/sanity/image";

export type HomeFeaturedProject = {
  _id: string;
  title: string;
  client: string;
  category: string;
  image: string | null;
  description: string;
  href: string;
};

export type FeaturedSanityDoc = {
  _id?: string;
  title?: string | null;
  client?: string | null;
  description?: string | null;
  category?: string | null;
  featuredImage?: SanityImageSource | null;
  projectUrl?: string | null;
  slug?: { current?: string | null } | null;
};

export function mapFeaturedProjectsForHome(
  raw: FeaturedSanityDoc[]
): HomeFeaturedProject[] {
  return raw
    .filter((p) => p._id && p.title)
    .map((p) => {
      const slug = p.slug?.current;
      const href =
        p.projectUrl && p.projectUrl !== "#"
          ? p.projectUrl
          : slug
            ? `/projects#${slug}`
            : "/projects";
      const desc = (p.description ?? "").trim();
      return {
        _id: String(p._id),
        title: String(p.title),
        client: (p.client ?? "Client").trim() || "Client",
        category: (p.category ?? "Project").trim() || "Project",
        image: urlForImage(p.featuredImage, 960),
        description:
          desc.length > 220 ? `${desc.slice(0, 217).trimEnd()}…` : desc,
        href,
      };
    });
}
