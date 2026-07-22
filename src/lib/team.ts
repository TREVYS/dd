// Noyau dirigeant de Trevys : profils enrichis (résumé, grands chantiers,
// apport dans le groupe) affichés sur /le-cabinet et /le-cabinet/<slug>.
// Photos : pour l'instant des visuels de démonstration ("fake") hébergés en
// ligne, remplaçables par de vraies photos dans public/brand/team/<slug>.jpg.
export type Leader = {
  slug: string;
  name: string;
  firstName: string;
  role: string;
  initials: string;
  photo: string; // URL (démonstration) ou chemin local
  linkedin: string;
  apport: string; // son apport dans le groupe, en une formule
  intro: string; // phrase d'accroche
  resume: string[]; // résumé de parcours (paragraphes)
  chantiers: string[]; // grands chantiers menés
};

export const TEAM: Leader[] = [
  {
    slug: "john-levy",
    name: "John Lévy",
    firstName: "John",
    role: "Fondateur · Expert-comptable",
    initials: "JL",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    linkedin: "https://www.linkedin.com/company/trevys-advisory/",
    apport: "La vision",
    intro: "Donner au cabinet un cap : accompagner les dirigeants bien au-delà de la conformité.",
    resume: [
      "Expert-comptable, John a fondé Trevys en 2018 avec une conviction : la profession devait se réinventer pour rester utile aux dirigeants face aux transformations de leur environnement.",
      "Élu au Conseil régional de l'Ordre des experts-comptables Paris Île-de-France et enseignant en Master CCA, il porte une vision de l'expertise comptable augmentée par le conseil et la technologie.",
    ],
    chantiers: [
      "Création et structuration du cabinet et de son écosystème de sociétés.",
      "Positionnement de Trevys sur la réforme de la facturation électronique.",
      "Développement de l'offre de conseil et d'intelligence artificielle métier.",
    ],
  },
  {
    slug: "olivier-bonnin",
    name: "Olivier Bonnin",
    firstName: "Olivier",
    role: "Commissaire aux comptes · Data analyste · Transformation digitale",
    initials: "OB",
    photo: "https://randomuser.me/api/portraits/men/45.jpg",
    linkedin: "https://www.linkedin.com/company/trevys-advisory/",
    apport: "La pratique & l'expertise métier",
    intro: "Ancrer chaque décision dans la réalité technique et réglementaire du métier.",
    resume: [
      "Commissaire aux comptes et data analyste, Olivier apporte la profondeur technique du métier : audit, contrôle interne, fiabilité des données financières.",
      "Il pilote la transformation digitale des missions et fait le pont entre l'expertise comptable traditionnelle et les outils de demain.",
    ],
    chantiers: [
      "Industrialisation des travaux de révision et de contrôle qualité.",
      "Mise en place des outils data et de pilotage internes du groupe.",
      "Accompagnement des équipes sur la dématérialisation et l'automatisation.",
    ],
  },
  {
    slug: "walther-ottgen",
    name: "Walther Ottgen",
    firstName: "Walther",
    role: "Directeur de l'innovation",
    initials: "WO",
    photo: "https://randomuser.me/api/portraits/men/64.jpg",
    linkedin: "https://www.linkedin.com/company/trevys-advisory/",
    apport: "La veille technologique",
    intro: "Garder toujours une longueur d'avance sur les technologies qui transforment le métier.",
    resume: [
      "Walther explore, teste et sélectionne les technologies qui font la différence : intelligence artificielle, automatisation, nouveaux usages de la donnée.",
      "Sa mission : transformer une veille permanente en cas d'usage concrets, fiables et adoptés par les équipes et les clients.",
    ],
    chantiers: [
      "Déploiement des premiers agents d'intelligence artificielle métier.",
      "Sélection et intégration des outils du groupe (ERP, data, IA).",
      "Cadre de confiance pour une IA maîtrisée et souveraine.",
    ],
  },
  {
    slug: "jeremy-roch",
    name: "Jeremy Roch",
    firstName: "Jeremy",
    role: "Directeur commercial",
    initials: "JR",
    photo: "https://randomuser.me/api/portraits/men/76.jpg",
    linkedin: "https://www.linkedin.com/company/trevys-advisory/",
    apport: "L'exécution & le commercial",
    intro: "Transformer la vision en missions concrètes et en relations durables.",
    resume: [
      "Jeremy porte le développement commercial du cabinet et la relation client : comprendre le besoin du dirigeant, structurer l'offre et garantir la qualité de l'exécution.",
      "Il veille à ce que chaque engagement pris se traduise par des résultats concrets et une relation de confiance dans la durée.",
    ],
    chantiers: [
      "Structuration de l'offre commerciale et des parcours clients.",
      "Développement du portefeuille de clients et de partenaires.",
      "Coordination des équipes de consultants sur les missions.",
    ],
  },
];

export function getLeader(slug: string): Leader | undefined {
  return TEAM.find((m) => m.slug === slug);
}
