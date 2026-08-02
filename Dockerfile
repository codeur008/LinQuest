# ==========================================
# Dockerfile optimisé pour production sur Render
# ==========================================

# Étape 1 : Construction (Builder Stage)
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration et dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm ci

# Copie du code source et compilation pour la production (Vite + esbuild pour server.cjs)
COPY . .
RUN npm run build

# ==========================================
# Étape 2 : Exécution légère (Runner Stage)
FROM node:20-alpine AS runner

WORKDIR /app

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=10000

# Copie des fichiers compilés et dépendances depuis l'étape builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Render expose automatiquement le port défini par $PORT
EXPOSE 10000

# Commande de démarrage de production (node dist/server.cjs)
CMD ["npm", "run", "start"]
