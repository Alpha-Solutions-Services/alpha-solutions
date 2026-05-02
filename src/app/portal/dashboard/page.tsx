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

  return <PortalDashboardClient projects={projects} files={files} />;
}
