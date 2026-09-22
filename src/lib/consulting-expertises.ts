// Détail des expertises du pôle conseil (hors facturation électronique, qui a
// sa propre page dédiée /facturation-electronique). Contenu volontairement
// centré sur ce qui distingue Trevys : équipes pluridisciplinaires, agilité
// entre comptabilité et informatique, profils hybrides, et une méthodologie
// éprouvée depuis la création du cabinet.

export type ConsultingExpertise = {
  slug: string;
  n: string;
  t: string;
  chapeau: string;
  intro: string;
  equipe: string;
  methode: { titre: string; texte: string }[];
  chiffres: { valeur: string; legende: string }[];
};

export const CONSULTING_EXPERTISES: ConsultingExpertise[] = [
  {
    slug: "si-finance",
    n: "01",
    t: "Systèmes d'information Finance",
    chapeau: "Cadrage, refonte et pilotage des SI Finance, du besoin métier au déploiement.",
    intro:
      "Un système d'information Finance ne se choisit pas dans un catalogue éditeur : il se construit à partir de vos flux comptables réels, de vos process de clôture et des décisions que vos équipes doivent pouvoir prendre. C'est là que notre double culture change la donne — nous parlons couramment le langage du plan comptable et celui de l'architecture applicative, dans la même phrase.",
    equipe:
      "Chaque mission SI Finance mobilise une équipe pluridisciplinaire : un expert-comptable ou un contrôleur de gestion qui connaît vos écritures, aux côtés d'un consultant systèmes qui connaît les contraintes techniques de l'ERP ou du logiciel cible. Ni l'un ni l'autre seul ne suffit — c'est leur travail à deux, sur le même dossier, qui évite les cahiers des charges hors sol et les paramétrages qui ne collent pas à la réalité comptable.",
    methode: [
      { titre: "Cadrage", texte: "Ateliers avec les équipes métier et finance, cartographie des flux existants, identification des irritants et des données qui comptent vraiment." },
      { titre: "Conception & paramétrage", texte: "Spécifications détaillées, paramétrage ou choix de la solution, jeux d'essai construits à partir de vos propres écritures." },
      { titre: "Déploiement & appropriation", texte: "Recette, formation des équipes, documentation des procédures cibles — et un accompagnement qui ne s'arrête pas à la mise en production." },
    ],
    chiffres: [
      { valeur: "6-16 sem.", legende: "durée moyenne d'un cadrage SI Finance" },
      { valeur: "100 %", legende: "des specs validées sur vos données réelles" },
    ],
  },
  {
    slug: "erp-amoa",
    n: "02",
    t: "Projets ERP & AMOA",
    chapeau: "Assistance à maîtrise d'ouvrage et gestion de projet sur vos programmes ERP structurants.",
    intro:
      "Un projet ERP échoue rarement sur la technique : il échoue quand personne, côté client, n'a la double compétence pour arbitrer entre ce que demande la comptabilité, ce que permet l'outil et ce que peut absorber l'organisation. C'est exactement le rôle que nous tenons — à vos côtés, pas à la place de l'éditeur ni de l'intégrateur.",
    equipe:
      "Nos consultants AMOA sont des profils hybrides assumés : formés à la technique comptable et financière, mais capables de lire un schéma d'architecture applicative ou une spécification fonctionnelle sans traducteur. Cette agilité — passer d'une discussion sur l'amortissement des immobilisations à une discussion sur les interfaces techniques du même ERP — est au cœur de notre manière de travailler depuis toujours.",
    methode: [
      { titre: "Cadrage du besoin", texte: "Recueil des exigences métier, rédaction ou revue du cahier des charges, grille de comparaison objective des solutions." },
      { titre: "Pilotage du programme", texte: "Suivi de l'éditeur ou de l'intégrateur, arbitrages fonctionnels, gestion des risques et des délais — un vrai maître d'ouvrage, pas un simple relais." },
      { titre: "Recette & bascule", texte: "Tests de recette construits avec vos équipes, plan de bascule, accompagnement du go-live et des premières clôtures sur le nouvel outil." },
    ],
    chiffres: [
      { valeur: "10-18 mois", legende: "durée type d'un programme ERP structurant" },
      { valeur: "1 référent", legende: "unique, du cadrage à la bascule" },
    ],
  },
  {
    slug: "transformation-digitale",
    n: "03",
    t: "Transformation digitale",
    chapeau: "Digitalisation des processus et conduite du changement pour embarquer les équipes.",
    intro:
      "Digitaliser un processus comptable ou financier, c'est facile sur le papier et difficile dans les faits : il faut comprendre le geste métier d'aujourd'hui pour ne pas le casser en le digitalisant. Nous abordons chaque transformation avec cette double exigence — l'efficacité de l'outil, et le respect de ce qui fait qu'une équipe travaille bien.",
    equipe:
      "La conduite du changement n'est jamais confiée à un seul profil : elle mobilise nos experts comptables et financiers pour la légitimité technique, et des consultants formés à l'accompagnement humain pour la pédagogie et l'adhésion. C'est cette pluridisciplinarité — comptabilité, systèmes d'information, ressources humaines — qui fait la différence entre un outil déployé et un outil réellement adopté.",
    methode: [
      { titre: "Diagnostic", texte: "Observation des processus réels (pas seulement des procédures écrites), mesure des délais et des points de friction." },
      { titre: "Feuille de route", texte: "Priorisation des chantiers par effort et par impact, choix des outils, plan de digitalisation étape par étape." },
      { titre: "Accompagnement humain", texte: "Formation, communication, référents relais dans les équipes — la technologie ne suffit jamais seule à faire changer les habitudes." },
    ],
    chiffres: [
      { valeur: "3-6 sem.", legende: "pour un diagnostic ciblé" },
      { valeur: "0", legende: "chantier laissé sans plan de conduite du changement" },
    ],
  },
];

export function getConsultingExpertise(slug: string) {
  return CONSULTING_EXPERTISES.find((e) => e.slug === slug);
}
