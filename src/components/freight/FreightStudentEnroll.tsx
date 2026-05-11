"use client";

import { Elements, CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const stripePromise =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.trim())
    : null;

type Plan = "lifetime" | "monthly";

const lifetimeFeatures = [
  "All 10 lessons · All quizzes",
  "Practice load board simulator",
  "Community access · Certificate paths",
  "Priority onboarding support",
];

const monthlyFeatures = [
  "Rolling access to academy modules",
  "Quizzes plus practice drills",
  "Business-day email support",
];

function InnerPaymentCard({
  plan,
  email,
  name,
  password,
}: {
  plan: Plan;
  email: string;
  name: string;
  password?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);
  const [brand, setBrand] = useState<string>("unknown");

  const brandLabel = useMemo(() => {
    switch (brand) {
      case "visa":
        return "VISA";
      case "mastercard":
        return "MASTERCARD";
      case "amex":
        return "AMEX";
      case "discover":
        return "DISCOVER";
      case "jcb":
        return "JCB";
      case "diners":
        return "DINERS";
      case "unionpay":
        return "UNIONPAY";
      default:
        return "CARD";
    }
  }, [brand]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !cardReady) return;
    setBusy(true);
    setErr(null);
    try {
      const create = await fetch("/api/freight/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email, name }),
      });
      const payload = await create.json();
      if (!create.ok) throw new Error(payload.error || "Could not initialise payment");

      const clientSecret = payload.clientSecret as string;
      const customerId = payload.customerId as string;
      const subscriptionId = payload.subscriptionId as string | null | undefined;
      const paymentIntentIdFromPayload = payload.paymentIntentId as string | null | undefined;
      const cardEl = elements.getElement(CardElement);
      if (!cardEl || !customerId) throw new Error("Checkout configuration error");

      const { error: payErr, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: cardEl, billing_details: { name } } },
      );
      if (payErr) throw new Error(payErr.message || "Payment failed");
      const piId = paymentIntent?.id ?? paymentIntentIdFromPayload ?? null;

      const done = await fetch(
        password ? "/api/freight/complete-enrollment" : "/api/freight/complete-enrollment-existing",
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          name,
          email,
          ...(password ? { password } : {}),
          customerId,
          subscriptionId: subscriptionId ?? null,
          paymentIntentId: piId,
        }),
        },
      );
      const bodyJson = await done.json();
      if (!done.ok || !bodyJson.success)
        throw new Error(bodyJson.error || "Enrollment finalisation failed");

      if (password) {
        const supabase = createClient();
        if (supabase) await supabase.auth.signInWithPassword({ email, password });
      }

      router.replace("/freight/student/dashboard?welcome=1");
      router.refresh();
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Unexpected error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {err ? <p className="text-sm text-red-200">{err}</p> : null}
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
        {plan === "lifetime"
          ? "Lifetime access — billed once via Stripe Elements"
          : "Monthly academy subscription"}
      </p>
      <label className="text-xs font-medium text-[var(--color-muted)]">Card details</label>
      <div className="w-full overflow-hidden pb-3">
        <div className="mx-auto flex max-w-full justify-center">
          <div className="group h-[210px] w-[330px] max-w-full [perspective:1000px] [transform:translateZ(0)] scale-[0.9] sm:scale-100">
          <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
            {/* Front */}
            <div className="absolute inset-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 shadow-[0_18px_44px_rgba(0,0,0,0.35)] [backface-visibility:hidden]">
              <div className="absolute inset-0 rounded-2xl opacity-80 [background:radial-gradient(circle_at_15%_10%,rgba(56,163,255,0.25),transparent_55%),radial-gradient(circle_at_85%_90%,rgba(56,163,255,0.18),transparent_60%)]" />
              <div className="relative h-full w-full p-4 text-left text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold tracking-[0.22em] text-[var(--color-text)]/60">
                      {brandLabel}
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]/90">
                      Alpha Freight Academy
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/alpha-logo.png"
                      alt="Alpha"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-lg object-cover ring-1 ring-[var(--color-border)]"
                    />
                    <BrandMark brand={brand} />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <ChipIcon className="h-10 w-14" />
                  <div className="h-7 w-7 rounded-full border border-[var(--color-border)] bg-[var(--color-accent)]/10" />
                </div>

                <p className="mt-5 font-mono text-[15px] font-bold tracking-[0.12em] text-[var(--color-text)]">
                  •••• •••• •••• ••••
                </p>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--color-text)]/60">
                      Cardholder
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]">
                      {(name || "YOUR NAME").toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--color-text)]/60">
                      Valid thru
                    </p>
                    <p className="mt-1 text-[12px] font-semibold text-[var(--color-text)]">
                      •• / ••
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 shadow-[0_18px_44px_rgba(0,0,0,0.35)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="absolute left-0 right-0 top-5 h-9 bg-black/60" />
              <div className="absolute left-4 right-4 top-20 flex items-center gap-3">
                <div className="h-7 flex-1 rounded bg-white/90" />
                <div className="h-7 w-16 rounded bg-white/90 px-2 py-1 text-right font-mono text-xs font-bold text-black">
                  ***
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] text-[var(--color-muted)]">
                <span>Secure Stripe processing</span>
                <span className="font-semibold text-[var(--color-accent)]">Alpha Freight</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <div className="rounded-lg border border-[var(--color-border)] bg-[#050912] px-3 py-3">
        <CardElement
          options={{ style: { base: { color: "#edf2f8", fontSize: "16px" } } }}
          onChange={(e) => {
            setCardReady(Boolean(e.complete && !e.error));
            if (e.brand) setBrand(e.brand);
          }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--color-muted)]">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[var(--color-accent)]" /> Stripe Payments
        </span>
        <span className="inline-flex items-center gap-2">
          <Lock className="h-4 w-4 text-[var(--color-accent)]" /> 256-bit SSL
        </span>
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        Your card details are encrypted and processed securely by{" "}
        <span className="font-semibold text-[var(--color-text)]">Stripe</span>. We never store your card number.
      </p>
      <button
        type="submit"
        disabled={busy || !cardReady || !stripe}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-accent)] py-3 text-sm font-bold text-[#05080f] disabled:opacity-40"
      >
        {busy ? "Completing securely…" : "Complete Enrollment"}
      </button>
    </form>
  );
}

