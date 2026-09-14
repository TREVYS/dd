import type { Metadata } from "next";
import Link from "next/link";
import { SimulateurDividendes } from "./simulateur";
import { BreadcrumbJsonLd } from "../../_components/seo-jsonld";
import { FaqSection } from "../../_components/faq-section";
import { ANNEE, MAJ, PFU_IR, PFU_PS, PFU_TOTAL, ABATTEMENT_DIVIDENDES } from "@/lib/fiscal-2026";

export const metadata: Metadata = {
  title: `Simulateur PFU ou barème sur les dividendes ${ANNEE} | Trevys`,
  description:
    `Simulateur gratuit ${ANNEE} : comparez le prélèvement forfaitaire unique (flat tax) et l'option pour le barème progressif sur vos dividendes. Net perçu estimé selon votre situation.`,
  alternates: { canonical: "/simulateurs/dividendes-pfu-bareme" },
  openGraph: {
    title: `Simulateur d'imposition des dividendes : PFU ou barème (${ANNEE})`,
    description: "Flat tax ou option pour le barème progressif : quel régime vous laisse le plus net en poche ?",
    type: "website",
  },
};

const FAQ = [
  {
    q: "Qu'est-ce que le PFU (flat tax) sur les dividendes ?",
    a: `Le prélèvement forfaitaire unique est le régime appliqué par défaut à vos dividendes : un taux global de ${Math.round(PFU_TOTAL * 1000) / 10} % (${Math.round(PFU_IR * 1000) / 10} % d'impôt sur le revenu et ${Math.round(PFU_PS * 1000) / 10} % de prélèvements sociaux), sur la totalité du montant brut perçu. Votre banque ou votre société l'applique automatiquement, sauf option contraire de votre part lors de votre déclaration de revenus.`,
  },
  {
    q: "Qu'est-ce que l'option pour le barème progressif ?",
    a: `Vous pouvez renoncer au PFU et choisir d'ajouter vos dividendes à vos autres revenus, imposés au barème progressif de l'impôt sur le revenu. Dans ce cas, un abattement de ${Math.round(ABATTEMENT_DIVIDENDES * 100)} % s'applique sur le montant du dividende avant de l'ajouter à votre revenu imposable — mais les prélèvements sociaux restent dus sur 100 % du dividende brut, au même taux que sous le PFU.`,
  },
  {
    q: "Quand le barème progressif est-il plus intéressant que le PFU ?",
    a: "Schématiquement, dès que votre taux marginal d'imposition (le taux de la tranche la plus haute atteinte par vos revenus) est inférieur à environ 21 %, l'abattement de 40 % rend le barème plus avantageux. Au-delà, le PFU reste généralement préférable. C'est pour cela que la réponse dépend entièrement de vos autres revenus : ce simulateur les prend en compte pour positionner le dividende au bon endroit du barème.",
  },
  {
    q: "L'option pour le barème s'applique-t-elle à un seul dividende ?",
    a: "Non : c'est une option globale et irrévocable pour l'année, qui s'applique à l'ensemble de vos revenus de capitaux mobiliers (tous vos dividendes, mais aussi vos intérêts imposables). Vous ne pouvez pas choisir le barème pour un dividende et le PFU pour un autre la même année.",
  },
  {
    q: "La CSG déductible change-t-elle le calcul ?",
    a: "Oui, en votre faveur si vous optez pour le barème. Une fraction de la CSG (6,8 points sur les 9,2 points prélevés) devient déductible de votre revenu imposable — mais l'année suivante, sur votre déclaration N+1. C'est un avantage réel, non négligeable dans les cas limites, que ce simulateur ne chiffre pas par souci de simplicité : dans les situations proches de l'équilibre, il peut faire pencher la balance en faveur du barème.",
  },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", path: "/" },
          { name: "Simulateurs", path: "/simulateurs/dividendes-pfu-bareme" },
          { name: "PFU ou barème sur les dividendes" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: `Simulateur d'imposition des dividendes (PFU ou barème) ${ANNEE}`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            url: "https://www.trevys.fr/simulateurs/dividendes-pfu-bareme",
            description:
              "Comparer le prélèvement forfaitaire unique et l'option pour le barème progressif sur des dividendes perçus, selon les revenus du foyer.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            publisher: { "@id": "https://www.trevys.fr/#organization" },
          }),
        }}
      />

      <section className="sec">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <p className="eyebrow">Simulateur gratuit · Paramètres {ANNEE}</p>
          <h1 style={{ fontSize: "2.1rem", lineHeight: 1.2, margin: ".6rem 0 1.1rem" }}>
            Dividendes : PFU ou barème progressif, que choisir ?
          </h1>
          <p style={{ color: "var(--ink2)", lineHeight: 1.8, fontSize: "1.02rem" }}>
            Vos dividendes sont taxés par défaut au prélèvement forfaitaire unique (flat tax), mais
            vous pouvez opter pour le barème progressif de l&apos;impôt sur le revenu. Ce simulateur
            compare les deux régimes selon vos autres revenus, pour identifier lequel vous laisse le
            plus de net en poche.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 1040 }}>
          <SimulateurDividendes />
        </div>
      </section>

      <section className="sec">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="sim-sources">
            <h2>Paramètres et sources</h2>
            <p>
              Les valeurs utilisées proviennent exclusivement de sources officielles, vérifiées le{" "}
              {new Date(MAJ).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} :
            </p>
            <ul>
              <li>
                <b>Prélèvement forfaitaire unique</b> : {Math.round(PFU_TOTAL * 1000) / 10} % ({Math.round(PFU_IR * 1000) / 10} % + {Math.round(PFU_PS * 1000) / 10} %) —{" "}
                <a href="https://www.impots.gouv.fr/particulier/les-revenus-mobiliers" target="_blank" rel="noopener noreferrer">impots.gouv.fr</a>
              </li>
              <li>
                <b>Abattement de {Math.round(ABATTEMENT_DIVIDENDES * 100)} %</b> sur option pour le barème progressif —{" "}
                <a href="https://www.service-public.fr/particuliers/vosdroits/F33553" target="_blank" rel="noopener noreferrer">service-public.fr</a>
              </li>
              <li>
                <b>Barème de l&apos;impôt sur le revenu</b> (revenus 2025, imposition {ANNEE}) : 0 %, 11 %, 30 %, 41 %, 45 % —{" "}
                <a href="https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/comment-calculer-votre-impot-dapres-le-bareme-de-limpot-sur-le-revenu" target="_blank" rel="noopener noreferrer">economie.gouv.fr</a>,{" "}
                <a href="https://bofip.impots.gouv.fr/bofip/14954-PGP.html/ACTU-2026-00022" target="_blank" rel="noopener noreferrer">BOFiP</a>
              </li>
            </ul>
            <p className="sim-disclaimer">
              <b>Estimation indicative.</b> Le calcul suppose l&apos;absence d&apos;autres crédits ou
              réductions d&apos;impôt, et ne modélise pas l&apos;avantage différé de la CSG déductible
              en cas d&apos;option pour le barème (voir la FAQ ci-dessous). Ce simulateur ne constitue
              ni un conseil personnalisé, ni un engagement du cabinet. Pour un chiffrage opposable,
              utilisez le{" "}
              <a href="https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/simplifie/index.htm" target="_blank" rel="noopener noreferrer">
                simulateur officiel de l&apos;impôt sur le revenu
              </a>{" "}
              et{" "}
              <Link href="/rendez-vous">parlons-en</Link>.
            </p>
          </div>
        </div>
      </section>

      <FaqSection
        items={FAQ}
        path="/simulateurs/dividendes-pfu-bareme"
        intro={<h2>PFU ou barème : <em>les questions qui reviennent</em></h2>}
      />
    </>
  );
}
