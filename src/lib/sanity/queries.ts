import { createClient } from "./client";

// ─── Blog (post) ───────────────────────────────────────────────────────────

const POST_LIST = `*[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  slug,
  publishedAt,
  "image": coalesce(image, mainImage, coverImage),
  "excerpt": coalesce(pt::text(body), "")[0..199],
  "category": coalesce(category, "Blog"),
  _createdAt,
  _updatedAt
}`;

const POST_BY_SLUG = `*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
  _id,
  title,
  slug,
  publishedAt,
  "image": coalesce(image, mainImage, coverImage),
  body,
  "excerpt": coalesce(pt::text(body), "")[0..279],
  "category": coalesce(category, "Blog"),
  _createdAt,
  _updatedAt
}`;

/** All posts for blog listing (title, excerpt, category, etc.). */
export async function getAllPosts<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(POST_LIST);
  } catch (e) {
    console.error("[sanity] getAllPosts:", e);
    return [];
  }
}

/** Single post by slug (includes portable text body). */
export async function getPostBySlug<T = unknown>(
  slug: string
): Promise<T | null> {
  const client = createClient();
  if (!client) return null;
  try {
    return await client.fetch<T | null>(POST_BY_SLUG, { slug });
  } catch (e) {
    console.error("[sanity] getPostBySlug:", e);
    return null;
  }
}

// ─── Portfolio (project) ───────────────────────────────────────────────────

const PROJECT_LIST = `*[_type == "project"] | order(featured desc, order asc, _createdAt desc) {
  _id,
  title,
  slug,
  client,
  description,
  featuredImage,
  projectUrl,
  category,
  featured,
  order,
  technologies,
  status,
  startDate,
  endDate,
  body,
  _createdAt,
  _updatedAt
}`;

const FEATURED_PROJECTS = `*[_type == "project" && featured == true] | order(order asc, _createdAt desc) [0...12] {
  _id,
  title,
  slug,
  client,
  description,
  featuredImage,
  projectUrl,
  category,
  featured,
  order,
  technologies,
  status,
  startDate,
  endDate,
  body,
  _createdAt,
  _updatedAt
}`;

/** All projects (portfolio). */
export async function getAllProjects<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(PROJECT_LIST);
  } catch (e) {
    console.error("[sanity] getAllProjects:", e);
    return [];
  }
}

/** Featured projects for homepage / highlights. */
export async function getFeaturedProjects<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(FEATURED_PROJECTS);
  } catch (e) {
    console.error("[sanity] getFeaturedProjects:", e);
    return [];
  }
}

const PROJECT_BY_SLUG = `*[_type == "project" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  client,
  description,
  featuredImage,
  projectUrl,
  technologies,
  status,
  startDate,
  endDate,
  body,
  _createdAt,
  _updatedAt
}`;

export async function getProjectBySlug<T = unknown>(
  slug: string
): Promise<T | null> {
  const client = createClient();
  if (!client) return null;
  try {
    return await client.fetch<T | null>(PROJECT_BY_SLUG, { slug });
  } catch (e) {
    console.error("[sanity] getProjectBySlug:", e);
    return null;
  }
}

// ─── Client portal ─────────────────────────────────────────────────────────

const CLIENT_PROJECTS = `*[_type == "clientProject" && clientId == $clientId] | order(_createdAt desc) {
  _id,
  title,
  slug,
  client,
  clientId,
  description,
  featuredImage,
  projectUrl,
  technologies,
  status,
  startDate,
  endDate,
  progress,
  milestones[] {
    _key,
    name,
    status,
    dueDate
  },
  team,
  body,
  recentUpdates[] {
    date,
    message,
    author
  },
  _createdAt,
  _updatedAt
}`;

export async function getClientProjects<T = unknown>(
  userId: string
): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(CLIENT_PROJECTS, { clientId: userId });
  } catch (e) {
    console.error("[sanity] getClientProjects:", e);
    return [];
  }
}

