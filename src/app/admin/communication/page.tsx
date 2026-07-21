import Link from "next/link";
import { CommsChat } from "./chat";

export const dynamic = "force-dynamic";

export default function CommunicationPage() {
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Directeur de communication</h1>
          <p>Votre agent IA : rédaction d&apos;articles, calendrier éditorial, réseaux sociaux.</p>
        </div>
        <Link className="adm-btn ghost" href="/admin/communication/calendrier">
          Voir le calendrier éditorial
        </Link>
      </div>
      <CommsChat />
    </>
  );
}
