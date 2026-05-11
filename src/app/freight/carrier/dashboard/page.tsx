import type { Metadata } from "next";
import { InviteDriverModal } from "@/components/freight/InviteDriverModal";
import { DriverInvitationList } from "@/components/freight/DriverInvitationList";

export const metadata: Metadata = {
  title: "Carrier Dashboard — Alpha Freight",
  description:
    "Manage drivers, outbound invites, lane briefs — extend with live board data from Supabase.",
};

export default function CarrierDashboardPage() {
  return (
    <main className="min-h-[70vh] bg-[var(--color-bg)] px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
              Verified carrier cockpit
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Invite drivers privately — onboarding links expire seven days after send.
            </p>
          </div>
          <InviteDriverModal mode="carrier" />
        </div>
        <DriverInvitationList />
      </div>
    </main>
  );
}
