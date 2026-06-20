import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      assignedPartner: true,
      assignedManager: true,
      assignedCollaborator: true,
      contacts: true,
      tasks: { orderBy: { createdAt: "desc" }, take: 10 },
      documents: { orderBy: { createdAt: "desc" }, take: 10 },
      tickets: { orderBy: { createdAt: "desc" }, take: 10 },
      clientMissions: { include: { mission: true } },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {client.commercialName || client.legalName}
        </h1>
        <p className="text-sm text-gray-500">{client.legalName}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <InfoCard title="Identité">
          <Info label="SIREN" value={client.siren} />
          <Info label="Forme juridique" value={client.legalForm} />
          <Info label="Ville" value={client.city} />
        </InfoCard>
        <InfoCard title="Fiscalité">
          <Info label="Régime fiscal" value={client.taxRegime} />
          <Info label="Régime TVA" value={client.vatRegime} />
          <Info label="Clôture" value={client.fiscalYearEnd} />
        </InfoCard>
        <InfoCard title="Équipe">
          <Info
            label="Associé"
            value={
              client.assignedPartner
                ? `${client.assignedPartner.firstName} ${client.assignedPartner.lastName}`
                : null
            }
          />
          <Info
            label="Manager"
            value={
              client.assignedManager
                ? `${client.assignedManager.firstName} ${client.assignedManager.lastName}`
                : null
            }
          />
          <Info
            label="Collaborateur"
            value={
              client.assignedCollaborator
                ? `${client.assignedCollaborator.firstName} ${client.assignedCollaborator.lastName}`
                : null
            }
          />
        </InfoCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Missions</h2>
          <ul className="space-y-2 text-sm">
            {client.clientMissions.map((cm) => (
              <li key={cm.id} className="flex justify-between border-b border-gray-50 pb-2">
                <span>{cm.mission.name}</span>
                <span className="text-gray-400">{cm.status}</span>
              </li>
            ))}
            {client.clientMissions.length === 0 && (
              <p className="text-gray-400">Aucune mission affectée.</p>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Tâches récentes</h2>
          <ul className="space-y-2 text-sm">
            {client.tasks.map((t) => (
              <li key={t.id} className="flex justify-between border-b border-gray-50 pb-2">
                <span>{t.title}</span>
                <span className="text-gray-400">{t.status}</span>
              </li>
            ))}
            {client.tasks.length === 0 && (
              <p className="text-gray-400">Aucune tâche.</p>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Documents récents</h2>
          <ul className="space-y-2 text-sm">
            {client.documents.map((d) => (
              <li key={d.id} className="flex justify-between border-b border-gray-50 pb-2">
                <span>{d.name}</span>
                <span className="text-gray-400">{d.fiscalYear ?? ""}</span>
              </li>
            ))}
            {client.documents.length === 0 && (
              <p className="text-gray-400">Aucun document.</p>
            )}
          </ul>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-semibold mb-3">Tickets</h2>
          <ul className="space-y-2 text-sm">
            {client.tickets.map((tk) => (
              <li key={tk.id} className="flex justify-between border-b border-gray-50 pb-2">
                <span>{tk.subject}</span>
                <span className="text-gray-400">{tk.status}</span>
              </li>
            ))}
            {client.tickets.length === 0 && (
              <p className="text-gray-400">Aucun ticket.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5">
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}
