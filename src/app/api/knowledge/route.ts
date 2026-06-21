import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const KnowledgeSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  content: z.string().min(1),
  tags: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q") || undefined;

  const articles = await prisma.knowledgeArticle.findMany({
    where: {
      category: category || undefined,
      title: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    include: { creator: true, validator: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = KnowledgeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const isPartner = session.user.role === "Associé";
  const article = await prisma.knowledgeArticle.create({
    data: {
      ...parsed.data,
      createdBy: session.user.id,
      status: isPartner ? "validee" : "draft",
      validatedBy: isPartner ? session.user.id : null,
    },
  });
  return NextResponse.json(article, { status: 201 });
}
