import Link from "next/link";
import { BrandMark } from "./brand";

export function Footer() {
  return (
    <footer className="mkt-foot">
      <div className="mkt-foot-in">
        <div className="mkt-foot-top">
          <div className="brand">
            <BrandMark />
            <p>
              Cabinet d&apos;expertise comptable &amp; de conseil. Expertise,
              conseil et innovation au service des dirigeants.
            </p>
          </div>
          <div className="col">
            <h5>Expertises</h5>
            <Link href="/expertise-comptable">Expertise comptable</Link>
            <Link href="/consulting">Consulting</Link>
            <Link href="/facturation-electronique">Facturation électronique</Link>
          </div>
          <div className="col">
            <h5>Le cabinet</h5>
            <Link href="/le-cabinet">Le cabinet</Link>
            <Link href="/notre-ecosysteme">Notre écosystème</Link>
            <Link href="/references">Références</Link>
          </div>
          <div className="col">
            <h5>Ressources</h5>
            <Link href="/blog">Ressources</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/app">Espace client</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
          </div>
        </div>
        <div className="mkt-foot-bot">
          <p>
            © {new Date().getFullYear()} T.A. Trevys Advisory · EURL · 13 avenue
            Bugeaud, 75116 Paris · SIREN 839&nbsp;267&nbsp;804 · RCS Paris
          </p>
        </div>
      </div>
    </footer>
  );
}
