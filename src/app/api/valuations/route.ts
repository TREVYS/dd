import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageValuations } from "@/lib/permissions";
import { z } from "zod";

const CreateSchema = z.object({
  clientId: z.string().min(1),
  title: z.string().min(1),
  fecImportId: z.string().optional(),
  companyData: z.record(z.string(), z.any()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const clientId = req.nextUrl.searchParams.get("clientId");
  const valuations = await prisma.valuation.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { id: true, legalName: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      _count: { select: { versions: true } },
    },
    take: 50,
  });
  return NextResponse.json(valuations);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageValuations(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const valuation = await prisma.valuation.create({
    data: { ...parsed.data, createdById: session.user.id },
  });
  return NextResponse.json(valuation, { status: 201 });
}
