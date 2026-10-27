// Retours d'expérience / cas de missions, présentés sur des sous-pages non
// référencées dans le menu — accessibles via un bouton depuis la page
// d'expertise ou de facturation électronique correspondante.

export type CaseStep = { titre: string; texte: string };

export type CaseMission = {
  client: string; // nom du client (ou groupe), tel qu'affiché
  context?: string; // précision optionnelle (ex. « filiale de… »)
  secteur: string; // badge secteur, affiché à côté du nom du client
  enjeu: string[]; // le besoin / contexte de départ
  etapes: CaseStep[]; // notre intervention, phase par phase
  resultat: string; // ce que la mission a changé, mis en avant visuellement
};

export type CaseStudy = {
  slug: string; // correspond au slug de l'expertise, ou "facturation-electronique"
  eyebrow: string;
  h1: string;
  chapeau: string;
  missions: CaseMission[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "si-finance",
    eyebrow: "Retour d'expérience",
    h1: "Choisir et déployer un nouvel ERP Finance : l'exemple Jaji",
    chapeau: "Du cadrage du besoin jusqu'à l'aide à la contractualisation, aux côtés de la direction générale.",
    missions: [
      {
        client: "Jaji",
        context: "filiale de Klesia",
        secteur: "Protection sociale",
        enjeu: [
          "Jaji, filiale du groupe de protection sociale Klesia, avait besoin de faire évoluer son système d'information Finance pour accompagner sa croissance. L'outil en place ne suivait plus : clôtures ralenties, reportings reconstruits à la main, et une direction générale qui ne disposait pas, au bon moment, des informations nécessaires pour décider.",
          "Plutôt que de partir d'une short-list d'éditeurs, nous avons été missionnés dès l'amont pour construire, avec la direction générale, une vision claire du besoin réel — avant même de parler de solution.",
        ],
        etapes: [
          {
            titre: "Cadrage du besoin",
            texte: "Ateliers avec la direction générale et les équipes finance pour comprendre les flux comptables réels, les contraintes de clôture et les irritants concrets de l'outil existant — pas une liste de fonctionnalités théoriques, mais ce qui bloquait vraiment au quotidien.",
          },
          {
            titre: "Sélection de la solution",
            texte: "Confrontation des offres du marché au besoin réellement exprimé, avec Oracle NetSuite retenu comme cible la plus pertinente pour la trajectoire de croissance de Jaji.",
          },
          {
            titre: "Aide à la contractualisation",
            texte: "Accompagnement des échanges avec l'éditeur jusqu'à la signature, en veillant à ce que chaque engagement pris à l'oral — délais, périmètre, support — se retrouve noir sur blanc dans le contrat.",
          },
        ],
        resultat: "Une direction générale qui a pu arbitrer en connaissance de cause, sur un dossier technique dont elle n'avait pas à maîtriser tous les codes — parce que notre équipe a porté cette compréhension à sa place, du premier atelier jusqu'à la signature du contrat.",
      },
    ],
  },
  {
    slug: "erp-amoa",
    eyebrow: "Retour d'expérience",
    h1: "AMOA sur des programmes ERP structurants",
    chapeau: "Pilotage de programmes de refonte ou d'évolution des outils finance, pour des groupes bancaires et de grandes entreprises.",
    missions: [
      {
        client: "Pierre & Vacances",
        secteur: "Tourisme & loisirs",
        enjeu: [
          "Pierre & Vacances a engagé un programme de refonte de ses outils finance autour de SAP — un chantier structurant, où la moindre dérive entre le besoin métier initial et ce que livre effectivement l'intégrateur se paie en retards et en surcoûts. Nous sommes intervenus en assistance à maîtrise d'ouvrage, aux côtés des équipes finance.",
        ],
        etapes: [
          {
            titre: "Pilotage du programme",
            texte: "Suivi rapproché de l'avancement, arbitrages fonctionnels tranchés avec les équipes finance, anticipation des risques avant qu'ils ne deviennent des retards.",
          },
          {
            titre: "Recette",
            texte: "Pilotage des phases de recette pour s'assurer que les processus financiers cibles fonctionnent réellement comme prévu — sur des cas réels, pas uniquement des scénarios théoriques — avant toute bascule en production.",
          },
        ],
        resultat: "Un programme SAP piloté avec un interlocuteur qui ne défendait que les intérêts de Pierre & Vacances, garant de la cohérence entre le besoin exprimé au premier jour et ce qui est sorti du projet.",
      },
      {
        client: "Ma French Bank",
        context: "filiale de La Banque Postale",
        secteur: "Banque digitale",
        enjeu: [
          "Ma French Bank, filiale digitale de La Banque Postale, devait faire évoluer ses outils finance internes pour accompagner le développement de son activité. Nous avons mené cette mission d'AMOA en lien constant entre les équipes finance et les équipes techniques.",
        ],
        etapes: [
          {
            titre: "Pilotage du programme",
            texte: "Coordination entre la direction financière et les équipes IT, avec des consultants capables de discuter traitement comptable d'un côté, spécification technique de l'autre — dans la même réunion.",
          },
          {
            titre: "Recette des évolutions",
            texte: "Construction et pilotage de la recette des évolutions livrées, pour vérifier qu'elles répondaient réellement au besoin exprimé avant mise en production.",
          },
        ],
        resultat: "Des outils finance internes qui ont évolué au rythme de l'activité de Ma French Bank, sans rupture de communication entre la finance et la technique tout au long du programme.",
      },
    ],
  },
  {
    slug: "transformation-digitale",
    eyebrow: "Retour d'expérience",
    h1: "Digitaliser et automatiser les processus comptables et financiers",
    chapeau: "De la remontée comptable automatisée aux tableaux de bord de pilotage, pour des cabinets comme pour des directions financières.",
    missions: [
      {
        client: "Cabinets d'expertise comptable",
        secteur: "Expertise comptable",
        enjeu: [
          "Plusieurs cabinets d'expertise comptable nous ont sollicités pour digitaliser leur processus de production comptable : trop de ressaisies, des données transmises aux équipes de révision pas toujours fiables, et un temps précieux perdu sur des tâches à faible valeur ajoutée.",
        ],
        etapes: [
          {
            titre: "Diagnostic du processus existant",
            texte: "Observation du geste métier tel qu'il est vraiment exécuté, identification précise des étapes de ressaisie et des points de rupture entre les outils.",
          },
          {
            titre: "Automatisation de la remontée comptable",
            texte: "Mise en place de flux automatisés entre les outils clients et le dossier de production, pour réduire les ressaisies et fiabiliser les données dès leur entrée.",
          },
        ],
        resultat: "Une remontée comptable automatisée, moins de ressaisies manuelles et des données plus fiables entre les mains des équipes de révision.",
      },
      {
        client: "Directions financières",
        secteur: "Contrôle de gestion",
        enjeu: [
          "Côté directions financières, le besoin portait sur le pilotage : des tableaux de bord de contrôle de gestion reconstruits chaque mois à la main, avec des chiffres déjà datés au moment où ils arrivaient sur le bureau des décideurs.",
        ],
        etapes: [
          {
            titre: "Compréhension des usages réels",
            texte: "Observation de la façon dont les équipes travaillaient vraiment, au-delà de la procédure écrite, pour concevoir un outil réellement adopté plutôt qu'un tableau de bord brillant mais déconnecté du terrain.",
          },
          {
            titre: "Construction des dashboards",
            texte: "Mise en place de tableaux de bord pilotables en temps réel avec Power BI, connectés directement aux sources de données pour éviter les reconstructions manuelles.",
          },
          {
            titre: "Automatisation des tâches répétitives",
            texte: "Déploiement d'outils de workflow, comme Dust, pour automatiser les tâches répétitives qui ralentissaient les clôtures et libérer du temps pour l'analyse.",
          },
        ],
        resultat: "Des dashboards de contrôle de gestion pilotables en temps réel, et des équipes finance qui passent moins de temps à reconstruire les chiffres et plus de temps à les analyser.",
      },
    ],
  },
  {
    slug: "facturation-electronique",
    eyebrow: "Retour d'expérience",
    h1: "Piloter des programmes de facturation électronique à grande échelle",
    chapeau: "Des programmes menés pour des banques et de grandes entreprises, dont des acteurs du data center.",
    missions: [
      {
        client: "Groupes bancaires",
        secteur: "Banque",
        enjeu: [
          "Pour des établissements bancaires, la mise en conformité à la réforme de la facturation électronique se heurte à une volumétrie de flux et une diversité de systèmes rarement comparables à celles d'une entreprise classique. Un pilotage rigoureux, centralisé, était indispensable pour tenir le calendrier sans rupture d'activité.",
        ],
        etapes: [
          {
            titre: "Cartographie des flux",
            texte: "Recensement exhaustif des flux de facturation existants, de leurs formats et de leurs circuits, à travers des systèmes souvent hétérogènes hérités de plusieurs entités.",
          },
          {
            titre: "Choix de la plateforme",
            texte: "Sélection de la Plateforme de Dématérialisation Partenaire adaptée aux volumes et aux contraintes de sécurité propres au secteur bancaire.",
          },
          {
            titre: "Coordination IT & finance",
            texte: "Pilotage conjoint des équipes IT et finance, pour que chaque évolution technique reste alignée sur les exigences comptables et réglementaires.",
          },
          {
            titre: "Sécurisation du calendrier",
            texte: "Construction d'un plan de bascule réaliste et suivi resserré jusqu'au démarrage, pour éviter toute rupture dans l'émission ou la réception des factures.",
          },
        ],
        resultat: "Un programme de mise en conformité piloté de bout en bout, sans rupture d'activité, sur un périmètre de flux et de systèmes particulièrement dense.",
      },
      {
        client: "Entreprises du secteur data center",
        secteur: "Data center",
        enjeu: [
          "Les entreprises du secteur du data center combinent une forte volumétrie de facturation et des spécificités contractuelles complexes (facturation à l'usage, contrats multi-sites, clients internationaux). Nous avons piloté le cadrage et le déploiement de la réforme sur ce terrain exigeant.",
        ],
        etapes: [
          {
            titre: "Cadrage des spécificités contractuelles",
            texte: "Analyse des schémas de facturation propres à l'activité — facturation à l'usage, contrats multi-sites — pour anticiper leur traduction dans les nouveaux formats électroniques.",
          },
          {
            titre: "Déploiement",
            texte: "Mise en œuvre coordonnée avec les équipes techniques et financières, jusqu'à la bascule effective sur les nouveaux circuits de facturation.",
          },
          {
            titre: "Sécurisation de la piste d'audit fiable",
            texte: "Mise en place des contrôles garantissant la piste d'audit fiable sur l'ensemble des flux concernés, y compris ceux qui ne relèvent pas de la facture électronique structurée.",
          },
        ],
        resultat: "Une réforme déployée sans perturber la facturation à l'usage, avec une piste d'audit fiable sécurisée sur l'ensemble des flux, y compris les plus complexes.",
      },
    ],
  },
];

export function getCaseStudy(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
