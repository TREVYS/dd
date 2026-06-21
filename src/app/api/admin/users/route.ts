import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { canManageCollaborators } from "@/lib/permissions";

const UserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  office: z.string().optional(),
  roleId: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  teamId: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session || !canManageCollaborators(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { firstName: "asc" },
    include: { role: true, manager: true, team: true },
  });
  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      jobTitle: u.jobTitle,
      department: u.department,
      office: u.office,
      status: u.status,
      roleId: u.roleId,
      roleName: u.role?.name ?? null,
      managerId: u.managerId,
      managerName: u.manager ? `${u.manager.firstName} ${u.manager.lastName}` : null,
      teamId: u.teamId,
      teamName: u.team?.name ?? null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !canManageCollaborators(session.user.role)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { password, ...rest } = parsed.data;
  const passwordHash = await bcrypt.hash(password || "trevys2024", 10);

  const user = await prisma.user.create({
    data: { ...rest, passwordHash },
  });
  return NextResponse.json(user, { status: 201 });
}
