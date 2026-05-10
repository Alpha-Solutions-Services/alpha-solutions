import type { Metadata } from "next";
import FreightStudentEnroll from "@/components/freight/FreightStudentEnroll";

export const metadata: Metadata = {
  title: "Enroll — Alpha Freight Academy",
  description:
    "Choose monthly or lifetime access, create your academy login, and complete Stripe checkout.",
};

export default function StudentEnrollPage({
  searchParams,
}: {
  searchParams?: { reason?: string };
}) {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <FreightStudentEnroll initialReason={searchParams?.reason} />
    </main>
  );
}