function BrandMark({ brand }: { brand: string }) {
  if (brand === "visa") {
    return (
      <span className="rounded-md border border-[var(--color-border)] bg-[#0b1324]/70 px-2 py-1 text-[10px] font-black tracking-[0.18em] text-[var(--color-text)]">
        VISA
      </span>
    );
  }
  if (brand === "mastercard") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[#0b1324]/70 px-2 py-1">
        <span className="h-3.5 w-3.5 rounded-full bg-[#ff9800]" aria-hidden />
        <span className="-ml-1 h-3.5 w-3.5 rounded-full bg-[#d50000]" aria-hidden />
      </span>
    );
  }
  if (brand === "amex") {
    return (
      <span className="rounded-md border border-[var(--color-border)] bg-[#0b1324]/70 px-2 py-1 text-[10px] font-black tracking-[0.16em] text-[#7dd3fc]">
        AMEX
      </span>
    );
  }
  if (brand === "discover") {
    return (
      <span className="rounded-md border border-[var(--color-border)] bg-[#0b1324]/70 px-2 py-1 text-[10px] font-black tracking-[0.1em] text-[var(--color-text)]">
        DISC
      </span>
    );
  }
  return (
    <span className="rounded-md border border-[var(--color-border)] bg-[#0b1324]/70 px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-[var(--color-muted)]">
      {brand === "unknown" ? "CARD" : brand.toUpperCase()}
    </span>
  );
}

