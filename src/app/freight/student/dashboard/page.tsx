import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Student Dashboard — Alpha Freight",
  description:
    "Lessons, quizzes, drills, and your practice board — centralized for enrolled students.",
};

export default function StudentDashboardPage({
  searchParams,
}: {
  searchParams?: { welcome?: string };
}) {
  return (
    <main className="min-h-[70vh] bg-[var(--color-bg)] px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {searchParams?.welcome ? (
          <p className="mb-10 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Enrollment successful — bookmark this dashboard while we roll out sequential modules inside your Supabase-connected workspace.
          </p>
        ) : null}
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-10">
          <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            Academy studio
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Lesson releases, quizzes, and load-board drills plug in here. Connect your Supabase
            academy tables to hydrate progress bars and completion states.
          </p>
          <ul className="mt-10 space-y-3 text-sm text-[var(--color-text)]">
            <li>• Module pacing + downloadable SOP snippets</li>
            <li>• Scenario quizzes with remediation paths</li>
            <li>• Practice dispatcher queue (Mapbox overlays optional)</li>
          </ul>
          <Link
            href="/freight/student"
            className="mt-12 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]"
          >
            ← Syllabus preview
          </Link>
        </div>
      </div>
    </main>
  );
}
