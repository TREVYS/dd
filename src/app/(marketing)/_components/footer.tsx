import Link from "next/link";
import { Logo } from "./logo";
import { OecLogo } from "./oec-logo";
import { Newsletter } from "./newsletter";

export function Footer() {
  return (
    <footer className="mkt-foot">
      <div className="mkt-foot-in">
        <div className="mkt-news-band">
          <div>
            <h4 className="mkt-news-title">Recevez nos analyses</h4>
            <p className="mkt-news-sub">
              Décryptages sur la réforme, la fiscalité et l&apos;innovation
              comptable. Une inscription, pas de spam.
            </p>
          </div>
          <Newsletter />
        </div>
        <div className="mkt-foot-top">
          <div className="brand">
            <Logo />
            <p>
              Cabinet d&apos;expertise comptable &amp; de conseil. Expertise,
              conseil et innovation au service des dirigeants.
            </p>
            <div
              style={{
                marginTop: "1.6rem",
                display: "flex",
                alignItems: "center",
                gap: ".7rem",
              }}
            >
              <OecLogo className="mkt-oec" />
            </div>
            <p style={{ fontSize: ".72rem", color: "var(--ink3)", marginTop: ".5rem" }}>
              Membre de l&apos;Ordre des Experts-Comptables
            </p>
          </div>
          <div className="col">
            <h5>Nos métiers</h5>
            <Link href="/expertise-comptable">Expertise comptable</Link>
            <Link href="/consulting">Consulting</Link>
          </div>
          <div className="col">
            <h5>Expertises</h5>
            <Link href="/intelligence-artificielle">Intelligence artificielle</Link>
            <Link href="/facturation-electronique">Facturation électronique</Link>
            <Link href="/audit-organisationnel">Audit organisationnel</Link>
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
            <Link href="/espace-client">Espace client</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
          </div>
        </div>
        <div className="mkt-foot-bot">
          <p>
            © {new Date().getFullYear()} T.A. Trevys Advisory · EURL · 13 avenue
            Bugeaud, 75116 Paris · SIREN 839&nbsp;267&nbsp;804 · RCS Paris
          </p>
          <div className="mkt-foot-social">
            <a
              href="https://www.linkedin.com/company/trevys-advisory/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Trevys sur LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.8V21h-4z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
