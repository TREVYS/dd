import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageEmailSettings } from "@/lib/permissions";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageEmailSettings(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { to } = await req.json().catch(() => ({}));
  if (!to || typeof to !== "string") {
    return NextResponse.json({ error: "missing_recipient" }, { status: 400 });
  }

  try {
    await sendMail(to, "Test de configuration e-mail TREVYS OS", "<p>Ce message confirme que l'envoi de mail est correctement configuré.</p>");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
