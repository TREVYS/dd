import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageRevision, canValidateRevisionPartner } from "@/lib/permissions";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const dossier = await prisma.revisionDossier.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, legalName: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      fecImport: { select: { id: true, fileName: true, fileUrl: true, metrics: true, fiscalYear: true } },
      cycles: {
        orderBy: { orderIndex: "asc" },
        include: {
          validatedByManager: { select: { id: true, firstName: true, lastName: true } },
          validatedByPartner: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { comments: true, attachments: true } },
        },
      },
    },
  });

  if (!dossier) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(dossier);
}

const UpdateSchema = z.object({
  materialityBasis: z.string().optional().nullable(),
  materialityThreshold: z.coerce.number().optional().nullable(),
  fecImportId: z.string().optional().nullable(),
  synthesisNote: z.any().optional(),
  status: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageRevision(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (
    (data.materialityBasis !== undefined || data.materialityThreshold !== undefined) &&
    !canValidateRevisionPartner(session.user?.role)
  ) {
    return NextResponse.json({ error: "seuil_reserve_associe" }, { status: 403 });
  }

  const dossier = await prisma.revisionDossier.findUnique({ where: { id } });
  if (!dossier) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (dossier.lockedAt) {
    return NextResponse.json({ error: "dossier_verrouille" }, { status: 409 });
  }

  const updated = await prisma.revisionDossier.update({
    where: { id },
    data: {
      materialityBasis: data.materialityBasis,
      materialityThreshold: data.materialityThreshold,
      fecImportId: data.fecImportId,
      synthesisNote: data.synthesisNote,
      status: data.status,
    },
  });

  return NextResponse.json(updated);
}
