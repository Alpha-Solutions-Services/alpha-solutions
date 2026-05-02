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

    const recipient = process.env.CONTACT_EMAIL || "alphaassistant.alpha@gmail.com";
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpSecure = process.env.SMTP_SECURE === "true";

    if (smtpHost && smtpUser && smtpPass) {
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

      await transporter.sendMail({
        from: process.env.SMTP_FROM || smtpUser,
        to: recipient,
        replyTo: data.email,
        subject,
        text,
        html,
      });
    } else {
      console.warn(
        "[contact] SMTP not configured. Inquiry saved to DB but no email sent."
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact] API error:", error);
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
