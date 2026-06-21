import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { canManageEmailSettings } from "@/lib/permissions";
import { getSmtpConfig, saveSmtpConfig, isMailerConfigured } from "@/lib/mailer";

export async function GET() {
  const session = await auth();
  if (!session || !canManageEmailSettings(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const config = await getSmtpConfig();
  return NextResponse.json({
    configured: await isMailerConfigured(),
    host: config?.host ?? "",
    port: config?.port ?? 587,
    secure: config?.secure ?? false,
    user: config?.user ?? "",
    from: config?.from ?? "",
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageEmailSettings(session.user?.role)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { host, port, secure, user, from, pass } = body;
  if (!host || !user || !from) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  const saved = await saveSmtpConfig({
    host: String(host),
    port: Number(port) || 587,
    secure: Boolean(secure),
    user: String(user),
    from: String(from),
    pass: pass ? String(pass) : undefined,
  });

  return NextResponse.json({ host: saved.host, port: saved.port, secure: saved.secure, user: saved.user, from: saved.from });
}
