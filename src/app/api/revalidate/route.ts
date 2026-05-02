import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import type { SanityDocument } from "@sanity/types";

type WebhookDoc = SanityDocument & {
  slug?: { current?: string } | string;
};

function slugFromDoc(doc: WebhookDoc): string | undefined {
  if (!doc.slug) return undefined;
  return typeof doc.slug === "string" ? doc.slug : doc.slug.current;
}

function pathsForType(_type: string | undefined, doc: WebhookDoc): string[] {
  const slug = slugFromDoc(doc);
  const paths: string[] = [];

  switch (_type) {
    case "post":
      paths.push("/blog");
      if (slug) paths.push(`/blog/${slug}`);
      break;
    case "project":
      paths.push("/");
      paths.push("/projects");
      if (slug) paths.push(`/projects/${slug}`);
      break;
    case "service":
      paths.push("/");
      if (slug) paths.push(`/services/${slug}`);
      break;
    case "clientProject":
      paths.push("/portal/dashboard");
      break;
    case "app":
      paths.push("/apps");
      if (slug) paths.push(`/apps/${slug}`);
      break;
    case "review":
      paths.push("/reviews");
      break;
    case "teamMember":
      paths.push("/team");
      if (slug) paths.push(`/team/${slug}`);
      break;
    default:
      paths.push("/");
      paths.push("/blog");
      break;
  }

  return Array.from(new Set(paths));
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret?.trim()) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not configured" },
      { status: 500 }
    );
  }

  try {
    const { body, isValidSignature } = await parseBody<WebhookDoc>(
      req,
      secret.trim()
    );

    if (isValidSignature !== true) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    if (!body?._type) {
      return NextResponse.json(
        { message: "Missing document type" },
        { status: 400 }
      );
    }

    const paths = pathsForType(body._type, body);
    for (const p of paths) {
      revalidatePath(p);
    }

    return NextResponse.json({
      revalidated: true,
      paths,
      type: body._type,
    });
  } catch (e) {
    console.error("[revalidate]", e);
    return NextResponse.json(
      { message: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
