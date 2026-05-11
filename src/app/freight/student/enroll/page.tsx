import type { Metadata } from "next";
import FreightStudentEnroll from "@/components/freight/FreightStudentEnroll";
import { resolveSearchParams } from "@/lib/next/resolve-search-params";

export const metadata: Metadata = {
  title: "Enroll — Alpha Freight Academy",
  description:
    "Choose monthly or lifetime access, create your academy login, and complete Stripe checkout.",
};

export default async function StudentEnrollPage({
  searchParams,
}: {
  searchParams?: Promise<{ reason?: string }> | { reason?: string };
}) {
  const sp = await resolveSearchParams(searchParams);
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <FreightStudentEnroll initialReason={sp?.reason} />
    </main>
  );
}
