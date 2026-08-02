# 🚀 Guide de Déploiement en Production sur Render (LingoQuest)

Votre projet **LingoQuest** est désormais entièrement configuré et optimisé pour être hébergé en production sur [Render.com](https://render.com).

Vous avez **3 méthodes simples** pour déployer votre application :

---

## ⭐️ Méthode 1 : Déploiement Automatique "Blueprint" (1 Clic - Recommandé)

Grâce au fichier `render.yaml` inclus à la racine de votre projet :

1. Poussez votre code sur votre dépôt **GitHub** ou **GitLab**.
2. Connectez-vous à votre tableau de bord [Render](https://dashboard.render.com).
3. Cliquez sur **New +** (en haut à droite) et choisissez **Blueprint**.
4. Connectez votre dépôt GitHub/GitLab.
5. Render détectera automatiquement le fichier `render.yaml` et configurera :
   - Le service web Full-Stack Node.js (`lingoquest`)
   - La commande de build : `npm install && npm run build`
   - La commande de démarrage : `npm run start` (`node dist/server.cjs`)
   - Le chemin de vérification de santé : `/api/health`
6. **Important :** Render vous demandera d'entrer la valeur de votre variable `GEMINI_API_KEY` (votre clé API Google Gemini).
7. Cliquez sur **Apply** ! Votre application sera en ligne en quelques minutes.

---

## 🛠️ Méthode 2 : Déploiement Manuel Web Service (Node.js)

Si vous préférez créer le service manuellement sur Render sans Blueprint :

1. Sur Render, cliquez sur **New +** > **Web Service**.
2. Connectez votre dépôt Git.
3. Configurez les options suivantes :
   - **Environment :** `Node`
   - **Build Command :** `npm install && npm run build`
   - **Start Command :** `npm run start` (ou `node dist/server.cjs`)
   - **Plan :** `Free` (ou supérieur)
4. Dans l'onglet **Environment Variables**, ajoutez :
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = `votre_cle_api_gemini_ici`
5. Cliquez sur **Create Web Service**.

---

## 🐳 Méthode 3 : Déploiement via Docker (Optionnel)

Un fichier `Dockerfile` multi-stage optimisé pour la production est inclus à la racine :
1. Lors de la création d'un **Web Service** sur Render, sélectionnez l'environnement **Docker**.
2. Render utilisera automatiquement le `Dockerfile` pour compiler l'application Vite en amont et exécuter le serveur Node Express allégé (`runner stage`).
3. Ajoutez votre variable d'environnement `GEMINI_API_KEY` dans l'interface Render.

---

## 🔍 Points Clés de Production (Vérifiés et Prêts)

- **Port & Serveur :** Le serveur Express (`server.ts`) écoute dynamiquement sur la variable `process.env.PORT` injectée par Render (bind sur `0.0.0.0`).
- **Assets Statiques & PWA :** Les fichiers statiques, y compris l'application PWA, le manifest et le fichier `LingoQuest.apk`, sont copiés dans `dist/` lors de la compilation Vite et servis directement en production.
- **Requêtes API Gemini :** Toutes les requêtes IA sont exécutées côté serveur dans `/api/ai/*`, gardant votre clé `GEMINI_API_KEY` 100% sécurisée et cachée du navigateur.
- **Route Fallback SPA :** En production, toutes les URLs redirigent proprement vers `dist/index.html` pour supporter la navigation côté client sans erreur 404.
