import type { Metadata } from "next";
import { InviteDriverModal } from "@/components/freight/InviteDriverModal";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Driver invitations — Dispatcher",
};

export default async function DispatcherDriversPage() {
  const sb = await createClient();
  let carriers: { id: string; company_name: string | null; full_name: string | null }[] = [];

  if (sb) {
    const { data } = await sb
      .from("profiles")
      .select("id,company_name,full_name")
      .eq("role", "carrier")
      .eq("carrier_status", "verified")
      .order("company_name", { ascending: true });
    carriers = ((data ?? []) as typeof carriers);
  }

  return (
    <main className="min-h-[70vh] bg-[var(--color-bg)] px-4 pb-24 pt-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-8">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
              Driver invitations
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Select a verified tenant before emailing mobile credentials links.
            </p>
          </div>
          <InviteDriverModal mode="dispatcher" carriers={carriers} />
        </div>
        <p className="mt-8 text-xs text-[var(--color-muted)]">
          Driver responses appear on their carrier timelines — automate via Supabase Realtime subscriptions when ready.
        </p>
      </div>
    </main>
  );
}
