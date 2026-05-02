"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ADMIN_LOGIN_HINT_EMAILS, isAllowedAdminEmail } from "@/lib/admin-allowlist";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      setError("Admin sign-in is not configured yet.");
      return;
    }
    const { error: signError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signError) {
      setLoading(false);
      setError(signError.message);
      return;
    }
    const { data } = await supabase.auth.getUser();
    const signedInEmail = data.user?.email ?? email.trim();
    if (!isAllowedAdminEmail(signedInEmail)) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("This account is not allowed to access admin.");
      return;
    }
    setLoading(false);
    router.push("/admin/dashboard");
    router.refresh();
  }

  async function signInWithGoogle() {
    setError(null);
    setGoogleLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setGoogleLoading(false);
      setError("Google sign-in is not configured yet.");
      return;
    }
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/admin/dashboard")}`,
      },
    });
    setGoogleLoading(false);
    if (oauthError) {
      setError(oauthError.message);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-8"
    >
      <button
        type="button"
        onClick={() => void signInWithGoogle()}
        disabled={loading || googleLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
      >
        <GoogleGlyph className="h-5 w-5 shrink-0" />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>
      <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        or sign in with password
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>
      <div>
        <label
          htmlFor="admin-email"
          className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
        >
          Email
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] outline-none ring-[var(--color-accent)] focus:ring-2"
        />
      </div>
      <div>
        <label
          htmlFor="admin-password"
          className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] outline-none ring-[var(--color-accent)] focus:ring-2"
        />
      </div>
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading || googleLoading}
        className="w-full rounded-lg bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in to admin"}
      </button>
      <p className="text-center text-xs text-[var(--color-muted)]">
        Allowed admin accounts: {ADMIN_LOGIN_HINT_EMAILS.join(" · ")}
      </p>
      <p className="text-center text-sm text-[var(--color-muted)]">
        <Link href="/" className="text-[var(--color-accent)] hover:underline">
          ← Back to site
        </Link>
      </p>
    </form>
  );
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.1-.9 2.1-1.9 2.7l3 2.3c1.7-1.6 2.7-4 2.7-6.8 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3-2.3c-.9.6-2 1-3.6 1-2.8 0-5.1-1.9-6-4.4l-3.1 2.4C4.9 19.9 8.2 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6 13.7c-.2-.6-.4-1.2-.4-1.9s.1-1.3.4-1.9L2.9 7.5C1.7 9.4 1 11.6 1 14s.7 4.6 1.9 6.5l3.1-2.4z"
      />
      <path
        fill="#4285F4"
        d="M12 5.8c1.6 0 3 .5 4.1 1.5l3.1-3.1C16.9 2.5 14.7 1.5 12 1.5 8.2 1.5 4.9 3.6 2.9 7.5l3.1 2.4c.9-2.5 3.2-4.4 6-4.4z"
      />
    </svg>
  );
}
