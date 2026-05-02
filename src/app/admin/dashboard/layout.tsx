import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
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
    <div className="flex min-h-[calc(100vh-5rem)] w-full border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <AdminSidebar email={email} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
