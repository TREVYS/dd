import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canCreateFormations } from "@/lib/permissions";
import { z } from "zod";

const ModuleSchema = z.object({
  title: z.string().min(1),
  orderIndex: z.coerce.number().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canCreateFormations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id: formationId } = await params;
  const body = await req.json();
  const parsed = ModuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const module_ = await prisma.module.create({
    data: { formationId, title: parsed.data.title, orderIndex: parsed.data.orderIndex ?? 0 },
  });
  return NextResponse.json(module_, { status: 201 });
}