function ChipIcon({ className }: { className?: string }) {
  // Uiverse EMV chip image (embedded) – used only as a visual.
  return (
    <svg
      className={className}
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <image
        width="50"
        height="50"
        x="0"
        y="0"
        href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAB6VBMVEUAAACNcTiVeUKVeUOYfEaafEeUeUSYfEWZfEaykleyklaXe0SWekSZZjOYfEWYe0WXfUWXe0WcgEicfkiXe0SVekSXekSWekKYe0a9nF67m12ZfUWUeEaXfESVekOdgEmVeUWWekSniU+VeUKVeUOrjFKYfEWliE6WeESZe0GSe0WYfES7ml2Xe0WXeESUeEOWfEWcf0eWfESXe0SXfEWYekSVeUKXfEWxklawkVaZfEWWekOUekOWekSYfESZe0eXekWYfEWZe0WZe0eVeUSWeETAnmDCoWLJpmbxy4P1zoXwyoLIpWbjvXjivnjgu3bfu3beunWvkFWxkle/nmDivXiWekTnwXvkwHrCoWOuj1SXe0TEo2TDo2PlwHratnKZfEbQrWvPrWuafUfbt3PJp2agg0v0zYX0zYSfgkvKp2frxX7mwHrlv3rsxn/yzIPgvHfduXWXe0XuyIDzzISsjVO1lVm0lFitjVPzzIPqxX7duna0lVncuHTLqGjvyIHeuXXxyYGZfUayk1iyk1e2lln1zYTEomO2llrbtnOafkjFpGSbfkfZtXLhvHfkv3nqxH3mwXujhU3KqWizlFilh06khk2fgkqsjlPHpWXJp2erjVOhg0yWe0SliE+XekShhEvAn2D///+gx8TWAAAARnRSTlMACVCTtsRl7Pv7+vxkBab7pZv5+ZlL/UnU/f3SJCVe+Fx39naA9/75XSMh0/3SSkia+pil/KRj7Pr662JPkrbP7OLQ0JFOijI1MwAAAAFiS0dEorDd34wAAAAJcEhZcwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IDx2lsiuJAAACLElEQVRIx2NgGAXkAUYmZhZWPICFmYkRVQcbOwenmzse4MbFzc6DpIGXj8PD04sA8PbhF+CFaxEU8iWkAQT8hEVgOkTF/InR4eUVICYO1SIhCRMLDAoKDvFDVhUaEhwUFAjjSUlDdMiEhcOEItzdI6OiYxA6YqODIt3dI2DcuDBZsBY5eVTr4xMSYcyk5BRUOXkFsBZFJTQnp6alQxgZmVloUkrKYC0qqmji2WE5EEZuWB6alKoKdi35YQUQRkFYPpFaCouKIYzi6EDitJSUlsGY5RWVRGjJLyxNy4ZxqtIqqvOxaVELQwZFZdkIJVU1RSiSalAt6rUwUBdWG1CP6pT6gNqwOrgCdQyHNYR5YQFhDXj8MiK1IAeyN6aORiyBjByVTc0FqBoKWpqwRCVSgilOaY2OaUPw29qjOzqLvTAchpos47u6EZyYnngUSRwpuTe6D+6qaFQdOPNLRzOM1dzhRZyW+CZouHk3dWLXglFcFIflQhj9YWjJGlZcaKAVSvjyPrRQ0oQVKDAQHlYFYUwIm4gqExGmBSkutaVQJeomwViTJqPK6OhCy2Q9sQBk8cY0DxjTJw0lAQWK6cOKfgNhpKK7ZMpUeF3jPa28BCETamiEqJKM+X1gxvWXpoUjVIVPnwErw71nmpgiqiQGBjNzbgs3j1nus+fMndc+Cwm0T52/oNR9lsdCS24ra7Tq1cbWjpXV3sHRCb1idXZ0sGdltXNxRateRwHRAACYHutzk/2I5QAAAABJRU5ErkJggg=="
      />
    </svg>
  );
}