// ─── Team ──────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = `*[_type == "teamMember"] | order(order asc) {
  _id,
  name,
  slug,
  position,
  bio,
  profileImage,
  email,
  phone,
  socialLinks,
  skills,
  startDate,
  isActive,
  order,
  _createdAt,
  _updatedAt
}`;

const TEAM_MEMBER_BY_SLUG = `*[_type == "teamMember" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  position,
  bio,
  profileImage,
  email,
  phone,
  socialLinks,
  skills,
  startDate,
  isActive,
  order,
  _createdAt,
  _updatedAt
}`;

export async function getTeamMembers<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(TEAM_MEMBERS);
  } catch (e) {
    console.error("[sanity] getTeamMembers:", e);
    return [];
  }
}

export async function getTeamMemberBySlug<T = unknown>(
  slug: string
): Promise<T | null> {
  const client = createClient();
  if (!client) return null;
  try {
    return await client.fetch<T | null>(TEAM_MEMBER_BY_SLUG, { slug });
  } catch (e) {
    console.error("[sanity] getTeamMemberBySlug:", e);
    return null;
  }
}

// ─── Services (CMS) ─────────────────────────────────────────────────────────

const SERVICES_ALL = `*[_type == "service"] | order(order asc) {
  _id,
  title,
  slug,
  description,
  icon,
  featuredImage,
  details,
  keyFeatures[] {
    feature,
    description
  },
  pricing,
  timeline,
  technologies,
  showInHomepage,
  order,
  _createdAt,
  _updatedAt
}`;

const SERVICE_BY_SLUG = `*[_type == "service" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  icon,
  featuredImage,
  details,
  keyFeatures[] {
    feature,
    description
  },
  pricing,
  timeline,
  technologies,
  showInHomepage,
  order,
  _createdAt,
  _updatedAt
}`;

export async function getServices<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(SERVICES_ALL);
  } catch (e) {
    console.error("[sanity] getServices:", e);
    return [];
  }
}

export async function getServiceBySlug<T = unknown>(
  slug: string
): Promise<T | null> {
  const client = createClient();
  if (!client) return null;
  try {
    return await client.fetch<T | null>(SERVICE_BY_SLUG, { slug });
  } catch (e) {
    console.error("[sanity] getServiceBySlug:", e);
    return null;
  }
}

// ─── Apps ──────────────────────────────────────────────────────────────────

const APPS_ALL = `*[_type == "app"] | order(_createdAt desc) {
  _id,
  name,
  slug,
  description,
  category,
  version,
  rating,
  downloads,
  features,
  screenshots,
  downloadLink,
  githubUrl,
  listingStatus,
  price,
  platform,
  releaseDate,
  body,
  _createdAt,
  _updatedAt
}`;

const APP_BY_SLUG = `*[_type == "app" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  description,
  category,
  version,
  rating,
  downloads,
  features,
  screenshots,
  downloadLink,
  githubUrl,
  listingStatus,
  price,
  platform,
  releaseDate,
  body,
  _createdAt,
  _updatedAt
}`;

export async function getApps<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(APPS_ALL);
  } catch (e) {
    console.error("[sanity] getApps:", e);
    return [];
  }
}

export async function getAppBySlug<T = unknown>(
  slug: string
): Promise<T | null> {
  const client = createClient();
  if (!client) return null;
  try {
    return await client.fetch<T | null>(APP_BY_SLUG, { slug });
  } catch (e) {
    console.error("[sanity] getAppBySlug:", e);
    return null;
  }
}

// ─── Reviews ───────────────────────────────────────────────────────────────

const REVIEWS = `*[_type == "review"] | order(coalesce(featured, verified) desc, order asc, _createdAt desc) {
  _id,
  clientName: coalesce(clientName, name),
  companyName,
  rating,
  reviewText: coalesce(reviewText, content),
  clientImage,
  featured: coalesce(featured, verified, false),
  approved,
  createdAt: coalesce(createdAt, _createdAt),
  project-> {
    title,
    slug
  },
  app-> {
    name,
    slug
  },
  _createdAt,
  _updatedAt
}`;

const REVIEWS_ALL = `*[_type == "review"] | order(coalesce(featured, verified) desc, order asc, _createdAt desc) {
  _id,
  clientName: coalesce(clientName, name),
  companyName,
  rating,
  reviewText: coalesce(reviewText, content),
  clientImage,
  featured: coalesce(featured, verified, false),
  approved,
  createdAt: coalesce(createdAt, _createdAt),
  _createdAt,
  _updatedAt
}`;

export async function getReviews<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(REVIEWS);
  } catch (e) {
    console.error("[sanity] getReviews:", e);
    return [];
  }
}

export async function getAllReviews<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(REVIEWS_ALL);
  } catch (e) {
    console.error("[sanity] getAllReviews:", e);
    return [];
  }
}

// ─── File uploads & communications ─────────────────────────────────────────

const FILE_UPLOADS = `*[_type == "fileUpload"] | order(coalesce(uploadedAt, uploadDate) desc) {
  _id,
  clientId,
  project->{
    _id,
    title,
    clientId
  },
  fileName,
  file,
  fileSize,
  fileType,
  mimeType,
  uploadedBy,
  projectId,
  downloadUrl,
  "uploadedAt": coalesce(uploadedAt, uploadDate),
  _createdAt,
  _updatedAt
}`;

export async function getFileUploads<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(FILE_UPLOADS);
  } catch (e) {
    console.error("[sanity] getFileUploads:", e);
    return [];
  }
}

const CLIENT_COMMUNICATIONS = `*[_type == "clientCommunication" && clientId == $clientId] | order(timestamp desc) {
  _id,
  sender,
  clientId,
  senderId,
  recipientId,
  message,
  timestamp,
  project->{
    _id,
    title,
    clientId
  },
  projectId,
  read,
  replyTo,
  communicationType,
  metadata,
  _createdAt,
  _updatedAt
}`;

export async function getClientCommunications<T = unknown>(
  clientId: string
): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(CLIENT_COMMUNICATIONS, { clientId });
  } catch (e) {
    console.error("[sanity] getClientCommunications:", e);
    return [];
  }
}

// ─── Dynamic services ─────────────────────────────────────────────────────

const DYNAMIC_SERVICES = `*[_type == "dynamicService"] | order(order asc, _createdAt asc) {
  _id,
  title,
  description,
  keyFeatures,
  technologies,
  ctaLink,
  order,
  _createdAt,
  _updatedAt
}`;

export async function getDynamicServices<T = unknown>(): Promise<T[]> {
  const client = createClient();
  if (!client) return [];
  try {
    return await client.fetch<T[]>(DYNAMIC_SERVICES);
  } catch (e) {
    console.error("[sanity] getDynamicServices:", e);
    return [];
  }
}

/** @deprecated Use {@link getAllPosts} — alias for backwards compatibility. */
export async function getPosts<T = unknown>(): Promise<T[]> {
  return getAllPosts<T>();
}
