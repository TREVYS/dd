import type { CaseStudy } from "@/lib/case-studies";

function initials(name: string): string {
  const words = name.replace(/&/g, " ").split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// Rendu visuel détaillé d'un retour d'expérience : un bloc par client, avec
// le besoin, l'intervention phase par phase et le résultat mis en avant.
export function CaseStudyView({ cs }: { cs: CaseStudy }) {
  return (
    <div className="mkt-case-list">
      {cs.missions.map((m) => (
        <div className="mkt-case" key={m.client}>
          <div className="mkt-case-head">
            <span className="mkt-case-avatar" aria-hidden="true">{initials(m.client)}</span>
            <div className="mkt-case-head-tx">
              <h2>{m.client}</h2>
              {m.context && <span className="ctx">{m.context}</span>}
            </div>
            <span className="mkt-case-badge">{m.secteur}</span>
          </div>

          <span className="mkt-case-lbl">Le besoin</span>
          {m.enjeu.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <span className="mkt-case-lbl">Notre intervention</span>
          <ol className="mkt-case-steps">
            {m.etapes.map((e, i) => (
              <li key={e.titre}>
                <span className="dot">{i + 1}</span>
                <h4>{e.titre}</h4>
                <p>{e.texte}</p>
              </li>
            ))}
          </ol>

          <div className="mkt-case-result">
            <span className="ic" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
            </span>
            <p>{m.resultat}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
