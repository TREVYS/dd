// Pages « métier + localisation » : contenu de proximité destiné aux
// recherches locales (« expert-comptable Paris 16 », « DAF externalisé
// Paris »…). Volontairement discrètes : accessibles uniquement depuis le
// pied de page et le plan du site — jamais dans la navigation principale.

export type LocalFaq = { q: string; a: string };

export type LocalPage = {
  famille: "expert-comptable" | "conseil";
  slug: string;
  h1: string;
  title: string; // balise <title>
  description: string; // meta description
  chapeau: string; // paragraphe d'introduction
  lieu: string; // zone couverte, pour les données structurées
  atouts: { titre: string; texte: string }[];
  faq: LocalFaq[];
  liens: { label: string; href: string }[]; // maillage interne
};

const RDV = { label: "Prendre rendez-vous", href: "/rendez-vous" };
const RFE = { label: "Facturation électronique", href: "/facturation-electronique" };
const EC = { label: "Notre expertise comptable", href: "/expertise-comptable" };
const CONSEIL = { label: "Notre offre de conseil", href: "/consulting" };
const IA = { label: "Intelligence artificielle", href: "/intelligence-artificielle" };
const AUDIT = { label: "Audit organisationnel", href: "/audit-organisationnel" };

export const LOCAL_PAGES: LocalPage[] = [
  {
    famille: "expert-comptable",
    slug: "paris-16",
    h1: "Expert-comptable à Paris 16ᵉ",
    title: "Expert-comptable à Paris 16ᵉ — Trevys Advisory",
    description:
      "Cabinet d'expertise comptable installé rue Le Nôtre, Paris 16ᵉ. Comptabilité, fiscalité et conseil pour dirigeants, professions libérales et PME du 16ᵉ arrondissement.",
    chapeau:
      "Notre cabinet est installé au 1 rue Le Nôtre, dans le 16ᵉ arrondissement de Paris, à deux pas du Trocadéro. Nous accompagnons les dirigeants, professions libérales et sociétés du quartier — de la tenue courante à la stratégie fiscale — avec une exigence simple : des comptes à jour, des décisions éclairées, et un interlocuteur qui répond.",
    lieu: "Paris 16ᵉ arrondissement",
    atouts: [
      { titre: "Un cabinet de proximité", texte: "Rendez-vous dans nos bureaux rue Le Nôtre, ou en visioconférence si vous préférez. Vous savez qui suit votre dossier, et vous lui parlez directement." },
      { titre: "Comptabilité augmentée", texte: "Collecte automatisée des pièces, contrôles assistés par l'intelligence artificielle, tableaux de bord à jour : vous passez moins de temps sur la saisie, plus sur les décisions." },
      { titre: "Fiscalité et conseil", texte: "Choix de structure, rémunération du dirigeant, optimisation de la TVA, préparation d'une cession : nous traitons le sujet avant qu'il ne devienne urgent." },
    ],
    faq: [
      { q: "Où se situe votre cabinet dans le 16ᵉ ?", a: "Au 1 rue Le Nôtre, 75116 Paris, à proximité du Trocadéro et des stations Passy et Trocadéro. Nous recevons sur rendez-vous, du lundi au vendredi de 9 h à 19 h." },
      { q: "Accompagnez-vous les petites structures du quartier ?", a: "Oui : professions libérales, sociétés de conseil, commerces et holdings patrimoniales. Notre offre s'adapte à la taille de la structure — l'exigence reste la même." },
      { q: "Peut-on travailler à distance ?", a: "Entièrement. Vos pièces circulent par votre espace client sécurisé, les échanges se font en visioconférence, et vous gardez le même interlocuteur. La proximité géographique est un plus, pas une contrainte." },
    ],
    liens: [EC, RFE, RDV],
  },
  {
    famille: "expert-comptable",
    slug: "paris",
    h1: "Expert-comptable à Paris",
    title: "Expert-comptable à Paris — Cabinet Trevys Advisory",
    description:
      "Cabinet d'expertise comptable à Paris : comptabilité, fiscalité, paie et conseil pour PME, start-up et professions libérales. Membre de l'Ordre des Experts-Comptables Paris Île-de-France.",
    chapeau:
      "Trevys Advisory est un cabinet d'expertise comptable parisien, inscrit à l'Ordre des Experts-Comptables de Paris Île-de-France. Nous accompagnons des dirigeants de tous horizons — start-up en croissance, PME établies, professions libérales — avec la même conviction : un expert-comptable doit être un partenaire de décision, pas un producteur de liasses.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "Tous les métiers du chiffre", texte: "Tenue et révision, bilan et liasse fiscale, déclarations de TVA, paie et déclarations sociales, situations intermédiaires. Le socle, exécuté sans approximation." },
      { titre: "Le conseil en plus", texte: "Prévisionnel, structuration de groupe, arbitrage rémunération/dividendes, accompagnement de levée de fonds ou de cession. Nos consultants travaillent avec l'équipe comptable, pas à côté." },
      { titre: "Des outils qui font gagner du temps", texte: "Portail client, collecte automatisée, contrôles assistés par IA. Vos chiffres sont disponibles quand vous en avez besoin, pas trois mois après la clôture." },
    ],
    faq: [
      { q: "Quels types d'entreprises accompagnez-vous à Paris ?", a: "Principalement des PME, des sociétés de services et de conseil, des start-up et des professions libérales, de la création à la transmission. Nous intervenons aussi sur des groupes avec holding et filiales." },
      { q: "Comment se passe le changement de cabinet ?", a: "Nous nous chargeons de la reprise du dossier auprès de votre confrère (lettre de courtoisie comprise), de la récupération des balances et des historiques. Le changement se fait sans rupture, à n'importe quel moment de l'exercice." },
      { q: "Vos honoraires sont-ils forfaitaires ?", a: "Oui, sur la base d'une lettre de mission claire : vous savez ce qui est inclus et ce qui ne l'est pas. Pas de facturation à la surprise en fin d'année." },
    ],
    liens: [EC, CONSEIL, RDV],
  },
  {
    famille: "expert-comptable",
    slug: "professions-liberales-sante",
    h1: "Expert-comptable des professions libérales de santé",
    title: "Expert-comptable BNC santé (médecins, kinés, dentistes) — Trevys",
    description:
      "Cabinet spécialisé dans la comptabilité BNC des professions de santé : médecins, chirurgiens-dentistes, kinésithérapeutes, sages-femmes. Déclaration 2035, SEL, SCM, passage en société.",
    chapeau:
      "Les professionnels de santé n'ont ni le temps ni l'envie de décoder la fiscalité BNC. Nous prenons en charge la déclaration 2035, la gestion des rétrocessions et des remplacements, la SCM ou la SEL, et les arbitrages qui comptent vraiment : rester en libéral ou passer en société, préparer une association, sécuriser un départ en retraite.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "Déclaration 2035 maîtrisée", texte: "Recettes, rétrocessions d'honoraires, frais de véhicule, amortissement du matériel : chaque poste est traité selon la doctrine applicable aux professions de santé, pas selon un modèle générique." },
      { titre: "SEL, SCM, SISA", texte: "Choix de la structure, rédaction du prévisionnel, arbitrage entre rémunération et dividendes, entrée ou sortie d'un associé : nous accompagnons les moments qui structurent une carrière." },
      { titre: "Une charge mentale en moins", texte: "Échéances déclaratives suivies, alertes en amont, réponses claires. Vous soignez, nous tenons le calendrier." },
    ],
    faq: [
      { q: "Faut-il passer en SEL ?", a: "Cela dépend du niveau de bénéfice, de vos besoins de trésorerie personnelle et de vos projets (association, investissement, transmission). Le passage en société permet de piloter la rémunération et d'atténuer la pression fiscale, mais crée des obligations nouvelles. Nous chiffrons les deux scénarios avant de trancher." },
      { q: "Gérez-vous les remplaçants et les rétrocessions ?", a: "Oui, y compris le traitement des rétrocessions d'honoraires, les contrats de remplacement et leur incidence sur la 2035 comme sur les cotisations." },
      { q: "Êtes-vous adhérent d'une association agréée ?", a: "Nous travaillons avec les principales AGA et nous nous chargeons des obligations liées à votre adhésion. Nous vous dirons aussi, chiffres à l'appui, si elle reste pertinente dans votre situation." },
    ],
    liens: [EC, { label: "Nous contacter", href: "/contact" }, RDV],
  },
  {
    famille: "expert-comptable",
    slug: "start-up-et-jeunes-entreprises",
    h1: "Expert-comptable pour start-up et jeunes entreprises",
    title: "Expert-comptable start-up à Paris — Trevys Advisory",
    description:
      "Accompagnement comptable et financier des start-up : création, BSPCE, CIR/JEI, prévisionnel, préparation de levée de fonds, reporting investisseurs.",
    chapeau:
      "Une start-up n'a pas les mêmes besoins qu'une PME installée : la comptabilité doit suivre le rythme, et surtout produire les chiffres qu'attendent les investisseurs. Nous accompagnons les fondateurs de la création à la levée, avec le vocabulaire et les délais de leur écosystème.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "De la création à la série A", texte: "Choix de la structure, pacte d'associés, BSPCE, prévisionnel, business plan financier, data room : nous préparons les documents que vos investisseurs vont réellement examiner." },
      { titre: "CIR, JEI, subventions", texte: "Éligibilité, sécurisation du dossier, suivi des dépenses de recherche : les dispositifs d'aide sont puissants à condition d'être documentés correctement dès le départ." },
      { titre: "Reporting mensuel", texte: "Runway, burn, marge brute, cohortes : un tableau de bord lisible tous les mois, pas un bilan découvert un an plus tard." },
    ],
    faq: [
      { q: "À partir de quand faut-il un expert-comptable ?", a: "Dès la création, idéalement avant. Les choix faits au démarrage (forme sociale, répartition du capital, régime fiscal, statut du dirigeant) sont coûteux à corriger ensuite." },
      { q: "Savez-vous produire un reporting pour investisseurs ?", a: "Oui : reporting mensuel ou trimestriel avec les indicateurs attendus (burn rate, runway, ARR/MRR, marge brute), au format exploitable par votre board." },
      { q: "Accompagnez-vous les demandes de CIR ?", a: "Oui, du test d'éligibilité au montage du dossier et au suivi des justificatifs, en lien avec vos équipes techniques. Un CIR mal documenté est un risque en cas de contrôle." },
    ],
    liens: [EC, CONSEIL, RDV],
  },
  {
    famille: "conseil",
    slug: "daf-externalise-paris",
    h1: "DAF externalisé à Paris",
    title: "DAF externalisé à Paris — Direction financière à temps partagé",
    description:
      "Direction financière externalisée à Paris : pilotage de la performance, trésorerie, prévisionnel, relations bancaires et investisseurs. À temps partagé, pour PME et ETI.",
    chapeau:
      "Beaucoup de PME ont besoin d'une direction financière, mais pas d'un directeur financier à temps plein. Le DAF externalisé apporte la compétence quand elle est nécessaire : structurer le pilotage, sécuriser la trésorerie, préparer une opération. Quelques jours par mois, avec un vrai niveau d'exigence.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "Pilotage de la performance", texte: "Construction des indicateurs qui comptent dans votre métier, tableau de bord mensuel, analyse des écarts et plan d'action. Le chiffre sert à décider, pas à commenter le passé." },
      { titre: "Trésorerie et financement", texte: "Prévisionnel de trésorerie glissant, négociation bancaire, recherche de financement, gestion du BFR. Les tensions se voient venir plusieurs mois à l'avance." },
      { titre: "Opérations structurantes", texte: "Croissance externe, levée de fonds, cession, restructuration : nous préparons les dossiers et tenons la barre pendant l'opération." },
    ],
    faq: [
      { q: "Combien de temps par mois ?", a: "Le plus souvent 2 à 6 jours par mois selon la taille et l'actualité de l'entreprise, avec une montée en charge ponctuelle lors d'une opération (levée, cession, refinancement)." },
      { q: "Quelle différence avec un expert-comptable ?", a: "L'expert-comptable produit et certifie l'information financière. Le DAF externalisé l'utilise pour piloter : budgets, trésorerie, marges, financement, relations bancaires. Chez nous, les deux travaillent ensemble — c'est précisément l'intérêt." },
      { q: "À partir de quelle taille est-ce pertinent ?", a: "En général à partir de 2 M€ de chiffre d'affaires, ou plus tôt en cas de forte croissance, de multi-sites ou d'opération en préparation." },
    ],
    liens: [CONSEIL, AUDIT, RDV],
  },
  {
    famille: "conseil",
    slug: "conseil-facturation-electronique-paris",
    h1: "Conseil en facturation électronique à Paris",
    title: "Accompagnement facturation électronique (RFE) à Paris — Trevys",
    description:
      "Accompagnement indépendant à la réforme de la facturation électronique : diagnostic, choix de Plateforme Agréée, cartographie des flux, conduite du changement. Échéances 2026-2027.",
    chapeau:
      "La réforme de la facturation électronique n'est pas un sujet informatique : c'est un projet d'organisation, avec des échéances légales fermes. Nous intervenons en tiers indépendant — nous ne vendons aucune plateforme — pour cartographier vos flux, choisir la bonne Plateforme Agréée et embarquer vos équipes.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "Diagnostic et cartographie", texte: "Analyse de vos flux de facturation (clients, fournisseurs, cas particuliers), identification des points de rupture, évaluation de l'écart avec les exigences du dispositif." },
      { titre: "Choix de Plateforme Agréée", texte: "Cahier des charges, consultation du marché, grille de comparaison objective. Le choix vous appartient : nous n'avons aucun accord commercial avec un éditeur." },
      { titre: "Conduite du changement", texte: "Formation des équipes comptables et commerciales, procédures cibles, tests, documentation. Une réforme réussie se voit dans les usages, pas dans un rapport." },
    ],
    faq: [
      { q: "Quand faut-il être prêt ?", a: "Toutes les entreprises assujetties à la TVA doivent pouvoir recevoir des factures électroniques au 1ᵉʳ septembre 2026. L'obligation d'émettre s'applique par vagues selon la taille, jusqu'en septembre 2027. Un projet sérieux demande 10 à 18 mois : le temps utile se compte à rebours." },
      { q: "Vendez-vous une plateforme ?", a: "Non, et c'est volontaire. Notre valeur tient à notre indépendance : nous vous aidons à choisir la plateforme adaptée à vos flux et à votre système d'information, sans intérêt à orienter la décision." },
      { q: "Que se passe-t-il si nous ne sommes pas prêts ?", a: "L'obligation reste, même si une doctrine de démarrage tolérante a été annoncée pour les entreprises de bonne foi qui documentent leurs difficultés. Au-delà des sanctions, le vrai risque est opérationnel : des factures rejetées, ce sont des encaissements retardés." },
    ],
    liens: [RFE, CONSEIL, RDV],
  },
  {
    famille: "conseil",
    slug: "audit-organisationnel-paris",
    h1: "Audit organisationnel à Paris",
    title: "Audit organisationnel et des processus à Paris — Trevys",
    description:
      "Audit organisationnel pour PME et ETI à Paris : diagnostic des processus, contrôle interne, efficacité de la fonction finance, plan d'action priorisé.",
    chapeau:
      "Quand les délais s'allongent, que les erreurs se répètent ou que la croissance fait craquer l'organisation, le problème est rarement chez les personnes : il est dans les processus. Notre audit organisationnel identifie où le temps et l'argent se perdent, et par quoi commencer.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "Diagnostic factuel", texte: "Entretiens, observation des flux réels, mesure des délais et des reprises. Nous décrivons l'organisation telle qu'elle fonctionne, pas telle qu'elle est censée fonctionner." },
      { titre: "Contrôle interne", texte: "Séparation des tâches, circuits de validation, sécurisation des paiements, piste d'audit fiable. Prévenir la fraude et l'erreur sans paralyser l'activité." },
      { titre: "Plan d'action priorisé", texte: "Des recommandations chiffrées, hiérarchisées par effort et par impact — et si vous le souhaitez, notre accompagnement dans la mise en œuvre." },
    ],
    faq: [
      { q: "Combien de temps dure un audit ?", a: "En général 3 à 6 semaines pour une PME, selon le périmètre et le nombre de sites. Nous privilégions un format court avec des restitutions intermédiaires plutôt qu'un rapport découvert à la fin." },
      { q: "Est-ce réservé aux grandes structures ?", a: "Non. Les PME de 20 à 200 personnes en tirent souvent le plus de valeur : ce sont elles qui subissent le plus les processus hérités de leurs débuts." },
      { q: "Que contient la restitution ?", a: "Une cartographie des processus, les dysfonctionnements constatés avec leur impact estimé, et un plan d'action priorisé. Le tout présenté à la direction, pas seulement transmis par e-mail." },
    ],
    liens: [AUDIT, IA, RDV],
  },
];

export function getLocalPage(famille: LocalPage["famille"], slug: string): LocalPage | undefined {
  return LOCAL_PAGES.find((p) => p.famille === famille && p.slug === slug);
}

export function localPagesOf(famille: LocalPage["famille"]): LocalPage[] {
  return LOCAL_PAGES.filter((p) => p.famille === famille);
}

export function localPagePath(p: LocalPage): string {
  return `/${p.famille}/${p.slug}`;
}
