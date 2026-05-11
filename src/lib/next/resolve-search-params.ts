/**
 * Next.js 15+ may pass `searchParams` as a Promise; 14 passes a plain object.
 * Awaiting a non-Promise is safe and returns the value unchanged.
 */
export async function resolveSearchParams<T extends object>(
  input: Promise<T> | T | undefined,
): Promise<T | undefined> {
  if (input == null) return undefined;
  return Promise.resolve(input);
}
