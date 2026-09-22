// Détail des expertises du pôle conseil (hors facturation électronique, qui a
// sa propre page dédiée /facturation-electronique). Contenu centré sur ce qui
// distingue Trevys : équipes pluridisciplinaires, agilité entre comptabilité
// et informatique, profils hybrides, et une méthodologie éprouvée depuis la
// création du cabinet — sans mention de durée ni de repère chiffré.

export type ConsultingExpertise = {
  slug: string;
  t: string;
  chapeau: string;
  intro: string[];
  equipe: string[];
  agilite: { titre: string; texte: string };
  methode: { titre: string; texte: string }[];
};

export const CONSULTING_EXPERTISES: ConsultingExpertise[] = [
  {
    slug: "si-finance",
    t: "Systèmes d'information Finance",
    chapeau: "Cadrer, refondre et piloter les systèmes d'information Finance, du besoin métier au déploiement.",
    intro: [
      "Un système d'information Finance ne se choisit pas dans un catalogue éditeur : il se construit à partir de vos flux comptables réels, de vos process de clôture et des décisions que vos équipes doivent pouvoir prendre au quotidien. Trop de projets échouent parce qu'ils partent d'une fiche produit plutôt que d'un dossier comptable ouvert sur la table.",
      "C'est précisément là que notre positionnement change la donne. Nous n'arrivons pas sur votre système d'information en simples techniciens : nous savons ce que signifie une provision mal paramétrée sur une clôture, ce que coûte une interface bancale entre votre outil de facturation et votre grand livre, ou pourquoi tel report automatique ne colle jamais tout à fait à la réalité de votre activité. Chaque recommandation part de cette compréhension fine des chiffres, avant de devenir une spécification technique.",
    ],
    equipe: [
      "Chaque mission de système d'information Finance mobilise une équipe pluridisciplinaire, jamais un consultant isolé. D'un côté, un expert-comptable ou un contrôleur de gestion qui connaît vos écritures, vos comptes de tiers, vos règles d'affectation analytique. De l'autre, un consultant systèmes qui connaît les contraintes réelles de l'ERP ou du logiciel cible — ce qu'il sait faire nativement, ce qu'il faudra développer sur mesure, où se situent ses limites.",
      "Ni l'un ni l'autre, seul, ne suffit à mener un projet à bien. C'est leur travail à deux, sur le même dossier, qui évite les cahiers des charges hors sol rédigés sans connaître la réalité comptable, et les paramétrages techniquement irréprochables mais inutilisables sur le terrain. Cette double lecture — celle du chiffre et celle du système — est au cœur de toutes nos interventions.",
    ],
    agilite: {
      titre: "Passer d'un langage à l'autre, dans la même réunion",
      texte:
        "Concrètement, cela veut dire qu'au cours d'un même atelier, nous pouvons discuter du traitement comptable d'une immobilisation en cours, puis, cinq minutes plus tard, du format d'échange entre deux applications ou des droits d'accès à paramétrer dans le nouvel outil. Cette bascule permanente entre le vocabulaire du plan comptable et celui de l'architecture applicative n'est pas un exercice difficile pour nous : c'est notre manière de travailler depuis l'origine du cabinet. Elle évite les allers-retours interminables entre votre expert-comptable, votre DSI et votre éditeur, chacun traduisant à sa façon ce que l'autre vient de dire.",
    },
    methode: [
      { titre: "Cadrage", texte: "Ateliers avec les équipes métier et finance, cartographie des flux existants, identification des irritants réels et des données qui comptent vraiment pour le pilotage. Nous partons toujours de ce qui se passe vraiment sur le terrain, pas de la procédure théorique." },
      { titre: "Conception & paramétrage", texte: "Rédaction des spécifications détaillées, paramétrage ou choix de la solution la plus adaptée, construction de jeux d'essai à partir de vos propres écritures comptables — jamais de données fictives déconnectées de votre activité." },
      { titre: "Déploiement & appropriation", texte: "Recette conjointe avec vos équipes, formation adaptée à chaque profil utilisateur, documentation des procédures cibles rédigée dans un langage compréhensible par tous, pas seulement par les initiés." },
      { titre: "Suivi & amélioration continue", texte: "Un système d'information Finance vit et évolue avec votre activité. Nous restons présents après la mise en production pour ajuster les paramétrages, traiter les cas particuliers qui émergent à l'usage, et faire évoluer l'outil au rythme de votre croissance." },
    ],
  },
  {
    slug: "erp-amoa",
    t: "Projets ERP & AMOA",
    chapeau: "Assistance à maîtrise d'ouvrage et gestion de projet sur vos programmes ERP structurants.",
    intro: [
      "Un projet ERP échoue rarement sur la technique pure. Il échoue quand personne, côté client, n'a la double compétence pour arbitrer entre ce que demande la comptabilité, ce que permet réellement l'outil et ce que peut absorber l'organisation sans se briser. L'éditeur défend son produit, l'intégrateur défend son planning et sa marge : il vous faut, à vos côtés, quelqu'un qui ne défend que vos intérêts.",
      "C'est exactement le rôle que nous tenons sur chaque mission d'assistance à maîtrise d'ouvrage. Nous ne remplaçons ni l'éditeur ni l'intégrateur : nous sommes le garant de la cohérence entre le besoin métier initial, tel qu'il a été exprimé au premier jour, et ce qui sort effectivement du projet plusieurs mois plus tard — ce qui, sans vigilance constante, dérive presque toujours.",
    ],
    equipe: [
      "Nos consultants AMOA sont des profils hybrides assumés, formés à la fois à la technique comptable et financière et à la lecture d'un schéma d'architecture applicative ou d'une spécification fonctionnelle. Ils n'ont pas besoin d'un traducteur pour comprendre ce que dit l'intégrateur, ni pour expliquer à votre direction financière pourquoi telle demande d'évolution coûtera plus cher que prévu.",
      "Sur les programmes les plus structurants, cette équipe s'élargit : un chef de projet dédié au pilotage global, un expert métier qui connaît vos processus de gestion dans le détail, un consultant technique capable de challenger les propositions de l'intégrateur en connaissance de cause. Cette pluridisciplinarité coordonnée, plutôt qu'un consultant isolé livré à lui-même, est ce qui protège réellement votre projet des dérives que connaissent tant de programmes ERP.",
    ],
    agilite: {
      titre: "Deux mondes, une seule équipe",
      texte:
        "Un même atelier de cadrage peut ainsi passer d'une discussion sur le traitement des acomptes fournisseurs à un échange technique sur les interfaces entre le nouvel ERP et vos outils périphériques, sans rupture de rythme ni changement d'interlocuteur. Cette agilité entre la comptabilité et l'informatique n'est pas une compétence que nous avons ajoutée à notre offre : c'est ce que nous aimons faire depuis toujours, et c'est ce qui distingue un accompagnement AMOA réellement utile d'une simple prestation de gestion de projet standardisée.",
    },
    methode: [
      { titre: "Cadrage du besoin", texte: "Recueil approfondi des exigences métier auprès de chaque service concerné, rédaction ou revue critique du cahier des charges, construction d'une grille de comparaison réellement objective entre les solutions envisagées." },
      { titre: "Pilotage du programme", texte: "Suivi rapproché de l'éditeur ou de l'intégrateur, arbitrages fonctionnels tranchés en connaissance de cause, anticipation et gestion des risques avant qu'ils ne deviennent des retards ou des surcoûts." },
      { titre: "Recette & bascule", texte: "Construction de tests de recette avec vos équipes opérationnelles, préparation d'un plan de bascule réaliste, accompagnement resserré du démarrage et des premières clôtures effectuées sur le nouvel outil." },
      { titre: "Stabilisation post-démarrage", texte: "Les premières semaines d'usage réel révèlent toujours des ajustements nécessaires. Nous restons mobilisés pour les identifier rapidement, les prioriser et les résoudre, jusqu'à ce que l'outil tourne réellement en rythme de croisière pour vos équipes." },
    ],
  },
  {
    slug: "transformation-digitale",
    t: "Transformation digitale",
    chapeau: "Digitaliser vos processus et conduire le changement pour embarquer durablement vos équipes.",
    intro: [
      "Digitaliser un processus comptable ou financier est facile sur le papier et beaucoup plus délicat dans les faits : il faut d'abord comprendre le geste métier tel qu'il existe aujourd'hui pour ne pas le casser en le digitalisant. Un outil brillant, mal introduit, produit souvent moins de valeur qu'un outil modeste bien accompagné — parce que les équipes continuent, en réalité, à travailler comme avant, en ajoutant simplement une étape de saisie supplémentaire.",
      "Nous abordons chaque transformation avec cette double exigence : l'efficacité réelle de l'outil choisi, et le respect profond de ce qui fait qu'une équipe travaille bien ensemble. La technologie n'est jamais une fin en soi dans notre approche — elle est au service d'un processus que nous avons pris le temps de comprendre avant de proposer quoi que ce soit.",
    ],
    equipe: [
      "La conduite du changement n'est jamais confiée à un seul profil chez Trevys. Elle mobilise nos experts comptables et financiers pour la légitimité technique du diagnostic — ce sont eux qui savent repérer où un processus perd du temps ou génère des erreurs — aux côtés de consultants formés à l'accompagnement humain, pour la pédagogie, la communication et l'adhésion des équipes concernées.",
      "C'est cette pluridisciplinarité — comptabilité, systèmes d'information, ressources humaines et conduite du changement réunis dans une même équipe projet — qui fait la différence entre un outil simplement déployé et un outil réellement adopté au quotidien. Un projet digital sans volet humain construit dès le départ est un projet qui prend du retard, ou qui n'aboutit jamais vraiment.",
    ],
    agilite: {
      titre: "Comprendre le geste avant de le transformer",
      texte:
        "Sur le terrain, cela signifie que nous passons autant de temps à observer comment une équipe travaille réellement — au-delà de la procédure écrite qui, souvent, ne reflète plus la pratique — qu'à concevoir la solution digitale censée l'améliorer. Cette agilité entre l'analyse comptable, la compréhension humaine des habitudes de travail et la maîtrise des outils numériques est exactement ce que nous cultivons depuis la création du cabinet, et ce que nous continuons d'aimer faire, mission après mission.",
    },
    methode: [
      { titre: "Diagnostic", texte: "Observation directe des processus tels qu'ils sont vraiment exécutés, et non tels qu'ils sont décrits sur le papier, entretiens avec les équipes concernées, identification précise des points de friction et des tâches à faible valeur ajoutée." },
      { titre: "Feuille de route", texte: "Priorisation des chantiers de digitalisation selon leur effort de mise en œuvre et leur impact réel sur le quotidien des équipes, choix des outils adaptés à votre contexte plutôt qu'à une tendance du marché." },
      { titre: "Accompagnement humain", texte: "Formation adaptée à chaque profil, communication claire sur les raisons du changement, identification de référents relais au sein des équipes pour porter la transformation au quotidien — la technologie seule ne fait jamais évoluer les habitudes." },
      { titre: "Ancrage & évolution", texte: "Une fois le nouvel outil en usage, nous restons attentifs à son adoption réelle : les résistances qui persistent, les usages détournés qui apparaissent, les ajustements qui permettront à la transformation de s'installer durablement plutôt que de retomber après quelques semaines." },
    ],
  },
];

export function getConsultingExpertise(slug: string) {
  return CONSULTING_EXPERTISES.find((e) => e.slug === slug);
}
