import { redirect } from "next/navigation";
import { getPortalUser, portalDisplayName } from "@/lib/portal/auth";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { ResponsiveDashboardShell } from "@/components/layout/ResponsiveDashboardShell";
import { isAdminUser } from "@/lib/admin-auth";

export default async function PortalDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getPortalUser();
  if (!user) {
    redirect("/portal/login");
  }
  if (isAdminUser(user)) {
    redirect("/admin/dashboard");
  }

  const name = portalDisplayName(user);
  const email = user.email ?? "";

  return (
    <ResponsiveDashboardShell
      mobileTitle="Client portal"
      sidebar={(closeMobile) => (
        <PortalSidebar name={name} email={email} onNavigate={closeMobile} />
      )}
    >
      {children}
    </ResponsiveDashboardShell>
  );
}
