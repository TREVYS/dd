import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ clients: [], contacts: [] });
  }

  const [clients, contacts] = await Promise.all([
    prisma.client.findMany({
      where: {
        OR: [
          { legalName: { contains: q, mode: "insensitive" } },
          { commercialName: { contains: q, mode: "insensitive" } },
          { siren: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
    }),
    prisma.clientContact.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { client: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    clients: clients.map((c) => ({
      id: c.id,
      label: c.commercialName || c.legalName,
      sub: c.siren ?? "",
    })),
    contacts: contacts.map((c) => ({
      id: c.id,
      clientId: c.clientId,
      label: `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim(),
      sub: c.client.commercialName || c.client.legalName,
    })),
  });
}
