// Secteurs d'intervention : contenu des cartes (références) et des pages de
// détail /secteurs/<slug>.
export type Sector = {
  slug: string;
  title: string;
  tagline: string; // une ligne (carte)
  intro: string; // accroche de la page
  enjeux: { t: string; d: string }[];
  missions: string[];
  clients?: string[]; // références liées (affichées si présentes)
  art: "banque" | "jeux" | "services" | "sante" | "association" | "industrie" | "immobilier";
};

export const SECTORS: Sector[] = [
  {
    slug: "banque-assurance",
    title: "Banque & Assurance",
    tagline: "Direction de programme RFE, manager de transition, gestion de projet IT / Finance.",
    intro:
      "Depuis plus de dix ans, nos consultants interviennent au cœur des directions financières des banques et des assureurs : programmes réglementaires, transformation des systèmes d'information Finance, pilotage de projets critiques. Nous parlons le langage de vos équipes — comptabilité bancaire, normes, flux — et celui de vos DSI.",
    enjeux: [
      { t: "Réforme de la facturation électronique", d: "Des volumétries massives, des SI complexes et des filiales multiples : la RFE est un programme d'entreprise, pas un simple chantier IT." },
      { t: "Transformation des SI Finance", d: "Migrations d'outils comptables, consolidation, interfaçages : sécuriser la trajectoire sans interrompre la production." },
      { t: "Continuité et transition", d: "Absorber un pic de charge ou un départ clé grâce à des managers de transition immédiatement opérationnels." },
    ],
    missions: [
      "Direction de programme réforme facturation électronique (RFE)",
      "Management de transition en direction comptable et financière",
      "Gestion de projet IT / Finance et MOA comptable",
      "Cadrage et migration de systèmes d'information Finance",
      "Fiabilisation des arrêtés et des processus comptables",
    ],
    clients: ["Banque Populaire", "Caisse d'Épargne", "BPCE Groupe", "BRED", "Natixis", "LCL", "La Banque Postale", "Cardif", "AG2R La Mondiale", "Edmond de Rothschild", "Oney", "BNP AM"],
    art: "banque",
  },
  {
    slug: "jeux-video",
    title: "Jeux vidéo",
    tagline: "Crédit d'impôt jeux vidéo, structuration financière et expertise comptable des studios.",
    intro:
      "Les studios de jeux vidéo ont une économie singulière : cycles de production longs, financements hybrides, crédit d'impôt spécifique. Nous accompagnons les studios de la création au scale-up, avec une expertise pointue du CIJV et des dispositifs de financement de la création.",
    enjeux: [
      { t: "Crédit d'impôt jeux vidéo (CIJV)", d: "Sécuriser l'éligibilité, constituer le dossier et maximiser l'assiette — sans risque en cas de contrôle." },
      { t: "Financement de la production", d: "Structurer les fonds propres, aides (CNC), préventes et coproductions pour tenir la trajectoire du studio." },
      { t: "Pilotage par projet", d: "Suivre le coût réel de chaque production et la rentabilité par titre." },
    ],
    missions: [
      "Expertise comptable et fiscale des studios",
      "Dossiers de crédit d'impôt jeux vidéo et agréments",
      "Structuration financière et prévisionnels de production",
      "Comptabilité analytique par projet / par titre",
      "Accompagnement à la levée de fonds",
    ],
    clients: ["Jeux&Co", "Ekin"],
    art: "jeux",
  },
  {
    slug: "services",
    title: "Services",
    tagline: "Expertise comptable, reporting et pilotage de la performance.",
    intro:
      "Conseil, agences, ESN, médias : dans les services, la valeur est humaine et la marge se joue sur le pilotage. Nous donnons aux dirigeants une vision claire — rentabilité par client, par mission, par équipe — et une comptabilité qui suit le rythme de l'activité.",
    enjeux: [
      { t: "Rentabilité par mission", d: "Savoir précisément ce que rapporte chaque client, chaque projet, chaque équipe." },
      { t: "Pilotage du BFR", d: "Facturation, encours, relances : maîtriser le cash dans des activités où tout est délai." },
      { t: "Croissance et structuration", d: "Passer les caps (recrutements, filiales, build-up) avec des fondations comptables solides." },
    ],
    missions: [
      "Expertise comptable et déclarations fiscales",
      "Reporting mensuel et tableaux de bord dirigeant",
      "Comptabilité analytique par client / par mission",
      "Prévisionnels, budgets et suivi du cash",
      "Accompagnement à la croissance et aux opérations",
    ],
    clients: ["Publicis", "Sportfive", "Roole", "Leano", "Jaji"],
    art: "services",
  },
  {
    slug: "sante",
    title: "Santé",
    tagline: "Expertise comptable, fiscalité maîtrisée et accompagnement des professions libérales.",
    intro:
      "Médecins, professions paramédicales, cliniques et acteurs de la e-santé : le secteur combine exigences réglementaires, fiscalité spécifique (BNC, SEL) et enjeux patrimoniaux. Nous sécurisons la conformité et optimisons la structure d'exercice, pour que vous restiez concentré sur vos patients.",
    enjeux: [
      { t: "Choix de la structure d'exercice", d: "BNC, SELARL, SPFPL : choisir et faire évoluer la structure au bon moment de la carrière." },
      { t: "Fiscalité maîtrisée", d: "Rémunération, dividendes, charges déductibles : une juste imposition, sans risque." },
      { t: "Patrimoine professionnel", d: "Préparer l'installation, l'association, la cession ou la retraite." },
    ],
    missions: [
      "Comptabilité BNC et sociétés d'exercice libéral",
      "Déclarations 2035 et liasses fiscales",
      "Étude de passage en société (SELARL, SPFPL)",
      "Prévisionnels d'installation et de développement",
      "Accompagnement à la cession et à la transmission",
    ],
    art: "sante",
  },
  {
    slug: "association",
    title: "Association",
    tagline: "Comptabilité, obligations spécifiques et sécurisation des comptes.",
    intro:
      "Associations, fonds de dotation, structures de l'ESS : votre comptabilité obéit à des règles propres (plan comptable associatif, fonds dédiés, subventions) et vos financeurs attendent une transparence exemplaire. Nous sécurisons vos comptes et valorisons votre gestion auprès de vos partenaires.",
    enjeux: [
      { t: "Conformité associative", d: "Plan comptable des associations, traitement des subventions, fonds dédiés et contributions volontaires." },
      { t: "Confiance des financeurs", d: "Des comptes annuels clairs et des comptes rendus financiers irréprochables pour vos subventions." },
      { t: "Gouvernance et contrôle interne", d: "Séparation des tâches et procédures adaptées aux équipes bénévoles et salariées." },
    ],
    missions: [
      "Tenue et révision comptable associative",
      "Comptes annuels et annexes spécifiques",
      "Comptes rendus financiers de subventions",
      "Accompagnement du trésorier et du bureau",
      "Préparation au commissariat aux comptes",
    ],
    clients: ["Handy'Up"],
    art: "association",
  },
  {
    slug: "industrie",
    title: "Industrie",
    tagline: "Contrôle de gestion, reporting et transformation des systèmes d'information Finance.",
    intro:
      "Coûts de revient, stocks, investissements : l'industrie exige une finance précise et outillée. Nous intervenons du contrôle de gestion industriel à la transformation des SI Finance, pour connecter l'atelier au compte de résultat.",
    enjeux: [
      { t: "Coûts de revient et marges", d: "Une comptabilité analytique fiable pour piloter prix, make or buy et investissements." },
      { t: "Stocks et inventaires", d: "Valorisation, dépréciation, inventaires : fiabiliser le poste le plus sensible du bilan." },
      { t: "SI Finance connecté", d: "ERP, GPAO, comptabilité : des flux intégrés, sans ressaisie ni écart inexpliqué." },
    ],
    missions: [
      "Contrôle de gestion industriel et calcul des coûts",
      "Reporting de gestion et tableaux de bord usine",
      "Transformation et intégration des SI Finance / ERP",
      "Budgets, prévisionnels et plans d'investissement",
      "Expertise comptable et fiscalité industrielle",
    ],
    clients: ["Lapeyre"],
    art: "industrie",
  },
  {
    slug: "immobilier",
    title: "Immobilier",
    tagline: "SCI, fiscalité immobilière et structuration patrimoniale.",
    intro:
      "Investisseurs, marchands de biens, foncières familiales : l'immobilier est autant une affaire de fiscalité que de pierre. Nous structurons vos opérations (SCI à l'IR ou à l'IS, holding, démembrement) et tenons une comptabilité qui sécurise vos choix patrimoniaux.",
    enjeux: [
      { t: "Choix du régime fiscal", d: "IR ou IS, location nue ou meublée (LMNP/LMP), TVA immobilière : chaque option engage l'avenir." },
      { t: "Structuration patrimoniale", d: "Holding, SCI, démembrement : organiser la détention pour la transmission." },
      { t: "Pilotage des opérations", d: "Marchands de biens et promotion : suivre marge, trésorerie et fiscalité opération par opération." },
    ],
    missions: [
      "Comptabilité et fiscalité des SCI (IR et IS)",
      "Location meublée : LMNP / LMP",
      "Structuration de holdings immobilières",
      "Comptabilité d'opérations de marchand de biens",
      "Accompagnement à la transmission du patrimoine",
    ],
    art: "immobilier",
  },
];

export function getSector(slug: string): Sector | undefined {
  return SECTORS.find((s) => s.slug === slug);
}
