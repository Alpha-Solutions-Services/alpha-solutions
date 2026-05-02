import { redirect } from "next/navigation";
import { getPortalUser, portalDisplayName } from "@/lib/portal/auth";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
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
    <div className="flex min-h-[calc(100vh-5rem)] w-full border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <PortalSidebar name={name} email={email} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
