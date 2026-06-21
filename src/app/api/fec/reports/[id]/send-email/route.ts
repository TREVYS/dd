import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageFecAnalysis } from "@/lib/permissions";
import { sendMail, isMailerConfigured } from "@/lib/mailer";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !canManageFecAnalysis(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isMailerConfigured()) {
    return NextResponse.json({ error: "smtp_not_configured" }, { status: 503 });
  }

  const { id } = await params;
  const { to } = await req.json().catch(() => ({}));
  if (!to || typeof to !== "string") {
    return NextResponse.json({ error: "missing_recipient" }, { status: 400 });
  }

  const report = await prisma.fecReport.findUnique({
    where: { id },
    include: { client: true },
  });
  if (!report) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let token = report.shareToken;
  let shareExpiresAt = report.shareExpiresAt;
  if (!token) {
    token = randomBytes(24).toString("hex");
    shareExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const baseUrl = process.env.APP_URL ?? new URL(req.url).origin;
  const shareUrl = `${baseUrl}/fec-partage/${token}`;

  const updated = await prisma.fecReport.update({
    where: { id },
    data: { shareToken: token, shareExpiresAt, status: "sent", sentAt: new Date() },
  });

  const content = updated.content as unknown as { summary: string };
  await sendMail(
    to,
    `${updated.title} — ${report.client.legalName}`,
    `<p>Bonjour,</p>
<p>${(content?.summary ?? "").replace(/\n/g, "<br/>")}</p>
<p>Consultez le rapport complet en ligne : <a href="${shareUrl}">${shareUrl}</a></p>
<p>Ce lien est valable jusqu'au ${shareExpiresAt?.toLocaleDateString("fr-FR")}.</p>
<p>Cordialement,<br/>TREVYS</p>`
  );

  return NextResponse.json({
    token: updated.shareToken,
    expiresAt: updated.shareExpiresAt,
    url: `/fec-partage/${updated.shareToken}`,
    sentTo: to,
  });
}
