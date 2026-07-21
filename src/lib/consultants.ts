// Équipe de consultants Trevys (profils de démonstration).
// Ajoutez une photo dans public/brand/team/<slug>.jpg — sinon un monogramme
// dégradé s'affiche automatiquement.
export type Consultant = {
  slug: string;
  firstName: string;
  lastName: string;
  role: string; // une ligne : ce qu'il/elle fait
  initials: string;
  intro: string; // phrase d'accroche
  expertises: string[];
  bio: string[];
};

export const CONSULTANTS: Consultant[] = [
  {
    slug: "franck",
    firstName: "Franck",
    lastName: "Mercier",
    role: "Consultant AMOA SI / Finance",
    initials: "FM",
    intro: "Le trait d'union entre les équipes métier et les systèmes d'information.",
    expertises: ["AMOA", "Systèmes d'information Finance", "Cadrage & recette", "Conduite du changement"],
    bio: [
      "Franck accompagne les directions financières dans la refonte et le pilotage de leurs systèmes d'information. Du cadrage du besoin métier jusqu'à la recette, il fait le lien entre les utilisateurs, la DSI et les intégrateurs.",
      "Son approche : partir du terrain, sécuriser les données, et embarquer les équipes pour que l'outil serve réellement le quotidien.",
    ],
  },
  {
    slug: "laurence",
    firstName: "Laurence",
    lastName: "Vidal",
    role: "Manager de transition · Responsable comptable",
    initials: "LV",
    intro: "Une clôture sereine, même dans les périodes de forte tension.",
    expertises: ["Direction comptable", "Clôtures", "Normes & contrôle interne", "Management d'équipe"],
    bio: [
      "Laurence prend la responsabilité de services comptables en transition : remplacement, montée en charge, réorganisation. Elle sécurise les clôtures et fiabilise les processus.",
      "Rigoureuse et pédagogue, elle laisse derrière elle des équipes autonomes et des procédures claires.",
    ],
  },
  {
    slug: "marwa",
    firstName: "Marwa",
    lastName: "Benali",
    role: "Manager de transition · Contrôleuse de gestion",
    initials: "MB",
    intro: "Transformer la donnée en décisions concrètes pour le dirigeant.",
    expertises: ["Contrôle de gestion", "Reporting & KPI", "Budgets & prévisions", "Pilotage de la performance"],
    bio: [
      "Marwa met en place les outils de pilotage qui manquent aux PME et ETI : tableaux de bord, budgets, analyse des écarts. Elle donne au dirigeant une lecture claire de sa performance.",
      "Son objectif : que chaque chiffre serve une décision.",
    ],
  },
  {
    slug: "karim",
    firstName: "Karim",
    lastName: "Ferrand",
    role: "Consultant ERP & Facturation électronique",
    initials: "KF",
    intro: "Préparer et déployer la réforme sans casser le quotidien.",
    expertises: ["Projets ERP", "Facturation électronique (RFE)", "Choix de PDP", "Gestion de projet"],
    bio: [
      "Karim pilote des projets ERP et accompagne les entreprises sur la réforme de la facturation électronique : cartographie des flux, choix de la plateforme, déploiement.",
      "Il conjugue vision technique et pragmatisme opérationnel pour tenir les délais.",
    ],
  },
  {
    slug: "sophie",
    firstName: "Sophie",
    lastName: "Lemaire",
    role: "Manager de transition · Directrice financière",
    initials: "SL",
    intro: "Structurer la fonction finance pour accompagner la croissance.",
    expertises: ["Direction financière", "Trésorerie & financement", "Structuration", "Relation investisseurs"],
    bio: [
      "Sophie intervient comme DAF de transition auprès de dirigeants en phase de croissance ou de transformation. Elle structure la fonction finance, sécurise la trésorerie et prépare les échéances stratégiques.",
      "Une interlocutrice de confiance pour le dirigeant comme pour les partenaires financiers.",
    ],
  },
  {
    slug: "thomas",
    firstName: "Thomas",
    lastName: "Nguyen",
    role: "Consultant Data & Pilotage (BI)",
    initials: "TN",
    intro: "Donner de la hauteur de vue grâce à la data.",
    expertises: ["Business Intelligence", "Data & tableaux de bord", "Automatisation", "Pilotage prédictif"],
    bio: [
      "Thomas conçoit les tableaux de bord et les flux de données qui font gagner du temps aux équipes finance. Il automatise le reporting et rend la donnée exploitable.",
      "Sa conviction : bien outillée, la finance devient un moteur de décision.",
    ],
  },
];

export function getConsultant(slug: string): Consultant | undefined {
  return CONSULTANTS.find((c) => c.slug === slug);
}
