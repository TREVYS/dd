#!/usr/bin/env bash
# Assemble le bundle autonome prêt à déployer dans .next/standalone/
# Usage : bash scripts/build-standalone.sh
set -euo pipefail

echo "→ Build Next.js (output: standalone)…"
npm run build

echo "→ Copie des assets statiques et du dossier public dans le bundle…"
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo "→ Copie du contenu éditorial (articles, pages, légal)…"
cp -r content .next/standalone/content

echo "→ Préparation des dossiers inscriptibles (données + médias importés)…"
mkdir -p .next/standalone/data
mkdir -p .next/standalone/public/uploads

echo "✓ Bundle prêt : .next/standalone/"
echo "  Démarrage local de test :"
echo "    HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js"
