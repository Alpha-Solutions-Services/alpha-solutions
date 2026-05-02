import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  resourceId: z.enum([
    "web-checklist",
    "mobile-calculator",
    "ecommerce-guide",
  ]),
});

const RESOURCE_DOWNLOADS: Record<
  z.infer<typeof schema>["resourceId"],
  string
> = {
  "web-checklist": "/resources/web-development-project-checklist.txt",
  "mobile-calculator": "/resources/mobile-app-cost-calculator.xlsx",
  "ecommerce-guide": "/resources/ecommerce-must-have-features.txt",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    console.log("Resource lead:", data);
    return NextResponse.json({
      success: true,
      downloadUrl: RESOURCE_DOWNLOADS[data.resourceId],
    });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
