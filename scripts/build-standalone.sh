#!/usr/bin/env bash
# Assemble le bundle autonome prêt à déployer dans .next/standalone/
# Usage : bash scripts/build-standalone.sh
set -euo pipefail

echo "→ Build Next.js (output: standalone)…"
npm run build

echo "→ Copie des assets statiques et du dossier public dans le bundle…"
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo "✓ Bundle prêt : .next/standalone/"
echo "  Démarrage local de test :"
echo "    HOSTNAME=0.0.0.0 PORT=3000 node .next/standalone/server.js"
