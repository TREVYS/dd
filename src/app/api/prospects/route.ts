import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const ProspectSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  source: z.string().optional(),
  estimatedValue: z.number().optional(),
  notes: z.string().optional(),
  pipelineStage: z.string().default("prospects"),
  assignedToId: z.string().optional(),
});

export async function GET() {
  const prospects = await prisma.prospect.findMany({
    include: { assignedTo: true, signedBy: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(prospects);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ProspectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prospect = await prisma.prospect.create({
    data: parsed.data,
    include: { assignedTo: true, signedBy: true },
  });
  return NextResponse.json(prospect, { status: 201 });
}
