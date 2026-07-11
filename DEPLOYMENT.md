# Documentation de Déploiement : Aridona Full-Stack (Docker)

Cette documentation explique comment déployer l'application Aridona Full-Stack à l'aide de Docker. L'architecture repose sur trois conteneurs distincts gérés via Docker Compose.

## Architecture

- **Backend** : API Node.js (Port exposé : 4000)
- **Client** : Application Front-end Vite + Nginx (Port exposé : 4545)
- **Admin** : Panel d'Administration Vite + Nginx (Port exposé : 4546)

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) installé sur la machine hôte.
- [Docker Compose](https://docs.docker.com/compose/install/) installé (inclus avec Docker Desktop).
- Les ports `4000`, `4545`, et `4546` doivent être libres.

## Déploiement en Local (ou Serveur de Production)

1. Clonez le dépôt et naviguez à la racine du projet :

   ```bash
   git clone <url-du-repo>
   cd Aridona-Full-Stack
   ```
2. Assurez-vous de configurer vos variables d'environnement. (Créez un `.env` dans le dossier `Backend` si nécessaire pour la base de données, les clés API, etc.).
3. Lancez la construction et le démarrage des conteneurs en mode détaché :

   ```bash
   docker-compose up --build -d
   ```
4. L'application est maintenant en ligne !

   - **Site Client** : [http://localhost:4545](http://localhost:4545)
   - **Panel Admin** : [http://localhost:4546](http://localhost:4546)
   - **API Backend** : [http://localhost:4000](http://localhost:4000)

## Arrêter l'application

Pour stopper tous les conteneurs liés au projet sans supprimer les images :

```bash
docker-compose down
```

## Mise à jour après modification du code

Si vous modifiez le code source (Backend ou Frontend), vous devez reconstruire les images pour appliquer les changements :

```bash
# Reconstruit les images et redémarre les conteneurs
docker-compose up --build -d
```

## Logs et Debugging

Pour voir les logs d'un service spécifique en temps réel (pratique pour le backend) :

```bash
# Voir les logs du backend
docker-compose logs -f backend

# Voir les logs du client
docker-compose logs -f client
```
