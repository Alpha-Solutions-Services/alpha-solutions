import type { CarrierDashboardData } from "./carrier-dashboard-types";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export type CarrierPortalConfig = Partial<
  Pick<
    CarrierDashboardData,
    | "trucks"
    | "drivers"
    | "payments"
    | "documents"
    | "compliance"
    | "dispatcher"
    | "revenue_weekly"
    | "revenue_monthly"
    | "rpm_trend"
    | "current_load"
    | "summary"
    | "fuel_expense_month"
    | "maintenance_alerts"
  >
>;

export async function fetchCarrierPortalConfig(opts: {
  companyName: string;
  carrierProfileId?: string;
}): Promise<CarrierPortalConfig | null> {
  const admin = getServiceRoleClient();
  if (!admin) return null;

  let query = admin.from("dispatch_carrier_portal").select("portal_config");

  if (opts.carrierProfileId) {
    query = query.eq("carrier_profile_id", opts.carrierProfileId);
  } else {
    query = query.ilike("company_name", opts.companyName);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data?.portal_config) return null;
  return data.portal_config as CarrierPortalConfig;
}

export async function upsertCarrierPortalConfig(opts: {
  companyName: string;
  carrierProfileId?: string;
  portalConfig: CarrierPortalConfig;
  updatedBy: string;
}): Promise<boolean> {
  const admin = getServiceRoleClient();
  if (!admin) return false;

  const { data: existing } = await admin
    .from("dispatch_carrier_portal")
    .select("id")
    .ilike("company_name", opts.companyName)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await admin
      .from("dispatch_carrier_portal")
      .update({
        portal_config: opts.portalConfig,
        updated_by: opts.updatedBy,
        carrier_profile_id: opts.carrierProfileId ?? null,
      })
      .eq("id", existing.id);
    return !error;
  }

  const { error } = await admin.from("dispatch_carrier_portal").insert({
    company_name: opts.companyName.trim(),
    carrier_profile_id: opts.carrierProfileId ?? null,
    portal_config: opts.portalConfig,
    updated_by: opts.updatedBy,
  });

  return !error;
}

export function mergePortalConfig(
  base: CarrierDashboardData,
  config: CarrierPortalConfig | null,
): CarrierDashboardData {
  if (!config) return base;
  return {
    ...base,
    summary: { ...base.summary, ...config.summary },
    current_load: config.current_load ?? base.current_load,
    trucks: config.trucks?.length ? config.trucks : base.trucks,
    drivers: config.drivers?.length ? config.drivers : base.drivers,
    payments: { ...base.payments, ...config.payments },
    documents: config.documents?.length ? config.documents : base.documents,
    compliance: { ...base.compliance, ...config.compliance },
    dispatcher: { ...base.dispatcher, ...config.dispatcher },
    revenue_weekly: config.revenue_weekly?.length ? config.revenue_weekly : base.revenue_weekly,
    revenue_monthly: config.revenue_monthly?.length ? config.revenue_monthly : base.revenue_monthly,
    rpm_trend: config.rpm_trend?.length ? config.rpm_trend : base.rpm_trend,
    fuel_expense_month: config.fuel_expense_month ?? base.fuel_expense_month,
    maintenance_alerts: config.maintenance_alerts ?? base.maintenance_alerts,
    data_source: "live",
  };
}
