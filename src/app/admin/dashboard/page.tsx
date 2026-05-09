import dynamic from "next/dynamic";

const AdminDashboardClient = dynamic(
  () =>
    import("@/components/admin/AdminDashboardClient").then(
      (m) => m.AdminDashboardClient
    ),
  { ssr: false }
);

export default function AdminDashboardPage() {
  return <AdminDashboardClient />;
}
