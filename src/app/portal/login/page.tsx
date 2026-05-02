import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalUser } from "@/lib/portal/auth";
import { isAdminUser } from "@/lib/admin-auth";
import { PortalLoginForm } from "@/components/portal/PortalLoginForm";
import { isPortalAuthConfigured } from "@/lib/supabase/env";

export default async function PortalLoginPage() {
  const user = await getPortalUser();
  if (user) {
    if (isAdminUser(user)) {
      redirect("/admin/dashboard");
    }
    redirect("/portal/dashboard");
  }

  const portalReady = isPortalAuthConfigured();

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
        Client portal
      </h1>
      <p className="mb-8 text-center text-sm text-[var(--color-muted)]">
        Sign in with Google, or use the email and password provided by Alpha
        Solutions.
      </p>
      {!portalReady ? (
        <div
          className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100"
          role="status"
        >
          Client portal sign-in is not active in this environment yet. Set{" "}
          <code className="rounded bg-black/30 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-black/30 px-1 py-0.5 text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          in <code className="text-xs">alpha-solutions/.env.local</code>, then
          restart the dev server.
        </div>
      ) : null}
      {portalReady ? <PortalLoginForm /> : null}
    </div>
  );
}
