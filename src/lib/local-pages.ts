// Pages « métier + localisation » : contenu de proximité destiné aux
// recherches locales (« expert-comptable Paris 16 », « DAF externalisé
// Paris »…). Volontairement discrètes : accessibles uniquement depuis le
// pied de page et le plan du site — jamais dans la navigation principale.

export type LocalFaq = { q: string; a: string };

export type LocalPage = {
  famille: "expert-comptable" | "conseil" | "situation";
  slug: string;
  h1: string;
  title: string; // balise <title>
  description: string; // meta description
  chapeau: string; // paragraphe d'introduction
  lieu: string; // zone couverte, pour les données structurées
  atouts: { titre: string; texte: string }[];
  etapes?: { titre: string; texte: string }[]; // parcours type, en 4 temps
  chiffres?: { valeur: string; legende: string }[]; // repères clés
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
    famille: "expert-comptable",
    slug: "e-commerce",
    h1: "Expert-comptable pour l'e-commerce",
    title: "Expert-comptable e-commerce — TVA, OSS, marketplaces | Trevys",
    description:
      "Cabinet spécialisé dans la comptabilité e-commerce : TVA intracommunautaire et guichet OSS, ventes à distance, marketplaces (Amazon, Shopify), rapprochement des encaissements Stripe et PayPal.",
    chapeau:
      "L'e-commerce concentre les sujets qui font trébucher une comptabilité classique : des milliers de transactions, plusieurs canaux de vente, des flux d'encaissement qui ne correspondent jamais au chiffre d'affaires, et une TVA qui change selon le pays de l'acheteur. Nous traitons ces sujets tous les jours, avec des outils qui absorbent le volume au lieu de le subir.",
    lieu: "France et ventes à distance dans l'Union européenne",
    atouts: [
      { titre: "TVA et guichet OSS maîtrisés", texte: "Franchissement du seuil de 10 000 € de ventes à distance, inscription au guichet unique OSS, ventilation par taux et par pays de destination, déclarations trimestrielles. Le poste où les redressements sont les plus fréquents — et les plus évitables." },
      { titre: "Marketplaces et encaissements", texte: "Amazon, Shopify, eBay, Stripe, PayPal : chaque plateforme a sa logique de commissions, de retenues et de versements différés. Nous rapprochons les versements réels du chiffre d'affaires réel, pour que votre marge soit juste." },
      { titre: "Stocks et marge par produit", texte: "Valorisation des stocks, coût de revient complet (achat, transport, douane, commissions, logistique), marge par référence. Vendre plus ne sert à rien si l'on ignore ce qui rapporte vraiment." },
    ],
    faq: [
      { q: "Comment fonctionne la TVA sur les ventes à l'étranger ?", a: "Au-delà de 10 000 € de ventes à distance annuelles vers l'Union européenne (tous pays confondus), la TVA devient due dans le pays de l'acheteur, à son taux. Le guichet unique OSS permet de tout déclarer en France plutôt que de s'immatriculer dans chaque pays : c'est la solution à privilégier dans la quasi-totalité des cas, à condition de ventiler correctement ses ventes par pays dès le départ." },
      { q: "Comment traitez-vous les volumes de transactions ?", a: "Par intégration automatisée des exports de vos plateformes et de vos processeurs de paiement, avec des contrôles de cohérence. Nous ne saisissons pas des milliers de lignes à la main : nous rapprochons des flux et nous investiguons les écarts. C'est ce qui rend l'e-commerce traitable à un coût raisonnable." },
      { q: "Faut-il un stock valorisé même en dropshipping ?", a: "En dropshipping pur, vous ne détenez pas de stock : la question ne se pose pas de la même façon, mais celle du fait générateur et du traitement des importations, oui. Dès qu'il y a détention de marchandises (y compris en entrepôt logistique tiers, type FBA), un inventaire valorisé à la clôture est obligatoire." },
    ],
    liens: [EC, RFE, RDV],
  },
  {
    famille: "expert-comptable",
    slug: "esn-et-societes-informatiques",
    h1: "Expert-comptable pour ESN et sociétés informatiques",
    title: "Expert-comptable ESN et éditeurs de logiciels — Trevys Advisory",
    description:
      "Cabinet pour ESN, sociétés de conseil IT et éditeurs de logiciels : suivi de la rentabilité par mission, TJM et taux d'occupation, CIR, revenus récurrents (SaaS), portage et sous-traitance.",
    chapeau:
      "Dans une ESN, la comptabilité générale ne dit presque rien de la santé de l'entreprise : ce qui compte, c'est le taux d'occupation des consultants, la marge par mission et le décalage entre facturation client et paiement des sous-traitants. Nous construisons ce pilotage-là, en plus d'un socle comptable irréprochable.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "Rentabilité par mission et par consultant", texte: "TJM, taux d'occupation (TACE), marge brute par mission et par client, suivi de l'inter-contrat. Les indicateurs qui font la différence entre une ESN qui croît et une ESN qui grossit." },
      { titre: "Travaux en cours et revenus récurrents", texte: "Reconnaissance du chiffre d'affaires sur les projets au forfait, factures à établir, produits constatés d'avance sur les abonnements SaaS. Un poste souvent mal traité, qui fausse le résultat d'un exercice sur l'autre." },
      { titre: "CIR, CII et statut JEI", texte: "Éligibilité des travaux de développement, valorisation des temps passés, constitution d'un dossier défendable en cas de contrôle. Un crédit d'impôt mal documenté est une créance fragile." },
    ],
    faq: [
      { q: "Comment suivre la rentabilité de chaque mission ?", a: "En rapprochant, mission par mission, le chiffre d'affaires facturé, le coût chargé du consultant affecté et les éventuels frais et sous-traitance. Cela suppose une comptabilité analytique légère mais rigoureuse, alimentée par vos outils de gestion des temps. Nous la mettons en place et la restituons dans un tableau de bord mensuel." },
      { q: "Le développement logiciel ouvre-t-il droit au CIR ?", a: "Pas automatiquement. Le développement d'une fonctionnalité, même complexe, ne suffit pas : il faut démontrer une incertitude technique et une démarche de résolution qui dépasse l'état de l'art. Le CII (crédit d'impôt innovation) est souvent plus adapté aux prototypes et nouveaux produits. Nous qualifions les travaux avant de chiffrer, pas l'inverse." },
      { q: "Comment traiter la sous-traitance et le portage ?", a: "Chaque contrat a ses incidences : TVA, responsabilité, requalification possible, et surtout impact sur la trésorerie puisque vous payez souvent le sous-traitant avant d'être payé par le client final. Nous sécurisons le traitement comptable et intégrons ce décalage dans le prévisionnel de trésorerie." },
    ],
    liens: [EC, CONSEIL, RDV],
  },
  {
    famille: "expert-comptable",
    slug: "societes-de-prestation-de-services",
    h1: "Expert-comptable pour les sociétés de prestation de services",
    title: "Expert-comptable prestation de services et conseil — Trevys",
    description:
      "Cabinet pour agences, sociétés de conseil et prestataires de services : TVA sur les encaissements, travaux en cours, gestion des acomptes, rentabilité par client et par mission.",
    chapeau:
      "Les sociétés de services vivent de leur temps et de leurs compétences : peu de stock, peu d'immobilisations, mais des sujets bien à elles — la TVA exigible à l'encaissement, les prestations commencées non facturées, les acomptes, et une rentabilité qui se joue sur quelques points de marge. Nous structurons ce pilotage et sécurisons les postes sensibles.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "TVA sur les encaissements", texte: "Pour les prestations de services, la TVA est en principe exigible au paiement, pas à la facturation. Une règle simple sur le papier, source d'erreurs récurrentes en pratique — surtout avec des acomptes, des clients étrangers ou des impayés." },
      { titre: "Travaux en cours et acomptes", texte: "Prestations engagées non facturées, factures à établir, produits constatés d'avance : le rattachement correct des produits à l'exercice change le résultat, l'impôt et l'image donnée à vos partenaires financiers." },
      { titre: "Rentabilité par mission et par client", texte: "Temps passé contre honoraires facturés, marge par client, détection des dossiers qui coûtent plus qu'ils ne rapportent. Dans une société de services, c'est souvent 20 % des clients qui absorbent 80 % des dépassements." },
    ],
    faq: [
      { q: "Quand la TVA est-elle exigible sur une prestation de services ?", a: "À l'encaissement du prix (ou de l'acompte), et non à l'émission de la facture — sauf option pour les débits, qui rend la TVA exigible à la facturation. L'option peut simplifier le suivi mais avance la sortie de trésorerie : le bon choix dépend de vos délais de paiement réels. Nous chiffrons les deux avant d'opter." },
      { q: "Comment traiter une prestation commencée mais non terminée à la clôture ?", a: "Elle doit être rattachée à l'exercice au cours duquel elle a été réalisée, via les travaux en cours ou les factures à établir, selon l'avancement et les termes du contrat. C'est le point le plus fréquemment redressé dans les sociétés de services, et celui qui fausse le plus les comparaisons d'un exercice à l'autre." },
      { q: "Faut-il facturer des acomptes ?", a: "Oui, dans la quasi-totalité des cas. L'acompte sécurise l'engagement du client et allège votre besoin en fonds de roulement — le poste qui met le plus souvent en difficulté les sociétés de services en croissance. Nous vous aidons à calibrer le pourcentage et l'échéancier selon votre cycle de production." },
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

  // --- Pages « situation » : intention forte, prospects déjà décidés --------
  {
    famille: "situation",
    slug: "changer-d-expert-comptable",
    h1: "Changer d'expert-comptable",
    title: "Changer d'expert-comptable : démarches, délais, à quel moment | Trevys",
    description:
      "Comment changer d'expert-comptable : la procédure réelle, le rôle de la lettre de courtoisie, les documents à récupérer, le bon moment dans l'exercice. Aucune démarche à votre charge.",
    chapeau:
      "Beaucoup de dirigeants restent des années dans un cabinet qui ne leur convient plus, persuadés que changer sera long, coûteux ou conflictuel. Ce n'est pas le cas : la procédure est encadrée par le code de déontologie, elle prend quelques jours, et c'est le nouveau cabinet qui s'en charge. Voici ce qui se passe réellement.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "Nous faisons les démarches", texte: "Nous adressons la lettre de courtoisie à votre confrère, récupérons les balances, historiques, déclarations et dossiers de travail. Vous n'avez rien à négocier ni à réclamer vous-même." },
      { titre: "À n'importe quel moment", texte: "Aucune obligation d'attendre la clôture. Nous reprenons en cours d'exercice à partir de la dernière balance, avec un point de contrôle sur les à-nouveaux et les postes en suspens." },
      { titre: "Un état des lieux offert", texte: "Avant tout engagement, nous examinons vos derniers comptes et vous disons franchement ce qui va, ce qui ne va pas, et ce que nous ferions différemment. Sans obligation de suite." },
    ],
    etapes: [
      { titre: "Premier échange", texte: "Trente minutes, sans engagement : votre situation, vos attentes, ce qui ne fonctionne plus. Nous vous disons franchement si nous sommes le bon cabinet pour vous." },
      { titre: "Lettre de mission", texte: "Périmètre, honoraires forfaitaires, interlocuteurs : tout est écrit avant de commencer. Vous savez exactement ce qui est inclus." },
      { titre: "Reprise du dossier", texte: "Lettre de courtoisie à votre confrère, récupération des balances, historiques et déclarations. Vous n'intervenez pas." },
      { titre: "État des lieux", texte: "Revue de vos derniers comptes, points de vigilance, plan d'action. La relation démarre sur une base saine et documentée." },
    ],
    chiffres: [
      { valeur: "0", legende: "démarche à votre charge" },
      { valeur: "≈ 15 jours", legende: "pour une reprise complète du dossier" },
      { valeur: "12 mois/12", legende: "le changement est possible toute l'année" },
    ],
        faq: [
      { q: "Faut-il prévenir soi-même son expert-comptable actuel ?", a: "Vous devez lui notifier la fin de la mission selon les termes de votre lettre de mission (souvent un préavis de trois mois, parfois moins). Mais le contact professionnel — la lettre de courtoisie et la demande de transmission du dossier — relève du nouveau cabinet. C'est une obligation déontologique entre confrères, prévue par le code de déontologie des experts-comptables." },
      { q: "L'ancien cabinet peut-il refuser de transmettre le dossier ?", a: "Il doit transmettre les documents qui vous appartiennent : pièces comptables, balances, grands livres, déclarations déposées. Il peut en revanche exercer un droit de rétention sur ses propres dossiers de travail en cas d'honoraires impayés. En pratique, régler le solde dû lève l'essentiel des blocages — et nous savons gérer les cas de tension." },
      { q: "Quel est le meilleur moment pour changer ?", a: "Juste après le dépôt des comptes annuels, c'est le plus confortable : le dossier est à jour et la reprise est nette. Mais si la relation ne fonctionne plus, ou si vous découvrez des erreurs, il n'y a aucune raison d'attendre douze mois de plus. Une reprise en cours d'exercice est parfaitement gérable." },
      { q: "Le changement coûte-t-il quelque chose ?", a: "Chez nous, la reprise du dossier et l'état des lieux initial ne sont pas facturés : ils font partie de l'entrée en relation. Vous ne payez que la mission qui commence, aux conditions fixées dans la lettre de mission." },
    ],
    liens: [EC, { label: "Nous écrire", href: "/contact" }, RDV],
  },
  {
    famille: "situation",
    slug: "creer-son-entreprise",
    h1: "Créer son entreprise : les choix qui comptent",
    title: "Créer son entreprise : SAS ou SARL, statut du dirigeant | Trevys",
    description:
      "Création d'entreprise : choisir entre SAS et SARL, statut social du dirigeant, capital, régime de TVA, premières échéances. L'accompagnement d'un expert-comptable dès le départ.",
    chapeau:
      "Créer une société prend quelques jours. Réparer un mauvais choix de départ prend des années — et coûte souvent bien plus cher que l'accompagnement qui l'aurait évité. Forme sociale, statut du dirigeant, répartition du capital, régime fiscal : voici les décisions qui vous suivront, et comment les prendre en connaissance de cause.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "SAS ou SARL : le vrai arbitrage", texte: "Ce n'est pas une question de mode. Le président de SAS est assimilé salarié (protection sociale plus large, charges plus élevées) ; le gérant majoritaire de SARL est travailleur indépendant (cotisations plus faibles, couverture plus légère, dividendes partiellement cotisés). Le bon choix dépend de votre rémunération cible et de vos besoins de protection." },
      { titre: "Capital, pacte et associés", texte: "Montant du capital, apports en nature, répartition entre associés, clauses de sortie : ce qui se règle facilement au départ devient inextricable après le premier désaccord." },
      { titre: "Les premières échéances", texte: "Régime de TVA, option à l'impôt sur les sociétés, exercice de référence, déclarations de démarrage : nous posons le calendrier de vos douze premiers mois pour qu'aucune échéance ne vous surprenne." },
    ],
    etapes: [
      { titre: "Cadrage du projet", texte: "Forme sociale, statut du dirigeant, régime fiscal, prévisionnel : les arbitrages structurants, chiffrés sur votre situation réelle." },
      { titre: "Statuts et formalités", texte: "Rédaction des statuts, dépôt du capital, annonce légale, dossier d'immatriculation au guichet unique : nous orchestrons l'ensemble." },
      { titre: "Options fiscales et sociales", texte: "Régime de TVA, option IS, affiliation du dirigeant : les choix des premières semaines, posés en connaissance de cause." },
      { titre: "Douze premiers mois", texte: "Calendrier des échéances, premiers tableaux de bord, point trimestriel : vous démarrez piloté, pas livré à vous-même." },
    ],
    chiffres: [
      { valeur: "1 €", legende: "de capital minimum — mais rarement une bonne idée" },
      { valeur: "≈ 1 semaine", legende: "pour immatriculer, dossier complet" },
      { valeur: "2 métiers", legende: "expertise comptable + conseil dès le départ" },
    ],
        faq: [
      { q: "SAS ou SARL : que choisir ?", a: "En simplifiant : la SAS offre une grande souplesse statutaire et une meilleure protection sociale au dirigeant, au prix de charges nettement plus élevées ; la SARL coûte moins cher en cotisations mais encadre davantage le fonctionnement, et les dividendes du gérant majoritaire sont soumis à cotisations au-delà de 10 % du capital. Si vous vous versez une rémunération significative, l'écart de charges pèse lourd ; si vous privilégiez la protection sociale et l'entrée d'investisseurs, la SAS s'impose souvent." },
      { q: "Quel capital social prévoir ?", a: "Légalement, 1 € suffit en SAS comme en SARL. En pratique, un capital trop faible nuit à votre crédibilité bancaire et, en SARL, réduit le seuil de 10 % en dessous duquel les dividendes échappent aux cotisations. Un capital cohérent avec les besoins de démarrage — souvent quelques milliers d'euros — est un meilleur signal." },
      { q: "Faut-il un expert-comptable dès la création ?", a: "Idéalement avant : les décisions structurantes se prennent au moment de la rédaction des statuts, pas après. Un accompagnement au démarrage coûte une fraction de ce que coûte une transformation de société ou une régularisation fiscale deux ans plus tard." },
      { q: "Quand la première déclaration de TVA intervient-elle ?", a: "Cela dépend du régime choisi à la création : franchise en base (pas de TVA facturée ni déclarée sous les seuils), régime simplifié (une déclaration annuelle avec acomptes) ou régime réel normal (déclaration mensuelle ou trimestrielle). Ce choix influe sur votre trésorerie et sur votre charge administrative : nous le calibrons selon votre volume d'activité prévisionnel." },
    ],
    liens: [EC, { label: "Simulateur rémunération dirigeant", href: "/simulateurs/remuneration-dirigeant" }, RDV],
  },
  {
    famille: "situation",
    slug: "ceder-ou-transmettre-son-entreprise",
    h1: "Céder ou transmettre son entreprise",
    title: "Céder son entreprise : valorisation, fiscalité, calendrier | Trevys",
    description:
      "Préparer la cession ou la transmission de son entreprise : valorisation, audit préparatoire, fiscalité de la plus-value, apport-cession, pacte Dutreil, calendrier réaliste.",
    chapeau:
      "Une cession se prépare deux à trois ans à l'avance. C'est le délai nécessaire pour présenter des comptes lisibles, réduire la dépendance de l'entreprise à votre personne, et arbitrer une fiscalité qui peut varier de plusieurs centaines de milliers d'euros selon le montage retenu. Commencer six mois avant, c'est accepter de vendre moins cher et de payer plus.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "Valorisation et préparation", texte: "Estimation par plusieurs méthodes, retraitement du résultat, identification de ce qui décote la valeur (dépendance au dirigeant, concentration client, retards déclaratifs) et plan de correction avant la mise en vente." },
      { titre: "Audit préparatoire", texte: "Nous passons votre dossier au crible avant que l'acquéreur ne le fasse : social, fiscal, juridique, contrats. Une mauvaise surprise découverte pendant les négociations coûte toujours plus cher qu'un point réglé en amont." },
      { titre: "Fiscalité de la cession", texte: "Plus-value professionnelle ou de cession de titres, abattements applicables, apport-cession, transmission familiale et pacte Dutreil : le choix du schéma se décide avant la vente, jamais après la signature." },
    ],
    etapes: [
      { titre: "Diagnostic et valorisation", texte: "Fourchette de valeur par plusieurs méthodes, retraitements, identification de ce qui décote — et du calendrier fiscal adapté." },
      { titre: "Préparation", texte: "Deux à trois exercices de comptes lisibles, réduction de la dépendance au dirigeant, mise en place du schéma fiscal (apport-cession, Dutreil…)." },
      { titre: "Négociation", texte: "Dossier de présentation, data room, échanges avec les acquéreurs, garantie d'actif et de passif : nous tenons la barre à vos côtés." },
      { titre: "Signature et après", texte: "Closing, accompagnement de la transition, réemploi du produit de cession : la vente n'est pas la fin de l'histoire patrimoniale." },
    ],
    chiffres: [
      { valeur: "2-3 ans", legende: "d'anticipation pour vendre dans de bonnes conditions" },
      { valeur: "75 %", legende: "d'abattement possible en transmission familiale (pacte Dutreil)" },
      { valeur: "31,4 %", legende: "PFU par défaut sur la plus-value de cession" },
    ],
        faq: [
      { q: "Combien vaut mon entreprise ?", a: "Il n'existe pas un prix mais une fourchette, obtenue en croisant plusieurs méthodes : multiple de l'excédent brut d'exploitation retraité, actualisation des flux de trésorerie prévisionnels, valeur patrimoniale, et comparables du secteur. Le retraitement du résultat — rémunération du dirigeant, charges non récurrentes, loyers intra-groupe — pèse souvent plus que le choix de la méthode." },
      { q: "Comment est imposée la plus-value de cession ?", a: "Pour une cession de titres par une personne physique, la plus-value relève par défaut du prélèvement forfaitaire unique de 31,4 % (12,8 % d'impôt et 18,6 % de prélèvements sociaux). Des dispositifs spécifiques peuvent modifier fortement la note : départ à la retraite du dirigeant, apport-cession avec report d'imposition, ou transmission familiale sous pacte Dutreil. Chacun impose des conditions strictes à respecter avant l'opération." },
      { q: "Quand faut-il commencer à préparer ?", a: "Deux à trois ans avant la cession envisagée. C'est le temps nécessaire pour produire deux ou trois exercices de comptes propres et cohérents, réduire votre indispensabilité opérationnelle, régler les points sensibles et mettre en place le schéma fiscal adapté — la plupart des dispositifs supposent une antériorité." },
      { q: "Qu'est-ce que le pacte Dutreil ?", a: "Un dispositif de transmission familiale permettant, sous conditions strictes d'engagement de conservation des titres et de poursuite de l'activité, un abattement de 75 % sur la valeur transmise pour le calcul des droits de mutation. L'économie est considérable, mais le formalisme est exigeant et le non-respect d'un engagement entraîne la remise en cause rétroactive." },
    ],
    liens: [CONSEIL, EC, RDV],
  },
  {
    famille: "situation",
    slug: "reprendre-une-entreprise",
    h1: "Reprendre une entreprise",
    title: "Reprendre une entreprise : audit d'acquisition, financement | Trevys",
    description:
      "Accompagnement à la reprise d'entreprise : audit d'acquisition (due diligence), analyse de la cible, montage de financement, holding de reprise et effet de levier.",
    chapeau:
      "Reprendre une entreprise, c'est acheter à la fois un potentiel et des risques — et les seconds sont rarement mis en avant dans le dossier de présentation. Notre rôle : vérifier ce qu'on vous vend, chiffrer ce que ça vaut vraiment, et construire un montage qui tienne après la reprise, pas seulement le jour de la signature.",
    lieu: "Paris et Île-de-France",
    atouts: [
      { titre: "Audit d'acquisition", texte: "Analyse des comptes des trois derniers exercices, qualité du chiffre d'affaires et récurrence, engagements hors bilan, passif social, litiges, dépendance client ou fournisseur. Ce que l'audit révèle sert aussi à renégocier le prix." },
      { titre: "Montage et financement", texte: "Holding de reprise et effet de levier, capacité de remboursement au regard des flux réels, dossier bancaire, garanties. Un montage qui étrangle la trésorerie de la cible est un échec programmé." },
      { titre: "Les cent premiers jours", texte: "Prise en main du pilotage, tableau de bord, sécurisation des équipes clés et des contrats. Nous restons présents après la signature — c'est là que tout se joue." },
    ],
    etapes: [
      { titre: "Ciblage et lettre d'intention", texte: "Analyse du dossier de présentation, premiers signaux d'alerte, lettre d'intention qui protège vos intérêts sans fermer la discussion." },
      { titre: "Audit d'acquisition", texte: "Comptable, fiscal, social, juridique : ce que vous achetez vraiment. Les constats servent la négociation du prix et des garanties." },
      { titre: "Financement et montage", texte: "Holding de reprise, dossier bancaire, calibrage de la dette sur les flux réels de la cible — un montage qui tient après la signature." },
      { titre: "Closing et 100 jours", texte: "Signature, prise en main du pilotage, sécurisation des équipes et des contrats clés. Nous restons présents quand tout se joue." },
    ],
    chiffres: [
      { valeur: "20-30 %", legende: "d'apport personnel généralement attendu par les banques" },
      { valeur: "3 exercices", legende: "de comptes audités avant de s'engager" },
      { valeur: "100 jours", legende: "la période qui décide de la réussite de la reprise" },
    ],
        faq: [
      { q: "Qu'est-ce qu'un audit d'acquisition ?", a: "Une vérification indépendante de la situation réelle de la cible : comptable et financière, fiscale, sociale et juridique. L'objectif n'est pas seulement de détecter des anomalies, mais de savoir ce que vous achetez vraiment — et d'objectiver la négociation du prix et de la garantie d'actif et de passif." },
      { q: "Qu'est-ce qu'une garantie d'actif et de passif ?", a: "Une clause par laquelle le cédant s'engage à vous indemniser si un passif né avant la cession apparaît après (redressement fiscal, litige prud'homal, dette non comptabilisée). Sa rédaction — plafond, franchise, durée, garantie bancaire adossée — est aussi importante que son existence." },
      { q: "Peut-on reprendre sans apport personnel ?", a: "C'est très rare. Les banques attendent généralement un apport de l'ordre de 20 à 30 % du prix, complété le cas échéant par des prêts d'honneur ou une intervention de Bpifrance. Le crédit-vendeur, quand le cédant l'accepte, réduit d'autant le besoin de financement bancaire et constitue un signal de confiance apprécié." },
      { q: "Faut-il créer une holding de reprise ?", a: "Dans la majorité des cas d'acquisition de titres, oui. La holding porte l'emprunt et le rembourse avec les dividendes remontés de la cible, sous le régime mère-fille qui limite fortement la double imposition. Le schéma doit être calibré sur la capacité de distribution réelle de la cible — c'est précisément ce que nous modélisons." },
    ],
    liens: [CONSEIL, EC, RDV],
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
