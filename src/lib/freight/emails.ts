import {
  brandedEmailWrap,
  createConfiguredTransporter,
  resolveSmtpFromAddress,
} from "@/lib/freight/email-transport";
import { FREIGHT_SUPPORT_EMAIL, FREIGHT_TEAM_EMAIL, PUBLIC_SITE_URL } from "./constants";

const cta = (label: string, href: string) =>
  `<p style="margin:24px 0"><a href="${href}" style="display:inline-block;padding:14px 24px;background:#38a3ff;color:#05080f;border-radius:10px;font-weight:700;text-decoration:none">${label}</a></p>`;

async function sendTransactional(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const transporter = createConfiguredTransporter();
  const smtpUser = process.env.SMTP_USER?.trim();
  if (!transporter || !smtpUser) {
    console.warn("[freight-mail] SMTP missing — outbound mail skipped:", params.subject);
    return { ok: false as const };
  }
  await transporter.sendMail({
    from: resolveSmtpFromAddress(`Alpha Solutions <${smtpUser}>`),
    to: params.to,
    replyTo: params.replyTo,
    subject: params.subject,
    text: params.text,
    html: params.html,
  });
  return { ok: true as const };
}

export async function sendDriverInvitationEmail(
  to: string,
  driverName: string,
  inviterName: string,
  carrierName: string,
  inviteUrl: string
) {
  const html = brandedEmailWrap(
    "Invitation",
    `<p>Hi ${escapeHtml(driverName || "there")},</p>
     <p><strong>${escapeHtml(carrierName)}</strong>, supported by ${escapeHtml(inviterName)}, has invited you to join Alpha Freight as a driver.</p>
     <p>Accept your invitation to set up your account:</p>
     ${cta("Accept invitation", inviteUrl)}
     <p style="color:#6a8caf;font-size:13px;">This invitation expires in 7 days. If you did not expect this, you can ignore this email.</p>`,
  );

  await sendTransactional({
    to,
    subject: "You've been invited to join Alpha Freight",
    html,
    text: `You've been invited to Alpha Freight.\nAccept: ${inviteUrl}`,
  });
}

export async function sendCarrierApprovedEmail(to: string, carrierName: string) {
  const loginUrl = `${PUBLIC_SITE_URL}/freight/login`;
  const html = brandedEmailWrap(
    "Account approved",
    `<p>Hi ${escapeHtml(carrierName)},</p>
     <p>Your Alpha Freight carrier account has been approved. Sign in anytime to manage loads and your fleet.</p>
     ${cta("Login to Alpha Freight", loginUrl)}
     <p style="font-size:13px;color:#6a8caf;">Questions? ${FREIGHT_SUPPORT_EMAIL}</p>`,
  );
  await sendTransactional({
    to,
    subject: "Your Alpha Freight carrier account has been approved",
    html,
    text: `Your carrier account ${carrierName} is approved.\nLogin: ${loginUrl}`,
  });
}

export async function sendCarrierRejectedEmail(
  to: string,
  carrierName: string,
  reason: string,
) {
  const html = brandedEmailWrap(
    "Registration update",
    `<p>Hi ${escapeHtml(carrierName)},</p>
     <p>We're unable to approve your Alpha Freight carrier application at this time.</p>
     <p style="margin-top:14px;"><strong>Reason:</strong></p>
     <blockquote style="border-left:3px solid #38a3ff;padding-left:12px;color:#edf2f8;">
       ${escapeHtml(reason)}
     </blockquote>
     <p style="font-size:13px;color:#6a8caf;">If this looks incorrect, reply to this email or contact ${FREIGHT_SUPPORT_EMAIL}.</p>`,
  );
  await sendTransactional({
    to,
    subject: "Alpha Freight carrier application update",
    html,
    text: `Carrier application not approved (${carrierName}). Reason: ${reason}`,
  });
}

export async function sendCarrierPendingEmail(
  to: string,
  carrierName: string,
  mcNumber: string,
) {
  const html = brandedEmailWrap(
    "New carrier pending",
    `<p>New carrier awaiting approval.</p>
     <ul style="margin:14px 0;padding-left:20px;line-height:1.7;">
       <li><strong>Company:</strong> ${escapeHtml(carrierName)}</li>
       <li><strong>MC:</strong> ${escapeHtml(mcNumber)}</li>
       <li><strong>Reviewer queue:</strong> Dispatcher dashboard · Carriers · Pending Approval</li>
     </ul>
     ${cta("Review in dashboard", `${PUBLIC_SITE_URL}/freight/dispatcher/carriers`)}`,
  );
  await sendTransactional({
    to: FREIGHT_TEAM_EMAIL,
    subject: `Alpha Freight • New carrier pending: ${carrierName}`,
    html,
    text: `New carrier pending: ${carrierName}, MC ${mcNumber}`,
    replyTo: to,
  });
}

export async function sendStudentWelcomeEmail(
  to: string,
  studentName: string,
  planLabel: string,
) {
  const dash = `${PUBLIC_SITE_URL}/freight/student/dashboard`;
  const html = brandedEmailWrap(
    "Welcome",
    `<p>Hi ${escapeHtml(studentName)},</p>
     <p>Your Alpha Freight Academy enrollment (${escapeHtml(planLabel)}) is active. Dive into your lessons whenever you're ready.</p>
     ${cta("Go to dashboard", dash)}`,
  );
  await sendTransactional({
    to,
    subject: "You're enrolled — Alpha Freight Academy",
    html,
    text: `Welcome to Alpha Freight Academy (${planLabel}). Dashboard: ${dash}`,
  });
}

export async function sendStudentPaymentFailedEmail(to: string, studentName: string) {
  const enrollUrl = `${PUBLIC_SITE_URL}/freight/student/enroll`;
  const html = brandedEmailWrap(
    "Payment issue",
    `<p>Hi ${escapeHtml(studentName)},</p>
     <p>We couldn't process your recent Alpha Freight Academy payment.</p>
     <p style="margin-top:14px;">Update billing to keep uninterrupted access:</p>
     ${cta("Update enrollment", enrollUrl)}
     ${supportSnippet()}`,
  );
  await sendTransactional({
    to,
    subject: "Action needed — Alpha Freight payment failed",
    html,
    text: `Payment failed for Alpha Freight Academy.\nRenew: ${enrollUrl}`,
  });
}

export async function sendStudentSubscriptionCancelledEmail(
  to: string,
  studentName: string,
) {
  const enrollUrl = `${PUBLIC_SITE_URL}/freight/student/enroll`;
  const html = brandedEmailWrap(
    "Enrollment ended",
    `<p>Hi ${escapeHtml(studentName)},</p>
     <p>Your Alpha Freight Academy subscription ended. Course access pauses until you re-enroll.</p>
     ${cta("Review plans", enrollUrl)}
     ${supportSnippet()}`,
  );
  await sendTransactional({
    to,
    subject: "Alpha Freight Academy subscription ended",
    html,
    text: `Subscription ended. Re-enroll: ${enrollUrl}`,
  });
}

function supportSnippet() {
  return `<p style="font-size:13px;color:#6a8caf;margin-top:20px;">Help: ${FREIGHT_SUPPORT_EMAIL}</p>`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
