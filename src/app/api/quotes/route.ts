import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const LineSchema = z.object({
  label: z.string().min(1),
  quantity: z.coerce.number().default(1),
  unitPrice: z.coerce.number().default(0),
  estimatedHours: z.coerce.number().default(0),
});

const QuoteSchema = z.object({
  clientId: z.string().optional(),
  prospectName: z.string().optional(),
  lines: z.array(LineSchema).min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = QuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { lines, ...quoteData } = parsed.data;
  const totalMonthlyFee = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const estimatedHours = lines.reduce((sum, l) => sum + l.estimatedHours, 0);

  const quote = await prisma.quote.create({
    data: {
      ...quoteData,
      createdBy: session.user.id,
      totalMonthlyFee,
      estimatedHours,
      lines: {
        create: lines.map((l) => ({
          label: l.label,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          estimatedHours: l.estimatedHours,
          totalPrice: l.quantity * l.unitPrice,
        })),
      },
    },
    include: { lines: true },
  });

  return NextResponse.json(quote, { status: 201 });
}
