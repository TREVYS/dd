import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { ensureClientFolderTree } from "@/lib/ged";

const ClientSchema = z.object({
  legalName: z.string().min(1),
  commercialName: z.string().optional(),
  siren: z.string().optional(),
  legalForm: z.string().optional(),
  taxRegime: z.string().optional(),
  city: z.string().optional(),
});

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { legalName: "asc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = ClientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const client = await prisma.client.create({ data: parsed.data });
  await ensureClientFolderTree(client.id);
  return NextResponse.json(client, { status: 201 });
}
