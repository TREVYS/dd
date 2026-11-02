# Direction artistique — Cockpit « Jacques » (Trevys Consulting)

Ce document décrit la direction artistique du cockpit Trevys (l'application de
back-office où vit **Alfred**, l'assistant communication) afin de la reproduire
à l'identique dans une application cousine dédiée au **conseil**, animée par
**Jacques**.

Il peut être donné tel quel à un développeur ou à une IA de développement :
il contient les couleurs, la typographie, la structure des écrans, les
composants, la personnalité de l'assistant et une feuille de style de départ
prête à copier.

**Principe directeur :** Jacques est le cousin d'Alfred. Même maison, même
structure, mêmes réflexes d'usage. Seule change sa couleur signature :
**l'orange Trevys reste la couleur de la marque, le bleu nuit devient la
couleur de Jacques et du conseil.** Ce bleu nuit (`#1F2A44`) est déjà
utilisé dans le cockpit actuel pour étiqueter tout ce qui relève du
« Consulting » : on ne crée rien, on prolonge un code existant.

---

## 1. Esprit général

- **Chaleureux, premium, sobre.** Fond crème, cartes blanches très arrondies,
  ombres douces, beaucoup d'air. Jamais de gris froid ni d'interface
  « logiciel d'entreprise ».
- **La complexité est du côté de la technique, pas de l'utilisateur.** Pas
  de code, pas de jargon. Chaque action importante tient en un bouton.
- **L'assistant est un personnage**, pas une fonctionnalité : il a un nom, un
  visage, une carte dédiée tout en haut de la navigation et un ton de voix.
- **Rien ne part sans validation humaine.** Tout ce que produit l'assistant
  arrive en brouillon ; l'utilisateur valide d'un « go ».

---

## 2. Couleurs

### Palette commune (identique à Alfred)

| Rôle | Variable | Valeur |
|---|---|---|
| Fond de l'application | `--bg` | `#F4F1EC` (crème) |
| Cartes, panneaux | `--card` | `#FFFFFF` |
| Texte principal | `--ink` | `#1B1712` (brun très foncé, jamais noir pur) |
| Texte secondaire | `--ink2` | `#726757` |
| Texte discret, libellés | `--ink3` | `#A79C8C` |
| Filets, bordures | `--line` | `#EFEBE4` |
| Orange Trevys (marque) | `--o` | `#F5811F` |
| Orange foncé (survol, actif) | `--o2` | `#C2410C` |
| Teinte orange très claire | `--o-tint` | `#FFF6EF` |
| Teinte orange douce | `--o-soft` | `#FDEEE0` |
| Succès / en ligne | — | `#2E9E6B` (pastille : `#7CF29B`) |
| Danger | — | `#C0392B` sur fond `#FDF3F2`, bordure `#F0D5D1` |

### Couleurs signature de Jacques (nouveau)

| Rôle | Variable | Valeur |
|---|---|---|
| Bleu nuit Jacques (accent principal) | `--j` | `#1F2A44` |
| Bleu nuit profond (survol, actif) | `--j2` | `#141C30` |
| Bleu ardoise (dégradés, icônes) | `--j3` | `#3B5078` |
| Teinte bleue très claire | `--j-tint` | `#F1F4F9` |
| Teinte bleue douce | `--j-soft` | `#E3E9F3` |

### Règle d'emploi

- **Bleu nuit** : carte de Jacques, boutons principaux, élément actif de la
  navigation, indicateurs, graphiques.
- **Orange** : réservé à la marque Trevys (logo, monogramme « TA ») et aux
  alertes qui demandent une action (badges de notification). C'est le fil
  qui relie visuellement les deux applications.
- **Dégradé signature de Jacques** : `linear-gradient(135deg, #3B5078, #1F2A44)`
  (l'équivalent du dégradé `#FBB040 → #C2410C` d'Alfred).

---

## 3. Typographie

- **Police : Geist** (Google Fonts, chargée via `next/font/google`), en
  variable `--font-geist-sans`. **Geist Mono** pour les rares zones techniques.
- Graisses : **800** pour les titres et les chiffres, **700** pour les
  libellés et boutons, **600** pour la navigation, 400 pour le texte courant.

| Élément | Taille | Graisse | Détail |
|---|---|---|---|
| Titre de page (h1) | 1.5rem | 800 | |
| Titre de carte (h2) | 1.05rem | 800 | |
| Texte courant | 0.9rem | 400 | couleur `--ink2` pour les descriptions |
| Navigation | 0.9rem | 600 | |
| Libellé de groupe de navigation | 0.64rem | 700 | MAJUSCULES, espacement 0.13em, `--ink3` |
| En-tête de tableau, libellé de KPI | 0.72–0.76rem | 700 | MAJUSCULES, espacement 0.06–0.08em, `--ink3` |
| Chiffre de KPI | 2rem | 800 | |
| Étiquette (tag) | 0.72rem | 700 | pilule |

---

## 4. Formes, ombres, espacements

- **Rayons** : 22px pour les deux grands panneaux (navigation et contenu),
  16–18px pour les cartes, 12–14px pour les éléments de navigation et les
  champs, 10px pour les boutons, pilules complètes (100px) pour les étiquettes
  et puces.
- **Ombre des panneaux** : `0 10px 30px -22px rgba(27,23,18,.4)` (très diffuse).
- **Ombre de la carte de l'assistant** : `0 12px 26px -12px` dans la couleur
  de l'assistant (pour Jacques : `rgba(31,42,68,.55)`).
- **Survol** : léger soulèvement `translateY(-1px)` et ombre renforcée,
  transitions de 0.15s.
- **Marges** : 14px entre les panneaux et autour de l'application ; 1.6rem ×
  1.9rem à l'intérieur du panneau de contenu ; 1.5rem entre les cartes.

---

## 5. Structure de l'écran

```
┌───────────────┬──────────────────────────────────────────────┐
│ NAVIGATION    │ BARRE DU HAUT : recherche globale · avatar   │
│ (250px,       ├──────────────────────────────────────────────┤
│  fixe)        │                                              │
│ ┌───────────┐ │ Titre de page + sous-titre      [Action]     │
│ │ Monogramme│ │                                              │
│ │ Cockpit   │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │ Trevys    │ │ │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │         │
│ └───────────┘ │ └──────┘ └──────┘ └──────┘ └──────┘         │
│ ┌───────────┐ │                                              │
│ │ JACQUES   │ │ ┌─────────────────────────┐ ┌──────────────┐ │
│ │ (carte    │ │ │ Carte principale        │ │ Colonne      │ │
│ │  dégradé) │ │ │                         │ │ latérale     │ │
│ └───────────┘ │ └─────────────────────────┘ │ (340px)      │ │
│ GROUPE        │                             └──────────────┘ │
│  · Lien       │                                              │
│  · Lien  [3]  │                                              │
│ GROUPE        │                                              │
│  · Lien       │                                              │
│ ───────────── │                                              │
│ Réglages      │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

- **Deux panneaux blancs flottants** sur le fond crème, séparés de 14px :
  la navigation à gauche (250px, collée en haut au défilement), le contenu à
  droite (largeur maximale 1160px).
- **Navigation** : monogramme + « Cockpit **Trevys** » (le mot Trevys en
  couleur de marque), puis la **carte de l'assistant**, puis des groupes de
  liens titrés en petites capitales, puis les réglages en bas.
- **Élément actif** : fond teinté (`--j-tint`), texte en couleur foncée de
  l'assistant, et une barre verticale de 4px collée au bord gauche.
- **Badges** de notification : pastille orange `#E26A0F`, chiffre blanc,
  halo `0 0 0 3px rgba(226,106,15,.18)`.
- **Barre du haut** : champ de recherche globale arrondi sur fond crème,
  avatar de l'utilisateur (initiales sur dégradé) à droite.
- **Mobile** : la navigation passe dans un menu ☰ ; les grilles passent en
  1 ou 2 colonnes (points de rupture : 1050px, 900px, 760px, 600px).

### Navigation proposée pour Jacques (conseil)

| Groupe | Liens |
|---|---|
| Pilotage | Tableau de bord · Indicateurs |
| Missions | Missions en cours · Propositions commerciales · Planning des consultants |
| Clients | Comptes clients · Contacts · Retours d'expérience |
| Production | Livrables · Bibliothèque de méthodes · GED — Documents |
| Équipe | Consultants · Recrutement |
| — | Réglages |

---

## 6. La carte de Jacques (l'élément signature)

Tout en haut de la navigation, une carte cliquable qui ouvre la conversation
avec Jacques. C'est la reprise exacte de la carte d'Alfred, en bleu nuit.

- Fond : dégradé signature `linear-gradient(135deg, #3B5078, #1F2A44)`,
  texte blanc, rayon 14px, fine bordure blanche à 15 % d'opacité.
- À gauche : **avatar rond de 44px** sur fond blanc translucide.
- Au centre : **« Jacques »** en 800, et en dessous **« Directeur conseil »**
  en petit (0.7rem, opacité 0.9).
- À droite : **pastille verte « en ligne »** de 9px (`#7CF29B`, halo
  `rgba(124,242,155,.3)`).
- Actif : contour blanc intérieur de 2px.

### L'avatar de Jacques

Alfred est un majordome (crâne dégarni, cheveux gris, moustache, nœud
papillon). Jacques est son cousin consultant : même construction en SVG,
même style d'illustration, avec des cheveux poivre et sel, des lunettes
fines, un costume bleu nuit et une cravate.

```svg
<svg viewBox="0 0 80 80" role="img" aria-label="Jacques, directeur conseil">
  <defs>
    <radialGradient id="jac-skin" cx="0.5" cy="0.4" r="0.65">
      <stop offset="0" stop-color="#F2C9A0"/>
      <stop offset="1" stop-color="#D9A876"/>
    </radialGradient>
  </defs>
  <!-- Costume bleu nuit -->
  <path d="M6 80 C6 60 22 53 40 53 C58 53 74 60 74 80 Z" fill="#1F2A44"/>
  <!-- Chemise -->
  <path d="M40 53 L31 59 L40 72 L49 59 Z" fill="#FFFFFF"/>
  <!-- Cravate -->
  <path d="M38 58 L42 58 L43 61 L41 75 L39 75 L37 61 Z" fill="#3B5078"/>
  <path d="M38 56 L42 56 L42.6 59 L37.4 59 Z" fill="#2B3A5C"/>
  <!-- Cou, oreilles, tête -->
  <rect x="34" y="46" width="12" height="12" rx="4" fill="url(#jac-skin)"/>
  <circle cx="21" cy="36" r="4" fill="url(#jac-skin)"/>
  <circle cx="59" cy="36" r="4" fill="url(#jac-skin)"/>
  <ellipse cx="40" cy="33" rx="19" ry="21" fill="url(#jac-skin)"/>
  <!-- Cheveux poivre et sel, coiffés sur le côté -->
  <path d="M21 34 C20 18 30 11 41 11 C52 11 60 18 59 33 C56 24 50 19 42 18 C34 18 27 22 21 34 Z" fill="#6B6F78"/>
  <path d="M28 20 C34 15 46 14 54 20 C46 17 36 17 28 20 Z" fill="#9EA3AD"/>
  <!-- Sourcils -->
  <path d="M30 27 q5 -2.5 9 0" fill="none" stroke="#5A5E66" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M41 27 q5 -2.5 9 0" fill="none" stroke="#5A5E66" stroke-width="1.6" stroke-linecap="round"/>
  <!-- Lunettes fines -->
  <rect x="28.5" y="28.5" width="11" height="8" rx="3" fill="none" stroke="#1F2A44" stroke-width="1.4"/>
  <rect x="40.5" y="28.5" width="11" height="8" rx="3" fill="none" stroke="#1F2A44" stroke-width="1.4"/>
  <path d="M39.5 32 L40.5 32" stroke="#1F2A44" stroke-width="1.4"/>
  <!-- Yeux -->
  <circle cx="34" cy="32.5" r="1.9" fill="#3A2E26"/>
  <circle cx="46" cy="32.5" r="1.9" fill="#3A2E26"/>
  <!-- Nez, sourire -->
  <path d="M40 34 L38 40 q2 1.4 4 0" fill="none" stroke="#C08A5A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M34.5 46 Q40 50 45.5 46" fill="none" stroke="#B07A4A" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

Comme pour Alfred, on peut ajouter un clignement des yeux discret (animation
CSS sur l'opacité des deux cercles des yeux toutes les ~5 secondes), désactivé
si l'utilisateur a demandé à réduire les animations.

---

## 7. Composants

Les noms de classes ci-dessous reprennent ceux du cockpit Alfred (préfixe
`adm-` pour la structure, `ck-` pour le tableau de bord) : le code des deux
applications reste ainsi lisible côte à côte.

| Composant | Description |
|---|---|
| **Bouton principal** `.adm-btn` | Fond couleur de l'assistant, texte blanc, rayon 10px, padding 0.6rem × 1.1rem, 700, 0.88rem. Survol : couleur foncée. |
| **Bouton secondaire** `.adm-btn.ghost` | Fond blanc, bordure `--line`, texte `--ink`. Survol : bordure et texte en couleur de l'assistant. |
| **Bouton danger** `.adm-btn.danger` | Fond blanc, texte rouge, bordure rosée ; plein rouge au survol. |
| **Petit bouton** `.adm-btn.sm` | 0.4rem × 0.7rem, 0.8rem. |
| **Indicateur de travail** `.adm-spin` | Anneau de 13px qui tourne dans le bouton pendant que l'assistant travaille. |
| **Carte** `.adm-card` | Blanc, bordure `--line`, rayon 16px, padding 1.5rem × 1.6rem, titre h2 1.05rem/800. |
| **KPI** `.adm-kpi` | Carte compacte : libellé en petites capitales `--ink3`, chiffre 2rem/800 (variante en couleur de l'assistant). Grille auto-ajustée, colonnes de 200px minimum. |
| **Tableau** `.adm-table` | En-têtes en petites capitales `--ink3`, lignes séparées par un filet `--line`, aucune bordure verticale. |
| **Champ** `.adm-field` | Libellé 0.82rem/700 au-dessus, champ blanc, bordure `--line`, rayon 10px ; au focus, la bordure passe en couleur de l'assistant (pas de halo). |
| **Étiquette** `.adm-tag` | Pilule : texte en couleur de l'assistant, fond à 10 % d'opacité, bordure à 22 %. |
| **Puce / filtre** `.ck-chip` | Pilule blanche bordée ; au survol, pleine couleur de l'assistant ; sélectionnée, pleine couleur `--ink`. |
| **Note / encart** `.adm-note` | Fond teinté très clair, bordure douce, rayon 12px, texte 0.86rem `--ink2`. Variante succès (vert pâle) et erreur (rose pâle). |
| **Bannière de notification** `.ck-notif` | Bandeau cliquable en dégradé très clair avec icône, message (mot-clé en gras coloré) et « Voir → » aligné à droite. |
| **Zone de dépôt** `.adm-dropzone` | Bordure pointillée de 2px, fond crème ; au survol ou au glisser, bordure en couleur de l'assistant et fond teinté. |
| **Barre de l'assistant** `.ck-alfred-bar` | Sous un éditeur : petit carré à l'initiale de l'assistant, champ « Demandez à Jacques… » et puces d'actions rapides. |
| **Réorganisation** `.ck-artorder` | Liste glisser-déposer (poignée ⠿, boutons ↑/↓) pour réordonner des éléments. |

### Conversation avec l'assistant

- Panneau pleine hauteur, rayon 18px, bordure `--line`.
- État vide : avatar centré, phrase d'accueil, et **suggestions en pilules**
  (ex. « Prépare une proposition commerciale », « Résume la mission Jaji »,
  « Planifie les consultants de la semaine »).
- Messages de l'assistant précédés de son avatar rond de 40px (dégradé
  signature) ; messages de l'utilisateur alignés à droite.
- Barre de saisie en bas : trombone (joindre un document) + champ arrondi
  (rayon 12px) + bouton d'envoi.

---

## 8. Personnalité et ton de Jacques

| | Alfred | Jacques |
|---|---|---|
| Rôle | Directeur de la communication | Directeur conseil |
| Couleur | Orange `#F5811F` | Bleu nuit `#1F2A44` |
| Allure | Majordome, nœud papillon | Consultant senior, lunettes, cravate |
| Domaine | Articles, réseaux sociaux, newsletter, mails, WhatsApp | Missions, propositions, planning, livrables, retours d'expérience |
| Ton | Chaleureux, une pointe d'humour | Posé, structuré, précis — chaleureux mais plus sobre |

Règles de voix communes :

- Vouvoiement, phrases courtes, aucun jargon gratuit.
- Bannir le style corporate creux (« Nous sommes ravis de… », « À l'ère
  du digital… ») et les tournures d'IA (« Dans un monde où… »).
- Toujours proposer, jamais décider seul : « Voici une proposition — je
  l'envoie ? ». Tout part en brouillon, validation par un « go ».
- Jacques parle le langage des deux mondes (finance et systèmes), comme les
  consultants Trevys : il peut passer d'un traitement comptable à une
  spécification technique dans la même réponse.

---

## 9. Feuille de style de départ

À copier dans l'application de Jacques (même noms de variables qu'Alfred ;
les accents `--o` / `--o2` pointent ici vers le bleu nuit, l'orange reste
disponible en `--brand` pour la marque).

