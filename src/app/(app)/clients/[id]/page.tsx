import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Mail, Phone, MessageCircle, Star } from "lucide-react";
import { NewContactButton } from "./new-contact-button";
import { EnrichButton } from "./enrich-button";

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
      contacts: { orderBy: [{ isPrimary: "desc" }, { lastName: "asc" }] },
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {client.commercialName || client.legalName}
            </h1>
            <p className="text-sm text-gray-500">{client.legalName}</p>
          </div>
          <EnrichButton clientId={client.id} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <InfoCard title="Identité">
          <Info label="SIREN" value={client.siren} />
          <Info label="Forme juridique" value={client.legalForm} />
          <Info label="Adresse" value={client.address} />
          <Info
            label="Ville"
            value={[client.postalCode, client.city].filter(Boolean).join(" ") || null}
          />
          <Info label="Client depuis" value={formatDate(client.clientSince)} />
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

      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Contacts</h2>
          <NewContactButton clientId={client.id} />
        </div>
        {client.contacts.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun contact enregistré.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {client.contacts.map((contact) => {
              const fullName = [contact.firstName, contact.lastName]
                .filter(Boolean)
                .join(" ");
              const initials = `${contact.firstName?.[0] ?? ""}${contact.lastName?.[0] ?? ""}`.toUpperCase();
              return (
                <div
                  key={contact.id}
                  id={`contact-${contact.id}`}
                  className="rounded-xl border border-gray-100 p-4 space-y-2 target:ring-2 target:ring-brand"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-brand/10 text-brand flex items-center justify-center text-sm font-semibold shrink-0">
                      {initials || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate flex items-center gap-1">
                        {fullName || "Contact"}
                        {contact.isPrimary && (
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {contact.role || contact.mandate || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail size={12} /> {contact.email || "—"}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone size={12} /> {contact.phone || "—"}
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MessageCircle size={12} /> {contact.whatsappPhone || "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5">
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

        <div className="glass-panel rounded-2xl p-5">
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

        <div className="glass-panel rounded-2xl p-5">
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

        <div className="glass-panel rounded-2xl p-5">
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
    <div className="glass-panel rounded-2xl p-5">
      <h2 className="font-semibold mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between text-sm gap-3">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-right">{value || "—"}</span>
    </div>
  );
}

function formatDate(date: Date | null) {
  return date ? date.toLocaleDateString("fr-FR") : null;
}
