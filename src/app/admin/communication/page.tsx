import Link from "next/link";
import { CommsChat } from "./chat";
import { AlfredAvatar } from "../alfred-avatar";

export const dynamic = "force-dynamic";

export default function CommunicationPage() {
  return (
    <>
      <div className="adm-h ck-alf-h">
        <div className="ck-alf-id">
          <span className="ck-alf-av"><AlfredAvatar /></span>
          <div>
            <h1>Alfred <span className="ck-alf-on">en ligne</span></h1>
            <p>Votre directeur de communication : rédaction d&apos;articles, calendrier éditorial, réseaux sociaux.</p>
          </div>
        </div>
        <div className="adm-actions">
          <Link className="adm-btn ghost" href="/admin/reglages/alfred">Éduquer Alfred</Link>
          <Link className="adm-btn ghost" href="/admin/communication/calendrier">Brouillons</Link>
        </div>
      </div>
      <CommsChat />
    </>
  );
}
