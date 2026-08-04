import type { SanityImageSource } from "@sanity/image-url";
import { urlForImage } from "@/lib/sanity/image";

export type TeamSocialLink = {
  platform: string;
  url: string;
};

export type HomeTeamMember = {
  _id: string;
  name: string;
  position: string;
  bio: string;
  image: string | null;
  email: string | null;
  phone: string | null;
  socialLinks: TeamSocialLink[];
  skills: string[];
};

export type SanityTeamMemberDoc = {
  _id?: string;
  name?: string | null;
  position?: string | null;
  role?: string | null;
  bio?: string | null;
  profileImage?: SanityImageSource | null;
  email?: string | null;
  phone?: string | null;
  socialLinks?: Array<{
    platform?: string | null;
    url?: string | null;
  } | null> | null;
  skills?: Array<string | null> | null;
};

export function mapTeamMembersForAbout(
  raw: SanityTeamMemberDoc[]
): HomeTeamMember[] {
  return raw
    .filter((m) => m._id && m.name && !String(m._id).startsWith("drafts."))
    .map((m) => {
      const socialLinks = (m.socialLinks ?? [])
        .filter((s): s is { platform?: string | null; url?: string | null } =>
          Boolean(s?.url)
        )
        .map((s) => ({
          platform: (s.platform ?? "Link").trim() || "Link",
          url: String(s.url).trim(),
        }));

      const skills = (m.skills ?? [])
        .map((s) => (s ?? "").trim())
        .filter(Boolean);

      return {
        _id: String(m._id),
        name: String(m.name).trim(),
        position:
          (m.position ?? m.role ?? "Team").trim() || "Team",
        bio: (m.bio ?? "").trim(),
        image: urlForImage(m.profileImage, 256),
        email: (m.email ?? "").trim() || null,
        phone: (m.phone ?? "").trim() || null,
        socialLinks,
        skills,
      };
    });
}
