#!/usr/bin/env bash
# Harmonise les portraits de l'équipe pour un rendu studio cohérent.
#
# 1) Déposez les fichiers source (n'importe quel nom/format) dans scripts/team-src/,
#    puis renommez-les : john.*, olivier.*, walther.*, jeremy.*
# 2) Lancez : bash scripts/harmonize-team-photos.sh
# 3) Les portraits normalisés sont écrits dans public/brand/team/<slug>.jpg
#
# Nécessite ImageMagick (`convert`).
set -euo pipefail
SRC="scripts/team-src"
OUT="public/brand/team"
GREY="#6b7078"          # gris studio de référence (photos de John/Walther/Jeremy)
SIZE="700x875"          # cadrage portrait 4:5

norm () {  # $1 = fichier source, $2 = slug de sortie
  convert "$1" -auto-orient \
    -resize "${SIZE}^" -gravity North -extent "$SIZE" \
    -modulate 100,96 \
    "$OUT/$2.jpg"
  echo "  → $OUT/$2.jpg"
}

# Olivier : fond blanc → gris studio (flood-fill depuis les 4 coins, ne touche
# pas la chemise blanche car non contiguë au bord). Ajustez -fuzz si besoin.
norm_white_bg () {
  convert "$1" -auto-orient -resize "${SIZE}^" -gravity North -extent "$SIZE" \
    -fuzz 22% \
    -fill "$GREY" -draw "color 0,0 floodfill" \
    -fill "$GREY" -draw "color $(($(identify -format %w "$1")-1)),0 floodfill" \
    -modulate 100,96 \
    "$OUT/olivier-bonnin.jpg"
  echo "  → $OUT/olivier-bonnin.jpg (fond harmonisé)"
}

echo "Harmonisation des portraits…"
[ -f "$SRC"/john.* ]    && norm "$(ls "$SRC"/john.*)"    john-levy
[ -f "$SRC"/walther.* ] && norm "$(ls "$SRC"/walther.*)" walther-ottgen
[ -f "$SRC"/jeremy.* ]  && norm "$(ls "$SRC"/jeremy.*)"  jeremy-roch
[ -f "$SRC"/olivier.* ] && norm_white_bg "$(ls "$SRC"/olivier.*)"
echo "Terminé."
