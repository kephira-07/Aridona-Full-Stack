# Guide de Déploiement Docker : Aridona Full-Stack

Salut ! Si tu lis ce document, c'est que nous allons passer à l'étape supérieure pour le déploiement de l'application **Aridona Full-Stack**.

Jusqu'à présent, le projet (qui est super bien structuré !) était testé sur Render. L'utilisation de **Docker** va nous donner un contrôle total sur l'environnement, faciliter les tests en local et rendre le déploiement agnostique (déployable partout).

Ce guide t'explique **comment** et **pourquoi** nous structurons le projet avec Docker.

---

## 1. L'Architecture et l'Objectif

Ton projet est divisé en trois parties :

- **Backend** : Une API Node.js.
- **Client** : Application front-end construite avec Vite.
- **Admin** : Panel d'administration construit avec Vite.

**L'Objectif avec Docker** :
Nous créons un *Conteneur* pour chaque partie. Ces conteneurs sont isolés mais communiquent entre eux grâce à **Docker Compose**.

1. Le conteneur **Backend** fera tourner l'API Node.js sur le port 4000.
2. Les conteneurs **Client** et **Admin** utiliseront un serveur web léger (Nginx) pour servir les fichiers statiques de Vite. Le client sera sur le port 4545 (comme demandé pour nos tests) et l'admin sur le port 4546.

---

## 2. Les Dockerfiles (Les recettes de construction)

### A. Le Backend (`Backend/Dockerfile`)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

*Pourquoi ?* On part d'un Linux léger (alpine) avec Node 18, on installe les dépendances et on lance le serveur.

### B. Le Client & l'Admin (`client/Dockerfile` et `admin/Dockerfile`)

On utilise un **Multi-stage build** :

```dockerfile
# Étape 1 : Build avec Node
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 

# Étape 2 : Nginx pour servir les fichiers
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
```

*Pourquoi ?* On utilise Node juste pour compiler le code Vite. Ensuite, on prend uniquement les fichiers compilés (`dist/`) qu'on place dans un serveur Nginx très rapide. L'image finale est donc toute petite !

---

## 3. L'Orchestration : `docker-compose.yml`

Ce fichier relie nos trois conteneurs.

- Il construit les images à partir des dossiers `./Backend`, `./client`, `./admin`.
- Il mappe les ports de notre machine vers les ports des conteneurs.
- Il s'assure que le backend démarre avant les front-ends.

---

## 4. Comment démarrer ?

Dans le terminal, à la racine du projet (`d:\Aridona-Full-Stack`), tape :

```bash
docker-compose up --build -d
```

Ensuite, tu pourras accéder à :

- **Client** : http://localhost:4545
- **Admin** : http://localhost:4546
- **Backend API** : http://localhost:4000
