import Link from "next/link";
import { CommsChat } from "./chat";

export const dynamic = "force-dynamic";

export default function CommunicationPage() {
  return (
    <>
      <div className="adm-h">
        <div>
          <h1>Alfred 🎩</h1>
          <p>Votre directeur de communication : rédaction d&apos;articles, calendrier éditorial, réseaux sociaux.</p>
        </div>
        <div className="adm-actions">
          <Link className="adm-btn ghost" href="/admin/communication/alfred">Éduquer Alfred</Link>
          <Link className="adm-btn ghost" href="/admin/communication/calendrier">Calendrier</Link>
        </div>
      </div>
      <CommsChat />
    </>
  );
}
