import Link from "next/link";
import { LogoMarquee } from "./_components/logo-marquee";
import { LiveFeed } from "./_components/live-feed";

const ArrowRight = () => (
  <svg viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="mkt-hero">
        <div className="mkt-hero-in mkt-sheet">
          <div className="mkt-visual">
            <div className="rings" />
            <div className="mkt-gcard c1">
              <div className="t">
                <div className="ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 3v18h18M7 14l3-3 3 2 5-6" />
                  </svg>
                </div>
                <div>
                  <div className="tk">Trésorerie</div>
                  <div className="nm">90 jours glissants</div>
                </div>
              </div>
              <div className="b">
                <div className="val">+12,4 %</div>
                <svg className="spark" viewBox="0 0 56 22" stroke="#12b76a">
                  <path d="M1 18 12 14 20 16 30 8 40 11 55 3" />
                </svg>
              </div>
            </div>
            <div className="mkt-gcard c2">
              <div className="t">
                <div className="ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4zM4 9h16M9 9v11" />
                  </svg>
                </div>
                <div>
                  <div className="tk">FEC analysés</div>
                  <div className="nm">ce mois-ci</div>
                </div>
              </div>
              <div className="b">
                <div className="val">1 240</div>
                <div style={{ fontSize: ".72rem", fontWeight: 700, color: "#12b76a" }}>
                  ↗ +18 %
                </div>
              </div>
            </div>
            <div className="mkt-gcard c3">
              <div className="t">
                <div className="ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2v20M6 6h9a3 3 0 010 6H6h11" />
                  </svg>
                </div>
                <div>
                  <div className="tk">Marge brute</div>
                  <div className="nm">consolidée</div>
                </div>
              </div>
              <div className="b">
                <div className="val">34,2 %</div>
                <svg className="spark" viewBox="0 0 56 22" stroke="#7C3AED">
                  <path d="M1 14 12 16 20 9 30 12 40 6 55 8" />
                </svg>
              </div>
            </div>
            <LiveFeed />
          </div>
          <div className="mkt-copy">
            <div className="hb">
              L&apos;expertise du chiffre,
              <br />
              la vitesse de la technologie.
            </div>
            <h1>
              Maîtrisez votre <em>comptabilité</em> avec Trevys
            </h1>
            <div className="mkt-hr" />
            <p className="sub">
              Des finances pilotées en temps réel, augmentées par l&apos;intelligence
              artificielle. Trevys rend votre gestion simple, rapide et
              parfaitement lisible.
            </p>
            <div className="mkt-act">
              <Link className="btn btn-gold" href="/rendez-vous">
                Prendre rendez-vous <ArrowRight />
              </Link>
              <Link className="btn btn-ghost" href="/le-cabinet">
                Nos expertises
              </Link>
            </div>
            <div className="mkt-hstats">
              <div className="mkt-hm">
                <div className="l">Cabinet indépendant</div>
                <div className="n">Depuis 2018</div>
              </div>
              <div className="mkt-hm">
                <div className="l">Expertise & conseil</div>
                <div className="n">2 métiers</div>
              </div>
              <div className="mkt-ginfo">
                <p>
                  Vos données hébergées en Europe et validées par un
                  expert-comptable, à chaque écriture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANDEAU LOGOS (clients + outils) */}
      <LogoMarquee />

      {/* EXPERTISES */}
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Nos expertises</span>
            <h2>
              Deux métiers, portés par l&apos;<em>innovation</em>
            </h2>
            <p>
              Expertise comptable et consulting, augmentés par les meilleures
              technologies du marché — et une expertise reconnue en facturation
              électronique.
            </p>
          </div>
          <div className="mkt-svc-grid">
            <Link className="mkt-svc" href="/expertise-comptable">
              <span className="num">01</span>
              <div className="ico">
                <svg viewBox="0 0 24 24">
                  <path d="M4 4h16v16H4zM4 9h16M9 9v11" />
                </svg>
              </div>
              <h3>Expertise comptable</h3>
              <p>
                Expertise comptable, audit, contrôle de gestion et juridique &amp;
                fiscal — pour sécuriser vos décisions et fiabiliser votre
                performance.
              </p>
              <span className="more">
                Explorer <ArrowRight />
              </span>
            </Link>
            <Link className="mkt-svc" href="/consulting">
              <span className="num">02</span>
              <div className="ico">
                <svg viewBox="0 0 24 24">
                  <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
                </svg>
              </div>
              <h3>Consulting</h3>
              <p>
                Conseil en transformation, systèmes d&apos;information Finance,
                projets ERP et facturation électronique, pour les PME, ETI et
                grands groupes.
              </p>
              <span className="more">
                Explorer <ArrowRight />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ÉCOSYSTÈME */}
      <section className="sec">
        <div className="wrap">
          <div className="shead">
            <span className="eyebrow">Le Groupe TREVYS</span>
            <h2>
              Un groupe mobilisé pour votre <em>réussite</em>
            </h2>
            <p>
              Autour du cabinet, les sociétés du Groupe TREVYS et ses partenaires
              couvrent l&apos;ensemble de vos enjeux — du pilotage prédictif à
              l&apos;édition de logiciels IA, jusqu&apos;au droit social.
            </p>
          </div>
          <div className="mkt-eco-grid">
            {[
              { t: "KLARE STUDIO", d: "Pilotage prédictif", u: "https://klare-studio.io/" },
              { t: "WELL&WIZ", d: "Conseil & freelances", u: "https://wellandwiz.com/" },
              { t: "URCA", d: "Commissariat aux comptes", u: "http://urca.io/" },
              { t: "SONAM IA", d: "Édition de logiciels IA", u: "https://wellandwiz-ai-site.vercel.app/" },
              { t: "PHOENIX", d: "Expertise comptable · international", u: "https://www.phoenix-conseil.net/" },
              { t: "DECA Paris", d: "Avocats en droit social", u: "https://www.decaparis.fr/" },
            ].map((e) => (
              <a className="mkt-eco-item" href={e.u} target="_blank" rel="noopener noreferrer" key={e.t}>
                <span className="t">{e.t}</span>
                <span className="d">{e.d}</span>
              </a>
            ))}
          </div>
          <Link className="btn btn-ghost" href="/notre-ecosysteme">
            Découvrir l&apos;écosystème <ArrowRight />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mkt-cta">
        <div className="mkt-cta-in">
          <h2>Parlons de votre ambition.</h2>
          <p>
            Un premier échange suffit à mesurer ce que Trevys peut changer pour
            votre entreprise.
          </p>
          <Link className="btn btn-gold" href="/rendez-vous">
            Prendre rendez-vous <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
