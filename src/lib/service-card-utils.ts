/** Short blurb for service cards when CMS/local description is empty. */
export function serviceCardDescription(service: {
  name: string;
  price: string;
  description: string;
}): string {
  const d = service.description?.trim();
  if (d) return d;
  return `${service.name} — scoped delivery with clear milestones. Typical entry: ${service.price}.`;
}
