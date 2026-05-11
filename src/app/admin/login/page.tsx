import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { ADMIN_LOGIN_HINT_EMAILS } from "@/lib/admin-allowlist";
import { isAdminUser } from "@/lib/admin-auth";
import { getPortalUser } from "@/lib/portal/auth";
import { isPortalAuthConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const user = await getPortalUser();
  if (user && isAdminUser(user)) {
    redirect("/admin/dashboard");
  }

  const ready = isPortalAuthConfigured();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 md:py-24">
      <Link
        href="/"
        className="mb-8 flex justify-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      >
        <Image
          src="/alpha-logo.png"
          alt="Alpha Solutions Services LLC"
          width={64}
          height={64}
          className="h-16 w-16 rounded-2xl object-cover ring-1 ring-[var(--color-border)]"
          priority
        />
      </Link>
      <h1
        className="mb-2 text-center text-2xl font-bold text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        Admin console
      </h1>
      <p className="mb-2 text-center text-sm text-[var(--color-muted)]">
        Only approved admins can sign in. Allowed:{" "}
        <span className="font-medium text-[var(--color-text)]">
          {ADMIN_LOGIN_HINT_EMAILS.join(" · ")}
        </span>
      </p>
      {!ready ? (
        <p
          className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100"
          role="status"
        >
          Configure Supabase env vars first (same as client portal).
        </p>
      ) : null}
      {ready ? <AdminLoginForm /> : null}
    </div>
  );
}
