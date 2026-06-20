import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureFiscalYearFolder } from "@/lib/ged";
import { z } from "zod";

const ExerciceSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = ExerciceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const folder = await ensureFiscalYearFolder(id, parsed.data.year);
  return NextResponse.json(folder, { status: 201 });
}
