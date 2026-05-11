import type { User } from "@supabase/supabase-js";
import {
  brandedEmailWrap,
  createConfiguredTransporter,
  resolveSmtpFromAddress,
} from "@/lib/freight/email-transport";
import { isAllowedAdminEmail } from "@/lib/admin-allowlist";
import { isAllowedDispatcherEmail } from "@/lib/dispatcher-allowlist";
import { PUBLIC_SITE_URL } from "@/lib/freight/constants";

const DEFAULT_OPS_INBOX = "alphaassistant.alpha@gmail.com";

export function getOpsNotifyEmails(): string[] {
  const raw = process.env.AUTH_OPS_NOTIFY_EMAIL?.trim();
  if (!raw) return [DEFAULT_OPS_INBOX];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function shouldEmailUserOnAuth(): boolean {
  return process.env.AUTH_NOTIFY_USER_EMAIL?.trim() !== "false";
}

/** True when this looks like the very first session right after account creation (common for OAuth). */
export function isFirstAuthSession(user: User): boolean {
  const created = user.created_at ? new Date(user.created_at).getTime() : NaN;
  const last = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : NaN;
  if (!Number.isFinite(created) || !Number.isFinite(last)) return false;
  return Math.abs(last - created) <= 120_000;
}

export function resolveAuthAudienceLabel(
  email: string | undefined,
  profileRole: string | null | undefined,
): string {
  const em = email?.toLowerCase() ?? "";
  if (isAllowedAdminEmail(em)) return "Admin";
  if (isAllowedDispatcherEmail(em)) return "Dispatcher / broker";
  switch (profileRole) {
    case "carrier":
      return "Carrier";
    case "student":
      return "Student";
    case "driver":
      return "Driver";
    case "dispatcher":
      return "Dispatcher / broker";
    default:
      return "Client portal";
  }
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type AuthNotifyKind = "signup" | "login";

export async function deliverAuthNotifications(opts: {
  kind: AuthNotifyKind;
  userId: string;
  email: string;
  profileRole: string | null;
  detail?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
}): Promise<{ ok: boolean }> {
  const transporter = createConfiguredTransporter();
  const smtpUser = process.env.SMTP_USER?.trim();
  if (!transporter || !smtpUser) {
    console.warn("[auth-notify] SMTP not configured — skipping auth notifications");
    return { ok: false };
  }

  const from = resolveSmtpFromAddress(`Alpha Solutions <${smtpUser}>`);
  const audience = resolveAuthAudienceLabel(opts.email, opts.profileRole);
  const when = new Date().toISOString();
  const detailBlock = opts.detail
    ? `<p style="margin-top:12px;color:#6a8caf;font-size:13px;"><strong>Note:</strong> ${escapeHtml(opts.detail)}</p>`
    : "";
  const techBlock = `
    <ul style="margin:14px 0;padding-left:20px;line-height:1.65;color:#edf2f8;font-size:14px;">
      <li><strong>Audience:</strong> ${escapeHtml(audience)}</li>
      <li><strong>Email:</strong> ${escapeHtml(opts.email)}</li>
      <li><strong>User ID:</strong> ${escapeHtml(opts.userId)}</li>
      <li><strong>When (UTC):</strong> ${escapeHtml(when)}</li>
      ${opts.clientIp ? `<li><strong>IP:</strong> ${escapeHtml(opts.clientIp)}</li>` : ""}
    </ul>`;

  const opsSubject =
    opts.kind === "signup"
      ? `[Alpha Auth] New account · ${audience} · ${opts.email}`
      : `[Alpha Auth] Sign-in · ${audience} · ${opts.email}`;

  const opsHtml = brandedEmailWrap(
    opts.kind === "signup" ? "New account" : "Sign-in",
    `<p style="color:#edf2f8;">Someone ${
      opts.kind === "signup" ? "<strong>registered</strong>" : "<strong>signed in</strong>"
    } on Alpha Solutions.</p>${techBlock}${detailBlock}
     <p style="margin-top:18px;font-size:13px;color:#6a8caf;">Site: ${escapeHtml(PUBLIC_SITE_URL)}</p>`,
  );

  const opsText = `${opsSubject}\nAudience: ${audience}\nEmail: ${opts.email}\nUser: ${opts.userId}\nUTC: ${when}${opts.clientIp ? `\nIP: ${opts.clientIp}` : ""}${opts.detail ? `\nNote: ${opts.detail}` : ""}`;

  for (const to of getOpsNotifyEmails()) {
    await transporter.sendMail({
      from,
      to,
      subject: opsSubject,
      text: opsText,
      html: opsHtml,
    });
  }

  if (shouldEmailUserOnAuth() && opts.email) {
    const userSubject =
      opts.kind === "signup"
        ? "Welcome — your Alpha Solutions account is ready"
        : "Security notice — new sign-in to Alpha Solutions";

    const userHtml = brandedEmailWrap(
      opts.kind === "signup" ? "Welcome" : "Sign-in activity",
      opts.kind === "signup"
        ? `<p>Hi,</p>
           <p>Your Alpha Solutions account (${escapeHtml(audience)}) was created successfully.</p>
           <p style="margin-top:14px;">You can sign in anytime at <a href="${escapeHtml(PUBLIC_SITE_URL)}" style="color:#38a3ff">${escapeHtml(PUBLIC_SITE_URL)}</a>.</p>
           <p style="margin-top:14px;font-size:13px;color:#6a8caf;">If you did not create this account, contact us immediately.</p>`
        : `<p>Hi,</p>
           <p>We recorded a sign-in to your Alpha Solutions account (${escapeHtml(audience)}) at <strong>${escapeHtml(when)}</strong> (UTC).</p>
           ${opts.clientIp ? `<p style="margin-top:12px;font-size:13px;color:#6a8caf;">Approximate IP: ${escapeHtml(opts.clientIp)}</p>` : ""}
           <p style="margin-top:14px;font-size:13px;color:#6a8caf;">If this wasn’t you, reset your password and contact support.</p>`,
    );

    await transporter.sendMail({
      from,
      to: opts.email,
      subject: userSubject,
      text:
        opts.kind === "signup"
          ? `Welcome to Alpha Solutions (${audience}). Sign in: ${PUBLIC_SITE_URL}`
          : `New sign-in to Alpha Solutions (${audience}) at ${when} UTC.`,
      html: userHtml,
    });
  }

  return { ok: true };
}
