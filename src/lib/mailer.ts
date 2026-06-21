import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

const SETTINGS_KEY = "smtp";

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const stored = await prisma.appSetting.findUnique({ where: { key: SETTINGS_KEY } });
  const saved = (stored?.value as Partial<SmtpConfig>) ?? {};

  const host = saved.host ?? process.env.SMTP_HOST ?? "";
  const user = saved.user ?? process.env.SMTP_USER ?? "";
  const pass = saved.pass ?? process.env.SMTP_PASS ?? "";
  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(saved.port ?? process.env.SMTP_PORT ?? 587),
    secure: saved.secure ?? process.env.SMTP_SECURE === "true",
    user,
    pass,
    from: saved.from ?? process.env.SMTP_FROM ?? user,
  };
}

export async function saveSmtpConfig(config: Omit<SmtpConfig, "pass"> & { pass?: string }) {
  const existing = await prisma.appSetting.findUnique({ where: { key: SETTINGS_KEY } });
  const existingValue = (existing?.value as Partial<SmtpConfig>) ?? {};
  const value: SmtpConfig = {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.user,
    from: config.from,
    pass: config.pass || existingValue.pass || "",
  };

  await prisma.appSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value },
    update: { value },
  });
  return value;
}

export async function isMailerConfigured() {
  return (await getSmtpConfig()) !== null;
}

export async function sendMail(to: string, subject: string, html: string) {
  const config = await getSmtpConfig();
  if (!config) throw new Error("smtp_not_configured");

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  await transporter.sendMail({ from: config.from, to, subject, html });
}
