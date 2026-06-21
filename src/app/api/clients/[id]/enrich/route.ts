import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { enrichFromSirene, enrichDirigeantsFromPappers } from "@/lib/company-enrichment";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (!client.siren) {
    return NextResponse.json({ error: "le client n'a pas de SIREN renseigné" }, { status: 400 });
  }

  const sirene = await enrichFromSirene(client.siren);
  if (!sirene) {
    return NextResponse.json(
      { error: "aucune donnée trouvée pour ce SIREN (API recherche-entreprises indisponible ou SIREN inconnu)" },
      { status: 502 }
    );
  }

  const updated = await prisma.client.update({
    where: { id },
    data: {
      legalName: sirene.legalName ?? client.legalName,
      commercialName: sirene.commercialName ?? client.commercialName,
      siret: sirene.siret ?? client.siret,
      legalForm: sirene.legalForm ?? client.legalForm,
      apeCode: sirene.apeCode ?? client.apeCode,
      activityDescription: sirene.activityDescription ?? client.activityDescription,
      address: sirene.address ?? client.address,
      postalCode: sirene.postalCode ?? client.postalCode,
      city: sirene.city ?? client.city,
      creationDate: sirene.creationDate ?? client.creationDate,
    },
  });

  const dirigeants = await enrichDirigeantsFromPappers(client.siren);
  let contactsAdded = 0;
  for (const d of dirigeants) {
    if (!d.lastName) continue;
    const existing = await prisma.clientContact.findFirst({
      where: { clientId: id, firstName: d.firstName, lastName: d.lastName },
    });
    if (existing) continue;
    await prisma.clientContact.create({
      data: {
        clientId: id,
        firstName: d.firstName,
        lastName: d.lastName,
        role: d.role,
        mandate: d.role,
        birthDate: d.birthDate,
        nationality: d.nationality,
      },
    });
    contactsAdded++;
  }

  return NextResponse.json({
    client: updated,
    contactsAdded,
    pappersUsed: !!process.env.PAPPERS_API_KEY,
  });
}
