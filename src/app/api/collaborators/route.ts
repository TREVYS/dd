import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { status: "active" },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });
  return NextResponse.json(users);
}