```css
.adm{
  /* Marque Trevys */
  --brand:#F5811F; --brand2:#C2410C;
  /* Accent Jacques (remplace l'orange d'Alfred) */
  --o:#1F2A44; --o2:#141C30; --o-tint:#F1F4F9; --o-soft:#E3E9F3;
  --j3:#3B5078;
  --grad-assistant:linear-gradient(135deg,#3B5078,#1F2A44);
  /* Neutres communs */
  --ink:#1B1712; --ink2:#726757; --ink3:#A79C8C;
  --line:#EFEBE4; --bg:#F4F1EC; --card:#fff;

  min-height:100vh;display:grid;grid-template-columns:250px 1fr;gap:14px;padding:14px;
  background:var(--bg);color:var(--ink);
  font-family:var(--font-geist-sans),system-ui,sans-serif;
}
.adm-side{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:1.3rem 1rem;
  display:flex;flex-direction:column;gap:.15rem;position:sticky;top:14px;height:calc(100vh - 28px);
  box-shadow:0 10px 30px -22px rgba(27,23,18,.4)}
.adm-main{padding:1.6rem 1.9rem;max-width:1160px;background:var(--card);border:1px solid var(--line);
  border-radius:22px;box-shadow:0 10px 30px -22px rgba(27,23,18,.4)}
.adm-brand{display:flex;align-items:center;gap:.6rem;font-weight:800;font-size:1.05rem;padding:.3rem .6rem 1rem}
.adm-brand b{color:var(--brand)}
.adm-brandmark{width:30px;height:30px;border-radius:9px;background:linear-gradient(140deg,var(--brand),var(--brand2));
  display:inline-grid;place-items:center;color:#fff;font-size:.72rem;font-weight:800}
.adm-grp{font-size:.64rem;letter-spacing:.13em;text-transform:uppercase;color:var(--ink3);font-weight:700;padding:.95rem .7rem .4rem}
.adm-side a{display:flex;align-items:center;gap:.7rem;padding:.66rem .78rem;border-radius:12px;color:var(--ink2);
  text-decoration:none;font-size:.9rem;font-weight:600;transition:.15s;position:relative}
.adm-side a:hover{background:var(--o-tint);color:var(--ink)}
.adm-side a.on{background:var(--o-tint);color:var(--o)}
.adm-side a.on::before{content:"";position:absolute;left:-1rem;top:22%;height:56%;width:4px;border-radius:0 4px 4px 0;background:var(--o)}
.adm-side a .adm-badge{margin-left:auto;min-width:20px;height:20px;display:inline-grid;place-items:center;font-size:.68rem;
  font-weight:800;color:#fff;background:#E26A0F;border-radius:100px;padding:0 .35rem;box-shadow:0 0 0 3px rgba(226,106,15,.18)}

/* Carte de Jacques */
.adm-jacques{display:flex;align-items:center;gap:.7rem;padding:.7rem;margin:0 0 .5rem;border-radius:14px;text-decoration:none;
  background:var(--grad-assistant);color:#fff;border:1px solid rgba(255,255,255,.15);
  box-shadow:0 12px 26px -12px rgba(31,42,68,.55);transition:transform .15s,box-shadow .15s}
.adm-jacques:hover{transform:translateY(-1px);box-shadow:0 16px 30px -12px rgba(31,42,68,.7)}
.adm-jacques.on{outline:2px solid #fff;outline-offset:-4px}
.adm-jacques-av{width:44px;height:44px;flex:0 0 auto;border-radius:50%;overflow:hidden;background:rgba(255,255,255,.22);display:grid;place-items:center}
.adm-jacques-tx{display:flex;flex-direction:column;line-height:1.15}
.adm-jacques-tx b{font-size:.98rem;font-weight:800}
.adm-jacques-tx small{font-size:.7rem;opacity:.9}
.adm-jacques-dot{margin-left:auto;width:9px;height:9px;border-radius:50%;background:#7CF29B;box-shadow:0 0 0 3px rgba(124,242,155,.3)}

/* En-tête de page, cartes, KPI */
.adm-h{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1.6rem;flex-wrap:wrap}
.adm-h h1{font-size:1.5rem;font-weight:800}
.adm-h p{color:var(--ink2);font-size:.9rem;margin-top:.25rem}
.adm-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:1.5rem 1.6rem;margin-bottom:1.5rem}
.adm-card h2{font-size:1.05rem;font-weight:800;margin-bottom:1rem}
.adm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1.8rem}
.adm-kpi{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:1.3rem 1.4rem}
.adm-kpi .k{font-size:.76rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink3);font-weight:700}
.adm-kpi .v{font-size:2rem;font-weight:800;margin-top:.3rem}
.adm-kpi .v.o{color:var(--o)}

/* Boutons */
.adm-btn{display:inline-flex;align-items:center;gap:.4rem;background:var(--o);color:#fff;border:none;border-radius:10px;
  padding:.6rem 1.1rem;font-weight:700;font-size:.88rem;cursor:pointer;text-decoration:none;font-family:inherit}
.adm-btn:hover{background:var(--o2)}
.adm-btn.ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}
.adm-btn.ghost:hover{border-color:var(--o);color:var(--o)}
.adm-btn.danger{background:#fff;color:#c0392b;border:1px solid #f0d5d1}
.adm-btn.danger:hover{background:#c0392b;color:#fff}
.adm-btn.sm{padding:.4rem .7rem;font-size:.8rem}

/* Formulaires, étiquettes, notes, tableaux */
.adm-field{display:flex;flex-direction:column;gap:.4rem}
.adm-field label{font-size:.82rem;font-weight:700}
.adm-field small{color:var(--ink3);font-weight:400}
.adm-field input,.adm-field textarea,.adm-field select{border:1px solid var(--line);border-radius:10px;padding:.7rem .85rem;
  font:inherit;font-size:.92rem;background:#fff;color:var(--ink)}
.adm-field input:focus,.adm-field textarea:focus,.adm-field select:focus{outline:none;border-color:var(--o)}
.adm-row2{display:grid;grid-template-columns:1fr 1fr;gap:1.1rem}
.adm-actions{display:flex;gap:.7rem;align-items:center;flex-wrap:wrap}
.adm-tag{display:inline-block;font-size:.72rem;font-weight:700;color:var(--o);background:rgba(31,42,68,.08);
  border:1px solid rgba(31,42,68,.18);border-radius:100px;padding:.2rem .6rem}
.adm-note{background:var(--o-tint);border:1px solid var(--o-soft);border-radius:12px;padding:1rem 1.2rem;font-size:.86rem;color:var(--ink2);line-height:1.55}
.adm-table{width:100%;border-collapse:collapse;font-size:.9rem}
.adm-table th{text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--ink3);padding:.6rem .5rem;border-bottom:1px solid var(--line)}
.adm-table td{padding:.75rem .5rem;border-bottom:1px solid var(--line);vertical-align:middle}
.adm-table tr:last-child td{border-bottom:none}

@media(max-width:760px){.adm-row2{grid-template-columns:1fr}}
```

---

## 10. Ce qui ne change pas d'une application à l'autre

- Le fond crème, les deux panneaux blancs flottants, les rayons et les ombres.
- La police Geist et la hiérarchie typographique.
- Le monogramme « TA » et le mot **Trevys** en orange dans la navigation.
- Les badges de notification orange (une alerte reste une alerte Trevys).
- Le principe « brouillon d'abord, validation par go ».
- Le vouvoiement et la sobriété du ton.
