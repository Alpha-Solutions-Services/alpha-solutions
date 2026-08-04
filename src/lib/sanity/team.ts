import type { SanityImageSource } from "@sanity/image-url";
import { urlForImage } from "@/lib/sanity/image";

export type HomeTeamMember = {
  _id: string;
  name: string;
  position: string;
  bio: string;
  image: string | null;
};

export type SanityTeamMemberDoc = {
  _id?: string;
  name?: string | null;
  position?: string | null;
  bio?: string | null;
  profileImage?: SanityImageSource | null;
};

export function mapTeamMembersForAbout(
  raw: SanityTeamMemberDoc[]
): HomeTeamMember[] {
  return raw
    .filter((m) => m._id && m.name)
    .map((m) => ({
      _id: String(m._id),
      name: String(m.name).trim(),
      position: (m.position ?? "Team").trim() || "Team",
      bio: (m.bio ?? "").trim(),
      image: urlForImage(m.profileImage, 256),
    }));
}
