import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const mail = await prisma.mail.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!mail || mail.recipientId !== session.user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const firstName = session.user.name?.split(" ")[0] ?? "";
  const senderFirstName = mail.fromName.split(" ")[0];
  const clientMention = mail.client
    ? ` concernant ${mail.client.commercialName ?? mail.client.legalName}`
    : "";

  const draft = [
    `Bonjour ${senderFirstName},`,
    "",
    `Merci pour votre message${clientMention}.`,
    `Nous avons bien pris connaissance de votre demande « ${mail.subject} » et reviendrons vers vous avec les éléments demandés dans les meilleurs délais.`,
    "",
    "N'hésitez pas si vous avez besoin d'informations complémentaires d'ici là.",
    "",
    "Cordialement,",
    firstName,
  ].join("\n");

  return NextResponse.json({ draft });
}
