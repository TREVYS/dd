import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { computeDepotComptesDueDate, stepsForType, type LegalCaseType } from "@/lib/legal-cases";

const LegalCaseSchema = z.object({
  clientId: z.string().min(1),
  type: z.enum(["depot_comptes", "creation_societe", "formalite"]),
  title: z.string().min(1),
  legalForm: z.string().optional(),
  fiscalYear: z.coerce.number().optional(),
  dueDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = LegalCaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clientId, type, title, legalForm, fiscalYear, dueDate } = parsed.data;
  const t = type as LegalCaseType;

  let computedDueDate: Date | null = dueDate ? new Date(dueDate) : null;
  if (!computedDueDate && t === "depot_comptes" && fiscalYear) {
    computedDueDate = computeDepotComptesDueDate(fiscalYear);
  }

  const legalCase = await prisma.legalCase.create({
    data: {
      clientId,
      type: t,
      title,
      legalForm,
      fiscalYear,
      dueDate: computedDueDate,
      createdBy: session.user.id,
      steps: {
        create: stepsForType(t).map((label, orderIndex) => ({ label, orderIndex })),
      },
    },
    include: { steps: { orderBy: { orderIndex: "asc" } }, client: true },
  });

  return NextResponse.json(legalCase, { status: 201 });
}
