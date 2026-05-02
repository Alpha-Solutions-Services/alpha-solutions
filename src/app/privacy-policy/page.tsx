import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Alpha Solutions Services LLC",
  description:
    "Privacy Policy for Alpha Solutions Services LLC covering data handling, contact forms, analytics, and communication channels.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Effective date: May 2, 2026
      </p>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-[var(--color-muted)]">
        <p>
          Alpha Solutions Services LLC collects only the information needed to
          respond to inquiries, deliver services, and maintain client support.
        </p>
        <p>
          We may collect contact details (name, email, phone), project
          requirements, and service preferences submitted through forms or direct
          communication channels.
        </p>
        <p>
          We use analytics tools to understand website usage and improve
          performance. We do not sell personal data.
        </p>
        <p>
          To request data updates or deletion, contact{" "}
          <a
            href="mailto:info@alphasolutions.software"
            className="text-[var(--color-accent)] hover:underline"
          >
            info@alphasolutions.software
          </a>
          .
        </p>
      </div>
    </main>
  );
}
