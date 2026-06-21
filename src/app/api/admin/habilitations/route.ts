import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageHabilitations } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session || !canManageHabilitations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const [roles, permissions, rolePermissions] = await Promise.all([
    prisma.role.findMany({ orderBy: { name: "asc" } }),
    prisma.permission.findMany({ orderBy: { module: "asc" } }),
    prisma.rolePermission.findMany(),
  ]);

  return NextResponse.json({ roles, permissions, rolePermissions });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageHabilitations(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { roleId, permissionId, enabled } = (await req.json()) as {
    roleId: string;
    permissionId: string;
    enabled: boolean;
  };

  if (enabled) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      update: {},
      create: { roleId, permissionId },
    });
  } else {
    await prisma.rolePermission.deleteMany({ where: { roleId, permissionId } });
  }

  return NextResponse.json({ ok: true });
}
