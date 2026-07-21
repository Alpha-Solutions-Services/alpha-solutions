import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import nodemailer from "nodemailer";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string(),
  budget: z.string().optional(),
  message: z.string().min(10),
});

function stripWrappingQuotes(value: string) {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1).trim();
  }
  return v;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const admin = getServiceRoleClient();
    if (admin) {
      const { error } = await admin.from("contact_inquiries").insert({
        name: data.name,
        email: data.email,
        phone: data.phone ?? null,
        budget: data.budget ?? null,
        service_slug: data.service,
        message: data.message,
        status: "new",
      });
      if (error) {
        console.error("[contact] supabase insert:", error);
        return NextResponse.json(
          { error: "Could not save inquiry" },
          { status: 500 }
        );
      }
    } else {
      console.warn(
        "[contact] SUPABASE_SERVICE_ROLE_KEY missing — inquiry not persisted:",
        data.email
      );
    }

    const recipient =
      process.env.CONTACT_EMAIL || "info@alphasolutions.software";
    const smtpHost = process.env.SMTP_HOST?.trim();
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPassRaw = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpSecure = process.env.SMTP_SECURE === "true";
    const smtpPass = smtpPassRaw
      ? stripWrappingQuotes(smtpPassRaw).replace(/\s+/g, "")
      : undefined;

    const smtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);
    if (!smtpConfigured && process.env.NODE_ENV === "production") {
      console.error(
        "[contact] SMTP not configured in production — refusing to return success."
      );
      return NextResponse.json(
        { error: "Email delivery is not configured" },
        { status: 500 }
      );
    }

    if (smtpConfigured && smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const subject = `New Contact Inquiry: ${data.name}`;
      const text = [
        "New contact inquiry received.",
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone || "N/A"}`,
        `Service: ${data.service}`,
        `Budget: ${data.budget || "N/A"}`,
        `Message: ${data.message}`,
      ].join("\n");

      const html = `
        <h2>New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
        <p><strong>Service:</strong> ${data.service}</p>
        <p><strong>Budget:</strong> ${data.budget || "N/A"}</p>
        <p><strong>Message:</strong><br/>${data.message.replace(/\n/g, "<br/>")}</p>
      `;

      try {
        const fromRaw = process.env.SMTP_FROM;
        const from = fromRaw ? stripWrappingQuotes(fromRaw) : smtpUser;
        await transporter.sendMail({
          from,
          to: recipient,
          replyTo: data.email,
          subject,
          text,
          html,
        });

        // Client confirmation (does not fail the request if this send fails)
        const portalUrl =
          process.env.NEXT_PUBLIC_PORTAL_URL?.trim() ||
          "https://portal.alphasolutions.software";
        try {
          await transporter.sendMail({
            from,
            to: data.email,
            subject: "We received your inquiry — Alpha Solutions",
            text: [
              `Hi ${data.name},`,
              "",
              "Thanks for contacting Alpha Solutions. We received your inquiry and will get back to you soon.",
              "",
              `Service: ${data.service}`,
              `Message: ${data.message}`,
              "",
              `Client portal: ${portalUrl}/login`,
              "",
              "— Alpha Solutions Services LLC",
            ].join("\n"),
            html: `
              <div style="font-family:Segoe UI,system-ui,sans-serif;background:#05080f;color:#edf2f8;padding:24px;">
                <div style="max-width:560px;margin:0 auto;background:#0b1120;border:1px solid rgba(56,139,253,0.2);border-radius:12px;padding:28px;">
                  <p style="color:#38a3ff;font-size:12px;text-transform:uppercase;letter-spacing:0.12em;">Inquiry received</p>
                  <h2 style="margin:8px 0 16px;color:#edf2f8;">Hi ${data.name},</h2>
                  <p>Thanks for contacting Alpha Solutions. We received your inquiry and will get back to you soon.</p>
                  <p style="color:#6a8caf;font-size:14px;"><strong>Service:</strong> ${data.service}</p>
                  <blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #38a3ff;background:#0f1829;">${data.message.replace(/\n/g, "<br/>")}</blockquote>
                  <p><a href="${portalUrl}/login" style="color:#38a3ff;">Open client portal</a></p>
                </div>
              </div>
            `,
          });
        } catch (confirmErr) {
          console.error("[contact] client confirmation email failed:", confirmErr);
        }
      } catch (err) {
        console.error("[contact] SMTP sendMail failed:", err);
        return NextResponse.json(
          { error: "Could not send email" },
          { status: 502 }
        );
      }
    } else {
      console.warn(
        "[contact] SMTP not configured. Inquiry saved to DB but no email sent."
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    console.error("[contact] API error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
