// Équipe de consultants Trevys (profils de démonstration).
// Ajoutez une photo dans public/brand/team/<slug>.jpg — sinon un monogramme
// dégradé s'affiche automatiquement.
// Note : par choix éditorial, seuls les prénoms sont affichés sur le site.
export type Consultant = {
  slug: string;
  firstName: string;
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
    role: "Consultant AMOA SI / Finance",
    initials: "Fr",
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
    role: "Manager de transition · Responsable comptable",
    initials: "La",
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
    role: "Manager de transition · Contrôleuse de gestion",
    initials: "Ma",
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
    role: "Consultant ERP & Facturation électronique",
    initials: "Ka",
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
    role: "Manager de transition · Directrice financière",
    initials: "So",
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
    role: "Consultant Data & Pilotage (BI)",
    initials: "Th",
    intro: "Donner de la hauteur de vue grâce à la data.",
    expertises: ["Business Intelligence", "Data & tableaux de bord", "Automatisation", "Pilotage prédictif"],
    bio: [
      "Thomas conçoit les tableaux de bord et les flux de données qui font gagner du temps aux équipes finance. Il automatise le reporting et rend la donnée exploitable.",
      "Sa conviction : bien outillée, la finance devient un moteur de décision.",
    ],
  },
  {
    slug: "frederic",
    firstName: "Frédéric",
    role: "Manager de transition · Directeur administratif et financier",
    initials: "Fr",
    intro: "Tenir la barre financière dans les périodes de changement.",
    expertises: ["Direction administrative & financière", "Pilotage de la performance", "Contrôle interne", "Gouvernance"],
    bio: [
      "Frédéric prend la direction administrative et financière d'entreprises en transition : reprise, réorganisation, forte croissance. Il sécurise les comptes, structure les équipes et fiabilise le reporting de direction.",
      "Un cap clair, des indicateurs fiables et une équipe alignée : voilà ce qu'il laisse derrière lui.",
    ],
  },
  {
    slug: "olivier",
    firstName: "Olivier",
    role: "Consultant Organisation & processus",
    initials: "Ol",
    intro: "Remettre de la fluidité là où les processus se grippent.",
    expertises: ["Organisation & processus", "Optimisation des flux", "Procédures & contrôle interne", "Excellence opérationnelle"],
    bio: [
      "Olivier cartographie les processus, identifie les points de friction et redessine des organisations plus simples et plus robustes. Il intervient sur les fonctions support comme sur les opérations.",
      "Son credo : une organisation efficace se mesure au temps qu'elle rend aux équipes.",
    ],
  },
  {
    slug: "ali",
    firstName: "Ali",
    role: "Consultant Cybersécurité & conformité SI",
    initials: "Al",
    intro: "Protéger la donnée financière sans freiner l'activité.",
    expertises: ["Cybersécurité", "Conformité SI", "RGPD & protection des données", "Gestion des risques"],
    bio: [
      "Ali accompagne les directions financières et la DSI sur la sécurité et la conformité de leurs systèmes : cartographie des risques, mise en conformité RGPD, sécurisation des accès et des flux de données sensibles.",
      "Il conjugue exigence de sécurité et pragmatisme opérationnel pour des dispositifs réellement tenables.",
    ],
  },
  {
    slug: "sonia",
    firstName: "Sonia",
    role: "Manager de transition · Ressources humaines & paie",
    initials: "So",
    intro: "Sécuriser la paie et accompagner les équipes dans le changement.",
    expertises: ["Ressources humaines", "Paie & administration du personnel", "SIRH", "Accompagnement du changement"],
    bio: [
      "Sonia prend la responsabilité de fonctions RH et paie en transition : fiabilisation de la paie, déploiement d'un SIRH, réorganisation des équipes. Elle sécurise le social et l'humain en période de transformation.",
      "À l'écoute et structurée, elle allie rigueur réglementaire et attention aux équipes.",
    ],
  },
  {
    slug: "david",
    firstName: "David",
    role: "Consultant Trésorerie & financement",
    initials: "Da",
    intro: "Donner de la visibilité et de la marge de manœuvre au dirigeant.",
    expertises: ["Trésorerie", "Financement & levées de fonds", "Prévisionnel & cash", "Relation bancaire"],
    bio: [
      "David structure la gestion de trésorerie des PME et ETI : prévisionnel de cash, optimisation du BFR, recherche de financements et relation avec les partenaires bancaires.",
      "Son objectif : que le dirigeant pilote son cash avec sérénité et anticipe plutôt qu'il ne subisse.",
    ],
  },
  {
    slug: "jonathan",
    firstName: "Jonathan",
    role: "Consultant Transformation digitale",
    initials: "Jo",
    intro: "Digitaliser les processus et embarquer les équipes.",
    expertises: ["Transformation digitale", "Dématérialisation", "Conduite du changement", "Outils collaboratifs"],
    bio: [
      "Jonathan pilote des projets de digitalisation des fonctions finance et support : dématérialisation, automatisation des tâches à faible valeur, déploiement d'outils collaboratifs.",
      "Il met l'humain au cœur du projet pour que la technologie soit adoptée, pas subie.",
    ],
  },
  {
    slug: "raphael",
    firstName: "Raphaël",
    role: "Consultant Fusions-acquisitions & valorisation",
    initials: "Ra",
    intro: "Préparer, valoriser et sécuriser les opérations stratégiques.",
    expertises: ["Fusions-acquisitions", "Valorisation d'entreprise", "Due diligence", "Modélisation financière"],
    bio: [
      "Raphaël accompagne dirigeants et actionnaires dans leurs opérations de haut de bilan : valorisation, due diligence, modélisation, négociation. Il sécurise chaque étape jusqu'au closing.",
      "Une lecture financière fine et une vision stratégique au service des décisions structurantes.",
    ],
  },
  {
    slug: "constant",
    firstName: "Constant",
    role: "Consultant Data & Intelligence artificielle",
    initials: "Co",
    intro: "Mettre l'IA au service concret de la performance financière.",
    expertises: ["Intelligence artificielle", "Automatisation & agents métier", "Data engineering", "Cas d'usage finance"],
    bio: [
      "Constant conçoit et déploie des cas d'usage d'intelligence artificielle pour les directions financières : automatisation intelligente, agents métier, valorisation de la donnée.",
      "Il transforme des cas d'usage prometteurs en outils fiables et adoptés par les équipes.",
    ],
  },
];

export function getConsultant(slug: string): Consultant | undefined {
  return CONSULTANTS.find((c) => c.slug === slug);
}
