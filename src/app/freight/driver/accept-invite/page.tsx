import type { Metadata } from "next";
import { DriverAcceptInviteClient } from "@/components/freight/DriverAcceptInviteClient";

export const metadata: Metadata = {
  title: "Accept driver invite — Alpha Freight",
  robots: { index: false, follow: false },
};

export default function AcceptDriverInvitePage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token?.trim() ?? "";
  return (
    <main className="mx-auto max-w-xl px-4 pb-28 pt-20">
      <DriverAcceptInviteClient token={token} />
    </main>
  );
}
