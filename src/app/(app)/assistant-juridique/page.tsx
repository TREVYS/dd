import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TYPE_LABELS, type LegalCaseType } from "@/lib/legal-cases";
import { NewLegalCaseButton } from "./new-case-button";
import { LegalCasesBoard } from "./legal-cases-board";

const TABS: { key: LegalCaseType; label: string }[] = [
  { key: "depot_comptes", label: TYPE_LABELS.depot_comptes },
  { key: "creation_societe", label: TYPE_LABELS.creation_societe },
  { key: "formalite", label: TYPE_LABELS.formalite },
];

export default async function AssistantJuridiquePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const sp = await searchParams;
  const type = TABS.find((t) => t.key === sp.type)?.key ?? TABS[0].key;

  const [cases, clients] = await Promise.all([
    prisma.legalCase.findMany({
      where: { type },
      include: { client: true, steps: { orderBy: { orderIndex: "asc" } } },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.client.findMany({ orderBy: { legalName: "asc" }, select: { id: true, legalName: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Assistant Juridique</h1>
        <NewLegalCaseButton clients={clients.map((c) => ({ id: c.id, name: c.legalName }))} />
      </div>

      <div className="flex gap-2 border-b border-gray-100">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/assistant-juridique?type=${t.key}`}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              type === t.key
                ? "bg-white border border-gray-100 border-b-0 text-brand"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <LegalCasesBoard
        cases={cases.map((c) => ({
          id: c.id,
          title: c.title,
          clientName: c.client.legalName,
          status: c.status,
          dueDate: c.dueDate ? c.dueDate.toISOString() : null,
          legalForm: c.legalForm,
          fiscalYear: c.fiscalYear,
          steps: c.steps.map((s) => ({ id: s.id, label: s.label, isDone: s.isDone })),
        }))}
      />
    </div>
  );
}
