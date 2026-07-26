import Link from "next/link";
import { listCampaigns } from "@/lib/newsletter-campaigns";
import { BrouillonsTabs } from "../brouillons-tabs";
import { deleteDraftCampaignAction } from "./actions";

export const dynamic = "force-dynamic";

// Onglet « Mailings » du module Brouillons : les campagnes en attente d'envoi.
export default function MailingDraftsPage() {
  const drafts = listCampaigns().filter((c) => c.status === "brouillon");

  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Brouillons</h1>
          <p>
            {drafts.length} mailing{drafts.length > 1 ? "s" : ""} en attente d&apos;envoi.
            Une fois envoyé, le mailing rejoint l&apos;historique du module Newsletter.
          </p>
        </div>
        <Link className="adm-btn" href="/admin/communication/newsletter">Préparer un mailing</Link>
      </div>

      <BrouillonsTabs />

      <div className="adm-card" style={{ padding: 0 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: "1.1rem" }}>Objet</th>
              <th>Créé le</th>
              <th style={{ textAlign: "right", paddingRight: "1.1rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, paddingLeft: "1.1rem" }}>
                  <Link href={`/admin/communication/newsletter/${c.id}`} className="adm-link">{c.subject}</Link>
                </td>
                <td className="muted">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</td>
                <td style={{ textAlign: "right", paddingRight: "1.1rem" }}>
                  <div className="adm-actions" style={{ justifyContent: "flex-end" }}>
                    <Link className="adm-btn ghost sm" href={`/admin/communication/newsletter/${c.id}`}>
                      Relire &amp; envoyer
                    </Link>
                    <form action={deleteDraftCampaignAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="adm-btn danger sm" type="submit">Supprimer</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {drafts.length === 0 && (
              <tr>
                <td colSpan={3} className="muted" style={{ padding: "1.4rem" }}>
                  Aucun mailing en brouillon — préparez-en un depuis le module Newsletter,
                  ou demandez à Alfred d&apos;en rédiger un.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
