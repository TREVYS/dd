# ── Trevys — image de production (site vitrine + back-office) ──
# Build : docker build -t trevys-site .
# Run   : docker run -p 3000:3000 --env-file .env.production \
#           -v trevys-uploads:/app/public/uploads \
#           -v trevys-content:/app/content \
#           -v trevys-data:/app/data trevys-site

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Serveur autonome + assets + contenu éditorial
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
# Prisma (client + migrations) pour l'authentification du back-office
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Dossiers inscriptibles (persistez-les via des volumes)
RUN mkdir -p ./data ./public/uploads

EXPOSE 3000
CMD ["node", "server.js"]
