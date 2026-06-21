import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ensureClientFolderTree } from "@/lib/ged";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { pipelineStage, companyName, contactName, contactEmail, contactPhone, source, estimatedValue, notes, assignedToId } = body as {
    pipelineStage?: string;
    companyName?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    source?: string;
    estimatedValue?: number;
    notes?: string;
    assignedToId?: string;
  };

  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (pipelineStage === "clients_actifs" && prospect.pipelineStage !== "clients_actifs") {
    if (session.user.role !== "Associé") {
      return NextResponse.json(
        { error: "seul un associé peut valider la signature d'un client" },
        { status: 403 }
      );
    }

    const client = await prisma.client.create({
      data: {
        legalName: prospect.companyName,
        status: "active",
        clientSince: new Date(),
      },
    });
    await ensureClientFolderTree(client.id);

    const updated = await prisma.prospect.update({
      where: { id },
      data: {
        pipelineStage: "clients_actifs",
        signedById: session.user.id,
        convertedClientId: client.id,
      },
      include: { assignedTo: true, signedBy: true },
    });
    return NextResponse.json(updated);
  }

  const updated = await prisma.prospect.update({
    where: { id },
    data: { pipelineStage, companyName, contactName, contactEmail, contactPhone, source, estimatedValue, notes, assignedToId },
    include: { assignedTo: true, signedBy: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.prospect.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
