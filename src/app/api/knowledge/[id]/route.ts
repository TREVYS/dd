import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { title, category, content, tags, status } = body as {
    title?: string;
    category?: string;
    content?: string;
    tags?: string;
    status?: string;
  };

  if (status === "validee" && session.user.role !== "Associé") {
    return NextResponse.json({ error: "seul un associé peut valider un article" }, { status: 403 });
  }

  const updated = await prisma.knowledgeArticle.update({
    where: { id },
    data: {
      title,
      category,
      content,
      tags,
      status,
      validatedBy: status === "validee" ? session.user.id : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.knowledgeArticle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
