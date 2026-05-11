import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ResponsiveDashboardShell } from "@/components/layout/ResponsiveDashboardShell";
import { isAdminUser } from "@/lib/admin-auth";
import { getPortalUser, portalDisplayName } from "@/lib/portal/auth";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getPortalUser();
  if (!user) {
    redirect("/admin/login");
  }
  if (!isAdminUser(user)) {
    redirect("/");
  }

  const email = user.email ?? portalDisplayName(user);

  return (
    <ResponsiveDashboardShell
      mobileTitle="Admin"
      sidebar={(closeMobile) => (
        <AdminSidebar email={email} onNavigate={closeMobile} />
      )}
    >
      {children}
    </ResponsiveDashboardShell>
  );
}
