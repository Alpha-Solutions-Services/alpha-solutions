import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deliverAuthNotifications } from "@/lib/email/auth-notify";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import {
  brandedEmailWrap,
  createConfiguredTransporter,
  resolveSmtpFromAddress,
} from "@/lib/freight/email-transport";

const schema = z.object({
  token: z.string().min(10),
  fullName: z.string().min(2),
  phone: z.string().min(7),
  cdlNumber: z.string().min(5),
  cdlState: z.string().length(2),
  cdlExpiry: z.string().min(8),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const admin = getServiceRoleClient();
  if (!admin) return NextResponse.json({ error: "Server error" }, { status: 500 });

  try {
    const body = schema.parse(await req.json());
    const { data: invite } = await admin
      .from("driver_invitations")
      .select("*")
      .eq("token", body.token.trim())
      .maybeSingle();

    if (
      !invite ||
      invite.status !== "pending" ||
      new Date(invite.expires_at).getTime() < Date.now()
    ) {
      return NextResponse.json(
        { error: "This invitation link is invalid or has expired." },
        { status: 400 },
      );
    }

    const emailNorm = String(invite.driver_email).toLowerCase();
    const { data: exists } = await admin.rpc("check_freight_email_registered", {
      candidate: emailNorm,
    });
    if (exists) {
      return NextResponse.json(
        { error: "An account already exists for this email." },
        { status: 409 },
      );
    }

    const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
      email: emailNorm,
      password: body.password,
      email_confirm: true,
      user_metadata: { role: "driver", full_name: body.fullName.trim() },
    });
    if (authErr || !authUser?.user?.id) {
      console.error("[accept-driver-invite] createUser", authErr);
      return NextResponse.json({ error: "Could not create account" }, { status: 500 });
    }

    const userId = authUser.user.id;

    const { error: profileErr } = await admin.from("profiles").insert({
      id: userId,
      email: emailNorm,
      full_name: body.fullName.trim(),
      phone: body.phone.trim(),
      role: "driver",
      carrier_id: invite.carrier_id as string,
      enrollment_status: "unpaid",
      carrier_status: "pending",
      cdl_number: body.cdlNumber.trim(),
      cdl_state: body.cdlState.trim().toUpperCase(),
      cdl_expiry: body.cdlExpiry.slice(0, 10),
    });

    if (profileErr) {
      console.error("[accept-driver-invite] profile insert", profileErr);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Profile setup failed" }, { status: 500 });
    }

    await admin
      .from("driver_invitations")
      .update({ status: "accepted" })
      .eq("id", invite.id as string);

    const { data: inviter } = await admin
      .from("profiles")
      .select("email,full_name")
      .eq("id", invite.invited_by as string)
      .maybeSingle();
    const { data: newDriverSummary } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const transporter = createConfiguredTransporter();
    const smtpUser = process.env.SMTP_USER?.trim();
    if (transporter && smtpUser && inviter?.email) {
      const inner = brandedEmailWrap(
        "Driver enrolled",
        `<p>${newDriverSummary?.full_name ?? "A driver"} has accepted your Alpha Freight invitation.</p>`,
      );
      await transporter.sendMail({
        from: resolveSmtpFromAddress(`Alpha Solutions <${smtpUser}>`),
        to: inviter.email as string,
        subject: "Driver accepted Alpha Freight invitation",
        html: inner,
        text: `Driver ${body.fullName} accepted your Alpha Freight invitation.`,
      });
    }

    void deliverAuthNotifications({
      kind: "signup",
      userId,
      email: emailNorm,
      profileRole: "driver",
      detail: "Driver accepted invitation — account created.",
    }).catch(() => {});

    return NextResponse.json({ ok: true, userId });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    console.error("[accept-driver-invite]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