export default function FreightStudentEnroll({
  initialReason,
}: {
  initialReason?: string;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [plan, setPlan] = useState<Plan>("lifetime");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [formErr, setFormErr] = useState<string | null>(null);
  const [oauthUserId, setOauthUserId] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  /** Email already in auth — checkout may link paid student to that account (see complete-enrollment). */
  const [linkExistingAccount, setLinkExistingAccount] = useState(false);

  useEffect(() => {
    void (async () => {
      const sb = createClient();
      if (!sb) return;
      const { data } = await sb.auth.getUser();
      const u = data.user;
      if (u?.id) {
        setOauthUserId(u.id);
        if (u.email) setEmail(u.email);
        const metaName =
          (typeof u.user_metadata?.full_name === "string" && u.user_metadata.full_name) ||
          (typeof u.user_metadata?.name === "string" && u.user_metadata.name) ||
          "";
        if (metaName && !name) setName(metaName);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function validateAndPayStep() {
    setFormErr(null);
    if (!oauthUserId) {
      if (password !== confirm || password.length < 8) {
        setFormErr("Passwords must match and meet the 8 character minimum.");
        return;
      }
    }
    try {
      if (oauthUserId) {
        setStep(3);
        return;
      }
      const res = await fetch("/api/freight/check-student-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormErr(typeof data.error === "string" ? data.error : "Could not validate email.");
        return;
      }
      setLinkExistingAccount(Boolean(data.exists));
      setStep(3);
    } catch {
      setFormErr("Could not validate email.");
    }
  }

  async function signInWithGoogle() {
    setFormErr(null);
    setGoogleLoading(true);
    try {
      const sb = createClient();
      if (!sb) {
        setFormErr("Google sign-in is not configured yet.");
        return;
      }
      const origin = window.location.origin;
      const { error: oauthError } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
            "/freight/student/enroll"
          )}&freight=1&role=student`,
        },
      });
      if (oauthError) setFormErr(oauthError.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  const elementsKey = useMemo(() => `${plan}-${email}-${name}`, [plan, email, name]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <Sparkles className="mx-auto h-10 w-10 text-[var(--color-accent)]" />
        <h1
          className="mt-4 text-3xl font-bold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display), sans-serif" }}
        >
          Academy enrollment
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
          Structured dispatch training backed by Alpha Solutions — Stripe secures tuition before dashboards unlock.
        </p>
      </div>

      {initialReason === "payment" ? (
        <p className="mb-10 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-100">
          Your payment is required to access course materials — complete enrollment on this page.
        </p>
      ) : null}

      {step <= 3 ? (
        <div className="mb-4 flex justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
          <span className={step === 1 ? "text-[var(--color-accent)]" : undefined}>Plan</span>
          <span>·</span>
          <span className={step === 2 ? "text-[var(--color-accent)]" : undefined}>Account</span>
          <span>·</span>
          <span className={step === 3 ? "text-[var(--color-accent)]" : undefined}>Pay</span>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <button
            type="button"
            onClick={() => setPlan("monthly")}
            className={`rounded-2xl border p-8 text-left ${
              plan === "monthly"
                ? "border-[var(--color-accent)]/80 bg-[var(--color-accent)]/10"
                : "border-[var(--color-border)] bg-[var(--color-surface)]/35"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Flexible</p>
            <h2 className="mt-4 text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
              Monthly Access
            </h2>
            <p className="mt-2 text-[var(--color-accent)] font-bold text-2xl">
              $49<span className="text-sm font-normal text-[var(--color-muted)]">/mo USD</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--color-muted)]">
              {monthlyFeatures.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </button>
          <button
            type="button"
            onClick={() => setPlan("lifetime")}
            className={`relative rounded-2xl border p-8 text-left ${
              plan === "lifetime"
                ? "border-[var(--color-accent)] shadow-[var(--glow-md)] bg-[radial-gradient(circle_at_top,_rgba(56,163,255,0.3),transparent_60%)]"
                : "border-[var(--color-border)] bg-[var(--color-surface)]/35"
            }`}
          >
            <span className="absolute right-6 top-5 rounded-full bg-[var(--color-accent)] px-3 py-0.5 text-[11px] font-bold uppercase text-[#05080f]">
              Recommended
            </span>
            <BadgeCheck className="h-7 w-7 text-[var(--color-accent)]" />
            <h2 className="mt-4 text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
              Lifetime Access
            </h2>
            <p className="mt-2 text-[var(--color-accent)] font-bold text-3xl">
              $120
              <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
                one-time · online access
              </span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-[var(--color-text)]">
              {lifetimeFeatures.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-10 flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex min-w-[260px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-10 py-3 text-sm font-bold text-[#05080f]"
          >
            Continue with selected plan →
          </button>
          <div className="flex flex-wrap justify-center gap-4 text-[11px] text-[var(--color-muted)]">
            <Lock className="h-4 w-4 inline text-[var(--color-accent)]" /> Cancel anytime messaging lives in onboarding docs
          </div>
          <Link href="/freight/student" className="text-sm text-[var(--color-accent)] underline">
            View syllabus & FAQs
          </Link>
          <p className="max-w-xl text-center text-xs text-[var(--color-muted)]">
            Operational training only — motor carriers retain compliance responsibility with FMCSA/state rules.
          </p>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mx-auto max-w-lg rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-8 py-10 space-y-4">
          {formErr ? <p className="text-sm text-red-200">{formErr}</p> : null}
          {!oauthUserId ? (
            <>
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                disabled={googleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:opacity-50"
              >
                <GoogleGlyph className="h-5 w-5 shrink-0" />
                {googleLoading ? "Redirecting…" : "Continue with Google"}
              </button>
              <div className="flex items-center gap-3 text-xs text-[var(--color-muted)]">
                <span className="h-px flex-1 bg-[var(--color-border)]" />
                or create a password
                <span className="h-px flex-1 bg-[var(--color-border)]" />
              </div>
            </>
          ) : (
            <p className="text-xs text-[var(--color-muted)] text-center">
              Signed in with Google. You’ll unlock lessons after payment clears.
            </p>
          )}
          <label className="block text-xs text-[var(--color-muted)]">Full name</label>
          <input
            required
            className="w-full rounded-lg border border-[var(--color-border)] bg-[#050912] px-3 py-2 text-[var(--color-text)]"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="block text-xs text-[var(--color-muted)]">Email</label>
          <input
            required
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[#050912] px-3 py-2 text-[var(--color-text)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {!oauthUserId ? (
            <>
              <label className="block text-xs text-[var(--color-muted)]">Password · min 8 characters</label>
              <input
                required
                type="password"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[#050912] px-3 py-2 text-[var(--color-text)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label className="block text-xs text-[var(--color-muted)]">Confirm password</label>
              <input
                required
                type="password"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[#050912] px-3 py-2 text-[var(--color-text)]"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs text-[var(--color-muted)] underline"
          >
            ← Adjust plan selection
          </button>
          <button
            type="button"
            onClick={validateAndPayStep}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-accent)] py-3 text-sm font-semibold text-[#05080f]"
          >
            Continue to Payment
          </button>
        </div>
      ) : null}

      {step === 3 && stripePromise ? (
        <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-[var(--color-accent)]/30 bg-[#071021] px-8 py-10">
          {linkExistingAccount ? (
            <p className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/30 px-3 py-2 text-xs text-[var(--color-muted)]">
              This email already has an Alpha account. After payment, your Academy access attaches when the password you use matches that account (same as the password you entered above).
            </p>
          ) : null}
          <h3 className="text-lg font-bold text-[var(--color-text)]">
            Secure checkout ({plan})
          </h3>
          <Elements key={elementsKey} stripe={stripePromise}>
            <div className="mt-8">
              <InnerPaymentCard
                plan={plan}
                email={email}
                name={name}
                password={oauthUserId ? undefined : password}
              />
            </div>
          </Elements>
        </div>
      ) : null}

      {step === 3 && !stripePromise ? (
        <p className="mx-auto mt-10 max-w-md text-center text-sm text-[var(--color-muted)]">
          Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable embedded Stripe Checkout.
        </p>
      ) : null}
    </div>
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
