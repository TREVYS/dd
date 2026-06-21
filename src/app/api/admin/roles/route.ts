import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canManageCollaborators } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session || !canManageCollaborators(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(roles);
}
