import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PipelineBoard } from "./pipeline-board";

const COLUMNS = [
  { key: "prospects", label: "Prospects" },
  { key: "en_attente", label: "En attente" },
  { key: "clients_actifs", label: "Clients actifs" },
];

export default async function PipelineCommercialPage() {
  const session = await auth();
  const isPartner = session?.user?.role === "Associé";

  const prospects = await prisma.prospect.findMany({
    include: { assignedTo: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Opportunités</h1>

      <PipelineBoard
        columns={COLUMNS}
        isPartner={isPartner}
        prospects={prospects.map((p) => ({
          id: p.id,
          companyName: p.companyName,
          contactName: p.contactName,
          contactEmail: p.contactEmail,
          estimatedValue: p.estimatedValue ? Number(p.estimatedValue) : null,
          source: p.source,
          pipelineStage: p.pipelineStage,
          assignedToName: p.assignedTo ? `${p.assignedTo.firstName} ${p.assignedTo.lastName}` : null,
        }))}
      />
    </div>
  );
}
