import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: { formation: { select: { title: true, category: true } } },
    orderBy: { issuedAt: "desc" },
  });
  return NextResponse.json(certificates);
}
