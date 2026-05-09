import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getPortalUser } from "@/lib/portal/auth";
import { fetchPortalDashboardData } from "@/lib/sanity/portal-data";
import { PortalDashboardClient } from "@/components/portal/PortalDashboardClient";

export default async function PortalDashboardPage() {
  const user = await getPortalUser();
  if (!user) {
    redirect("/portal/login");
  }

  const { projects, files } = await fetchPortalDashboardData(user.id);

  return (
    <Suspense
      fallback={
        <div className="min-w-0 flex-1 p-6 md:p-8">
          <div className="h-28 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/25" />
        </div>
      }
    >
      <PortalDashboardClient projects={projects} files={files} />
    </Suspense>
  );
}
