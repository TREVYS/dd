import type { Metadata } from "next";
import Link from "next/link";
import { SimulateurRemuneration } from "./simulateur";
import { BreadcrumbJsonLd } from "../../_components/seo-jsonld";
import { FaqSection } from "../../_components/faq-section";
import { ANNEE, MAJ, PASS, PFU_TOTAL, IS_SEUIL_TAUX_REDUIT } from "@/lib/fiscal-2026";

export const metadata: Metadata = {
  title: `Simulateur rémunération dirigeant ${ANNEE} — salaire ou dividendes | Trevys`,
  description:
    `Simulateur gratuit ${ANNEE} : comparez rémunération et dividendes, gérant majoritaire (SARL) ou assimilé salarié (SAS). Net en poche estimé selon les paramètres officiels URSSAF et impots.gouv.fr.`,
  alternates: { canonical: "/simulateurs/remuneration-dirigeant" },
  openGraph: {
    title: `Simulateur rémunération du dirigeant ${ANNEE}`,
    description: "Salaire ou dividendes : estimez votre net en poche et comparez les statuts.",
    type: "website",
  },
};

const FAQ = [
  {
    q: "Vaut-il mieux se verser un salaire ou des dividendes ?",
    a: "Il n'existe pas de réponse universelle. Les dividendes subissent l'impôt sur les sociétés (15 % jusqu'à 42 500 € de bénéfice, 25 % au-delà) puis le prélèvement forfaitaire unique de 31,4 % : au total, la ponction dépasse souvent celle d'une rémunération, surtout dans les premières tranches d'imposition. La rémunération, elle, ouvre des droits à la retraite et à la prévoyance et se déduit du résultat imposable. Dans la plupart des cas, un mélange est optimal — et le point d'équilibre dépend de votre situation familiale, de vos autres revenus et de vos besoins de trésorerie personnelle.",
  },
  {
    q: "Les dividendes d'un gérant majoritaire sont-ils soumis à cotisations sociales ?",
    a: "Oui, en partie. Pour un gérant majoritaire de SARL, un associé unique d'EURL ou un associé de SNC soumis à l'impôt sur les sociétés, la fraction des dividendes qui dépasse 10 % du capital social — primes d'émission et sommes versées en compte courant incluses — est soumise aux cotisations sociales des travailleurs indépendants. En dessous de ce seuil, seuls les prélèvements sociaux s'appliquent. Le président de SAS n'est pas concerné : ses dividendes restent soumis au seul PFU.",
  },
  {
    q: "Qu'est-ce que le prélèvement forfaitaire unique (PFU) ?",
    a: `Aussi appelé « flat tax », c'est le régime par défaut des revenus de capitaux mobiliers. Depuis le 1ᵉʳ janvier ${ANNEE}, son taux global est de ${Math.round(PFU_TOTAL * 1000) / 10} % : 12,8 % au titre de l'impôt sur le revenu et 18,6 % au titre des prélèvements sociaux. Vous pouvez lui préférer le barème progressif — l'abattement de 40 % s'applique alors sur les dividendes — si cela vous est plus favorable, l'option étant globale pour tous vos revenus de placement de l'année.`,
  },
  {
    q: "Le simulateur tient-il compte de ma situation exacte ?",
    a: "Non, et c'est important : il applique des taux de charges moyens et suppose que vous n'avez pas d'autres revenus, ni crédit ou réduction d'impôt. Vos taux réels dépendent de votre activité, de votre caisse de retraite, de vos contrats de prévoyance et de votre historique. L'écart avec la réalité peut atteindre plusieurs milliers d'euros : considérez le résultat comme un ordre de grandeur destiné à cadrer la discussion, pas comme un calcul opposable.",
  },
  {
    q: "Quel est le plafond de la Sécurité sociale en 2026 ?",
    a: `Le plafond annuel (PASS) s'établit à ${PASS.toLocaleString("fr-FR")} € pour ${ANNEE}, soit 4 005 € par mois. Il sert de référence à de nombreux calculs : tranches de cotisations retraite, plafonds d'épargne salariale, indemnités journalières, seuils de contrats de prévoyance.`,
  },
];

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Accueil", path: "/" },
          { name: "Simulateurs", path: "/simulateurs/remuneration-dirigeant" },
          { name: "Rémunération du dirigeant" },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: `Simulateur de rémunération du dirigeant ${ANNEE}`,
            applicationCategory: "FinanceApplication",
            operatingSystem: "Web",
            url: "https://www.trevys.fr/simulateurs/remuneration-dirigeant",
            description:
              "Comparer rémunération et dividendes pour un gérant majoritaire ou un président de SAS, selon les paramètres fiscaux et sociaux en vigueur.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            publisher: { "@id": "https://www.trevys.fr/#organization" },
          }),
        }}
      />

      <section className="sec">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <p className="eyebrow">Simulateur gratuit · Paramètres {ANNEE}</p>
          <h1 style={{ fontSize: "2.1rem", lineHeight: 1.2, margin: ".6rem 0 1.1rem" }}>
            Rémunération ou dividendes : que reste-t-il vraiment ?
          </h1>
          <p style={{ color: "var(--ink2)", lineHeight: 1.8, fontSize: "1.02rem" }}>
            Chaque année, la même question revient : faut-il se verser un salaire, des dividendes,
            ou les deux ? Ce simulateur estime votre net en poche selon la répartition choisie, et
            compare les deux statuts de dirigeant. Il applique les paramètres officiels {ANNEE} :
            barème de l&apos;impôt sur le revenu, impôt sur les sociétés, prélèvement forfaitaire
            unique et plafond de la Sécurité sociale.
          </p>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 1040 }}>
          <SimulateurRemuneration />
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
                <b>Plafond annuel de la Sécurité sociale {ANNEE}</b> : {PASS.toLocaleString("fr-FR")} € —{" "}
                <a href="https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/plafonds-securite-sociale.html" target="_blank" rel="noopener noreferrer">Urssaf</a>,{" "}
                <a href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053143451" target="_blank" rel="noopener noreferrer">arrêté du 22 décembre 2025</a>
              </li>
              <li>
                <b>Barème de l&apos;impôt sur le revenu</b> (revenus 2025, imposition {ANNEE}) : 0 %, 11 %, 30 %, 41 %, 45 % —{" "}
                <a href="https://www.economie.gouv.fr/particuliers/impots-et-fiscalite/gerer-mon-impot-sur-le-revenu/comment-calculer-votre-impot-dapres-le-bareme-de-limpot-sur-le-revenu" target="_blank" rel="noopener noreferrer">economie.gouv.fr</a>,{" "}
                <a href="https://bofip.impots.gouv.fr/bofip/14954-PGP.html/ACTU-2026-00022" target="_blank" rel="noopener noreferrer">BOFiP</a>
              </li>
              <li>
                <b>Prélèvement forfaitaire unique</b> : {Math.round(PFU_TOTAL * 1000) / 10} % (12,8 % + 18,6 %) —{" "}
                <a href="https://www.impots.gouv.fr/particulier/les-revenus-mobiliers" target="_blank" rel="noopener noreferrer">impots.gouv.fr</a>
              </li>
              <li>
                <b>Impôt sur les sociétés</b> : 15 % jusqu&apos;à {IS_SEUIL_TAUX_REDUIT.toLocaleString("fr-FR")} € de bénéfice
                pour les PME éligibles, 25 % au-delà —{" "}
                <a href="https://entreprendre.service-public.fr/vosdroits/F23575" target="_blank" rel="noopener noreferrer">service-public.fr</a>
              </li>
              <li>
                <b>Dividendes des travailleurs indépendants</b> : cotisations sur la fraction excédant 10 % du capital social —{" "}
                <a href="https://bpifrance-creation.fr/encyclopedie/fiscalite-lentreprise/generalites/regime-fiscal-social-dividendes" target="_blank" rel="noopener noreferrer">Bpifrance Création</a>
              </li>
            </ul>
            <p className="sim-disclaimer">
              <b>Estimation indicative.</b> Les taux de cotisations retenus sont des moyennes
              (environ 45 % du revenu net pour un travailleur non salarié ; environ 54 % de charges
              patronales et 22 % de charges salariales pour un assimilé salarié). Le calcul suppose
              l&apos;absence d&apos;autres revenus dans le foyer, de crédits et de réductions
              d&apos;impôt, et l&apos;application du PFU aux dividendes. Ce simulateur ne constitue
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
        path="/simulateurs/remuneration-dirigeant"
        intro={<h2>Salaire ou dividendes : <em>les questions qui reviennent</em></h2>}
      />
    </>
  );
}
