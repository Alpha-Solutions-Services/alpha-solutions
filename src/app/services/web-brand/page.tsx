import type { Metadata } from "next";
import { PillarLandingPage } from "@/components/services/PillarLandingPage";
import { buildPillarMetadata } from "@/lib/pillar-landing";

const PILLAR_ID = 1 as const;

export function generateMetadata(): Metadata {
  return buildPillarMetadata(PILLAR_ID);
}

export default function WebBrandPillarPage() {
  return <PillarLandingPage pillarId={PILLAR_ID} />;
}
