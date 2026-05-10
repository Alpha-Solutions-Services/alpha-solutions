import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendCarrierPendingEmail } from "@/lib/freight/emails";
import {
  lookupCarrierByMcDocket,
  normalizeMcNumber,
  summarizeFmcsCarrier,
} from "@/lib/freight/fmcsa";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  contactName: z.string().min(2),
  phone: z.string().min(7),
  mcNumber: z.string().min(1),
  companyName: z.string().min(2),
  companyAddress: z.string().min(5).optional().or(z.literal("")),
  allowManualVerification: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const admin = getServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "Service role not configured" }, {
      status: 500,
    });
  }

  try {
    const body = schema.parse(await req.json());
    const normalizedMc = normalizeMcNumber(body.mcNumber);
    const emailNorm = body.email.trim().toLowerCase();

    const { data: emailExists } = await admin.rpc("check_freight_email_registered", {
      candidate: emailNorm,
    });
    if (emailExists) {
      return NextResponse.json(
        { error: "Account already exists. Login instead." },
        { status: 409 },
      );
    }

    const { data: existingMc } = await admin
      .from("profiles")
      .select("id")
      .eq("mc_number", normalizedMc)
      .maybeSingle();
    if (existingMc) {
      return NextResponse.json(
        { error: "This MC number is already registered." },
        { status: 409 },
      );
    }

    let fmcsaVerified = false;
    let fmcsData: Record<string, unknown> | null = null;
    let companyName = body.companyName.trim();
    let companyAddress = (body.companyAddress ?? "").trim();
    let dotNumber: string | undefined;

    const webKey = process.env.FMCSA_API_KEY?.trim();
    const allowManual = Boolean(body.allowManualVerification);

    if (!webKey) {
      if (!allowManual) {
        return NextResponse.json(
          {
            error:
              "FMCSA is not configured server-side — submit again with manual verification enabled after reviewing your company details.",
            needsManualAck: true,
          },
          { status: 422 },
        );
      }
      fmcsaVerified = false;
      fmcsData = null;
    } else if (webKey) {
      const looked = await lookupCarrierByMcDocket(normalizedMc, webKey);

      if (looked.ok) {
        const summary = summarizeFmcsCarrier(looked.carrier, emailNorm);
        if (!summary.emailMatched || !summary.active) {
          return NextResponse.json(
            {
              error:
                "MC verification mismatch. Restart registration with corrected FMCSA data.",
            },
            { status: 422 },
          );
        }
        fmcsData = looked.carrier;
        fmcsaVerified = true;
        companyName = summary.companyName;
        companyAddress = summary.mailingAddress;
        dotNumber = summary.dotNumber;
      } else if (looked.reason === "not_found") {
        return NextResponse.json(
          {
            error:
              "MC number not found in FMCSA database. Please check your number.",
          },
          { status: 404 },
        );
      } else if (allowManual) {
        fmcsaVerified = false;
        fmcsData = null;
      } else {
        return NextResponse.json(
          {
            error:
              "FMCSA lookup failed temporarily. Retry, or acknowledge manual verification.",
            retry: true,
          },
          { status: 503 },
        );
      }
    }

    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email: emailNorm,
        password: body.password,
        email_confirm: true,
        user_metadata: { role: "carrier", contact_name: body.contactName.trim() },
      });

    if (createErr || !created.user) {
      console.error("[register-carrier] createUser", createErr);
      return NextResponse.json(
        { error: "Unable to create account" },
        { status: 500 },
      );
    }

    const userId = created.user.id;

    const { error: profErr } = await admin.from("profiles").insert({
      id: userId,
      email: emailNorm,
      full_name: body.contactName.trim(),
      phone: body.phone.trim(),
      role: "carrier",
      mc_number: normalizedMc,
      dot_number: dotNumber ?? null,
      company_name: companyName,
      company_address: companyAddress || null,
      carrier_status: "pending",
      fmcsa_verified: fmcsaVerified,
      fmcsa_verified_at: fmcsaVerified ? new Date().toISOString() : null,
      fmcsa_data: fmcsData,
      enrollment_status: "unpaid",
    });

    if (profErr) {
      console.error("[register-carrier] insert profile", profErr);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Unable to finalize registration — contact dispatch" },
        { status: 500 },
      );
    }

    await sendCarrierPendingEmail(
      emailNorm,
      companyName || "Carrier",
      normalizedMc,
    ).catch(() => {});

    return NextResponse.json({ ok: true, userId, fmcsaVerified });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    console.error("[register-carrier]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
