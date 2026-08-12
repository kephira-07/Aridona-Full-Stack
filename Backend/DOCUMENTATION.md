# Documentation Backend — Aridona Bijoux

API REST Node.js/Express/MongoDB (Mongoose) servant le site client (`client/`) et le panel admin (`admin/`). Upload d'images vers Cloudinary. Un seul compte administrateur, défini par variables d'environnement (pas de collection "admin" en base).

## 1. Architecture générale

```
Backend/
├── server.js                  # Point d'entrée : middlewares, montage des routes, démarrage
├── config/
│   ├── mongoosedb.js          # Connexion MongoDB Atlas
│   ├── cloudinary.js          # Config SDK Cloudinary
│   └── siteConfig.js          # Constantes partagées avec le client (frais de livraison...)
├── middleware/
│   ├── auth.js                # JWT + RBAC (rôles) + vérification stricte de l'email admin
│   └── multer.js              # Upload disque temporaire (os.tmpdir()) avant envoi à Cloudinary
├── models/                    # Schémas Mongoose
├── controller/                # Logique métier
└── routes/                    # Déclaration des endpoints Express
```

### Démarrage (`server.js`)

1. `connectCloudinary()` — config synchrone du SDK Cloudinary.
2. `connectDB()` — connexion Mongoose, **attendue avant** `app.listen` (si elle échoue, `process.exit(1)`).
3. `produitModel.syncIndexes()` / `articleModel.syncIndexes()` — aligne les index Mongo (notamment l'index texte) sur le schéma courant à chaque démarrage. Idempotent.
4. `app.listen(PORT)`.

Middlewares globaux : `express.json()`, `cors()` restreint à une liste blanche d'origines (`https://aridona.store` + ports de dev locaux par défaut, personnalisable via la variable d'environnement `CORS_ORIGIN`, liste séparée par des virgules).

Un gestionnaire d'erreurs global est placé **après** toutes les routes : il intercepte spécifiquement les erreurs Multer (fichier trop lourd, format refusé) qui, en Multer 2.x, se déclenchent avant d'atteindre les contrôleurs et échapperaient sinon à tout `try/catch`. Sans lui, une image rejetée renverrait une page HTML brute au lieu d'un JSON `{ success: false }`.

### Variables d'environnement (`.env`, jamais commité)

| Variable | Rôle |
|---|---|
| `MONGO_URI` | Connexion MongoDB Atlas (cluster partagé dev/prod) |
| `PORT` | Port d'écoute (défaut 4000) |
| `JWT_SECRET` | Signature des tokens JWT |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Identifiants du compte admin unique (comparaison directe, pas de hash pour le mot de passe admin) |
| `CLOUDINARY_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | SDK Cloudinary |
| `RESEND_API_KEY` | Envoi d'emails (mot de passe oublié, formulaire de contact) via Resend — domaine `aridona.store` vérifié (DNS chez Namecheap), expéditeur `contact@aridona.store` |
| `FRONTEND_URL` | Base du lien inséré dans l'email de réinitialisation (`/reset-password/:token`) |
| `CORS_ORIGIN` *(optionnel)* | Liste d'origines autorisées séparées par des virgules ; remplace la liste par défaut codée dans `server.js` si présente |

### Authentification (`middleware/auth.js`)

`auth(roles = [])` est une factory de middleware :
- Lit le token depuis le header `token` **ou** `Authorization: Bearer <token>`.
- Vérifie le JWT (`JWT_SECRET`), extrait `id`/`role`/`email`, les attache à `req.userId`/`req.userRole`/`req.userEmail` **et** les réinjecte dans `req.body.userId` (compatibilité avec des contrôleurs plus anciens qui le lisent depuis le body).
- Si `roles` est fourni (ex. `['admin']`) et que le rôle du token n'y figure pas → 403.
- **Sécurité renforcée admin** : même avec `role: 'admin'` dans le token, si l'email du token ne correspond pas exactement à `ADMIN_EMAIL`, l'accès est refusé (403). Ça empêche un token admin forgé/rejoué avec un autre email de passer.
- `TokenExpiredError` renvoie un message dédié ("Session expirée").

Utilisation : `auth()` = connecté (tout rôle), `auth(['admin'])` = admin uniquement.

### Upload d'images (`middleware/multer.js`)

- Stockage disque **temporaire** via `os.tmpdir()` (portable, fonctionne même si seul `/tmp` est inscriptible sur l'hébergeur).
- Filtre : uniquement `image/*`, sinon erreur (interceptée par le handler global dans `server.js`).
- Limite : 5 Mo/fichier.
- Chaque contrôleur qui l'utilise envoie ensuite le fichier à Cloudinary (`cloudinary.uploader.upload(file.path, ...)`) puis le supprime du disque local via un helper `cleanLocalFile(s)` — **à ne jamais oublier** dans un nouveau contrôleur, sinon les fichiers temporaires s'accumulent sur le serveur.

---

## 2. Modèles (Mongoose)

### `produitModel.js` — collection `produits`

| Champ | Type | Notes |
|---|---|---|
| `nom`, `description`, `prix` | String / String / Number | requis |
| `image` | `[{url, publicId, alt}]` | requis, au moins 1 élément (validateur custom) |
| `categorie` | ObjectId → `categorie` | requis |
| `matiere` | String | défaut `"Acier Inoxydable"` |
| `couleurs` | `[String]` | enum `["Doré", "Argenté", "Or Rose"]`, défaut `["Doré"]` |
| `tags` | `[String]` | indexé |
| `sizes` | `[String]` | vide = produit à taille unique (pas de sélection forcée côté panier) |
| `slug` | String | unique, généré via `generateUniqueSlug()` |
| `meilleurVente` | Boolean | flag éditorial posé par l'admin — **pas** un compteur de favoris client réel |
| `enStock` | Boolean | défaut `true` |
| `metaTitle` (≤70) / `metaDescription` (≤160) | String | overrides SEO optionnels |

Index texte pondéré (`nom` ×10, `tags` ×8, `matiere`/`couleurs` ×5, `description` ×1), langue française — alimente `/api/produit/search`.

### `orderModel.js` — collection `orders`

- `itemSchema` (sous-document, snapshot de l'article au moment de la commande) : `_id` (ref produit), `nom`, `prix`, `size` (défaut `"Standard"`), `quantity`, `image: [String]` (⚠️ tableau de **chaînes**, alors que `produitModel.image` est un tableau d'objets `{url, publicId, alt}` — le contrôleur extrait `.url` avant insertion, voir `orderController.js`).
- `addressSchema` (sous-document) : `firstName`, `lastName`, `email`, `street`, `city`, `zipcode`, `phone`, tous requis.
- `orderSchema` : `userId` (ObjectId nullable → `utilisateur`, `null` = commande invité), `items`, `address` (**doit rester attaché au schéma** — un bug historique où `addressSchema` était défini mais jamais rattaché a fait que Mongoose supprimait silencieusement l'adresse de chaque commande en mode strict), `amount`, `paymentMethod` (enum `COD`/`Mobile Money`/`Manuel`), `payment` (Boolean), `status` (enum `Commande passée` → `En cours de préparation` → `Expédié` → `Livré`, ou `Annulé`).

### `utilisateurModel.js` — collection `utilisateurs`

`name`, `email` (unique), `password` (requis **seulement si pas de `googleId`**, via validateur conditionnel), `googleId`, `avatar`, `cartData` (objet libre `{ produitId: { taille: quantité } }`), `telephone`, `adresse`, `ville` (défaut `"Lomé"`), `resetPasswordToken`/`resetPasswordExpires` (réinitialisation mot de passe).

### `categorieModel.js` — collection `categories`

`nom` (unique), `image` (String — **pas** d'objet `{url, publicId}` contrairement aux produits/articles, donc l'extraction du `publicId` Cloudinary passe par `getPublicIdFromUrl()` en parsant l'URL), `slug` (unique).

### `avisModel.js` — collection `avis`

`produit` (ref), `nom`, `note` (1-5), `commentaire`, `verifie` (placeholder non utilisé, pour un futur rapprochement avec les commandes), `approuve` (défaut `true` — publié immédiatement à la création, voir section Avis ci-dessous ; le champ reste disponible pour une modération manuelle a posteriori depuis l'admin).

### `articleModel.js` — collection `articles` (blog)

`titre`, `slug` (unique), `extrait` (≤300, résumé + repli meta description), `contenu` (texte brut, paragraphes séparés par une ligne vide côté frontend), `image` (`{url, publicId, alt}`), `auteur` (défaut `"Aridona Bijoux"`), `tags`, `publie` (défaut `false` — brouillon tant que non publié), `metaTitle`/`metaDescription`. Index texte français pondéré.

---

## 3. Contrôleurs & endpoints par domaine

### Produits (`produitController.js` / `routes/produitRoute.js`, base `/api/produit`)

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| GET | `/list` | public | Liste tous les produits (filtrable par `?categorieId=`), populate catégorie |
| GET | `/single/:id` | public | Détail d'un produit |
| GET | `/search?query=` | public | Recherche texte pondérée (nom/tags/matière/couleurs/description) |
| GET | `/feed.xml` | public | Flux Google Merchant Center (RSS 2.0 + namespace `g:`), généré en direct depuis la BDD à chaque requête |
| POST | `/add` | admin | Création (upload jusqu'à 4 images `image1..image4`) |
| PUT | `/update/:id` | admin | Modification (voir `imagesManifest` ci-dessous) |
| DELETE | `/remove/:id` | admin | Suppression produit + ses images Cloudinary |
| PUT | `/changer-stock/:id` | admin | Bascule `enStock` |
| GET | `/stats-dashboard` | admin | Voir section Dashboard |

**Slug unique** : `generateUniqueSlug(nom, excludeId)` — ajoute `-2`, `-3`... en cas de collision ; `excludeId` évite qu'un produit ne se bloque lui-même lors d'un renommage partiel.

**`imagesManifest`** (update uniquement) : tableau JSON décrivant l'état voulu de chacun des 4 emplacements d'image :
- `{ type: 'existing', url, publicId, alt }` — image conservée (alt éditable)
- `{ type: 'new', alt }` — emplacement dont le fichier est envoyé séparément via `imageN`
- `{ type: 'empty' }` (ou absent du tableau) — emplacement vidé

Si `imagesManifest` n'est pas fourni, les images ne sont pas touchées (compatibilité avec d'autres appels ne gérant pas les images). Les anciennes images Cloudinary ne sont détruites **qu'après** confirmation de l'enregistrement Mongo réussi, pour ne rien perdre en cas d'échec en cours de route.

**Flux Merchant Center (`getProductFeed`)** : contrairement au sitemap (généré au build), interroge la BDD à chaque requête car Google exige prix/stock à jour. Champs notables : `g:identifier_exists = no` (produits sans GTIN/MPN — cas normal pour de la bijouterie artisanale/achat marché), `g:availability` dérivé de `enStock`, prix formaté `"<montant> XOF"`.

### Commandes (`orderController.js` / `routes/orderRoute.js`, base `/api/order`)

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| POST | `/place` | public (token optionnel) | Créer une commande, connecté ou invité |
| GET | `/userorders` | connecté | Historique de l'utilisateur |
| GET/POST | `/list` | admin | Toutes les commandes |
| PUT/POST | `/status` | admin | Changer le statut logistique |

**`placeOrder`** :
- Le token est lu manuellement (pas de middleware `auth()` obligatoire) pour permettre les commandes invité ; s'il est invalide/expiré, on bascule silencieusement en mode invité plutôt que de rejeter la requête.
- **Le montant n'est jamais fait confiance côté client** : chaque `item._id` est re-résolu en base, le prix recalculé, et `FRAIS_LIVRAISON` (importée de `config/siteConfig.js`, source unique également exposée au client via `GET /api/config` — voir section Config ci-dessous) est ajouté au total stocké — ce total doit correspondre à ce que le client voit réellement (sous-total + livraison), notamment dans le message WhatsApp envoyé après commande.
- `produitModel.image` est un tableau d'objets `{url, publicId, alt}` ; `orderModel.itemSchema.image` attend `[String]` — la conversion (`.url` uniquement) se fait ici, pas dans le modèle.
- Si connecté, le panier BDD (`cartData`) est vidé après création de la commande.

### Catégories (`categorieController.js` / `routes/categorieRoute.js`, base `/api/categorie`)

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| GET | `/` | public | Liste (triée par nom) |
| POST | `/add` | admin | Création (1 image, upload `.single("image")`) |
| PUT | `/update/:id` | admin | Modification |
| DELETE | `/delete/:id` | admin | Suppression |

`deleteCategorie` **vérifie d'abord** qu'aucun produit ne référence encore la catégorie (`produitModel.countDocuments`) avant de toucher à Cloudinary — un blocage de suppression ne doit jamais laisser la catégorie orpheline de son image. `addCategorie` et `updateCategorie` vérifient tous deux les doublons de nom (évite une erreur Mongo brute `E11000` non gérée).

### Utilisateurs / Auth (`utilisateurController.js` / `routes/utilisateurRoute.js`, base `/api/utilisateur`)

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| POST | `/register` | public | Inscription (bcrypt, mdp ≥ 8 caractères) |
| POST | `/login` | public | Connexion classique |
| POST | `/admin` | public | Connexion admin (compare à `ADMIN_EMAIL`/`ADMIN_PASSWORD` en clair depuis l'env, pas de hash — c'est un compte unique, pas une collection) |
| POST | `/google-login` | public | Connexion/inscription via token Google OAuth (`access_token` → `googleapis.com/oauth2/v3/userinfo`) |
| POST | `/mot-de-passe-oublie` | public | Envoie un email Resend avec lien `FRONTEND_URL/reset-password/:token` (token brut envoyé, hash SHA-256 stocké en BDD, expire 1h). Réponse **neutre** que le compte existe ou non (anti-énumération) |
| POST | `/reinitialiser-mot-de-passe` | public | Applique le nouveau mot de passe si le hash correspond et n'a pas expiré |
| GET/POST | `/profil` | connecté | Profil (mot de passe exclu de la réponse) |
| PUT | `/modifier-profil` | connecté | Mise à jour nom/téléphone/adresse/ville |
| GET | `/panier` | connecté | Panier BDD (`cartData`) |
| POST | `/panier/ajouter` | connecté | Incrémente une taille d'un produit |
| POST | `/panier/update` | connecté | Fixe une quantité ; accepte `oldSize` pour migrer/supprimer l'ancienne clé lors d'un changement de taille |
| POST/DELETE | `/panier/supprimer` | connecté | Retire un article (les deux verbes existent car le frontend appelle `axios.delete`) |
| GET | `/liste` | admin | Liste tous les utilisateurs (sans mot de passe) |

`cartData` est stocké en base sous la forme `{ [produitId]: { [taille]: quantité } }` — structure libre (`type: Object`), pas de sous-schéma dédié.

### Avis / Reviews (`avisController.js` / `routes/avisRoute.js`, base `/api/avis`)

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| POST | `/ajouter` | public | Soumission — publié immédiatement (`approuve: true`) |
| GET | `/produit/:produitId` | public | Avis approuvés d'un produit + `moyenne`/`total` calculés |
| GET | `/admin` | admin | Tous les avis |
| PUT | `/approuver/:id` | admin | Repasse un avis à `approuve: true` (utile seulement s'il a été désapprouvé manuellement) |
| DELETE | `/supprimer/:id` | admin | Supprime un avis |

**Pas de modération préalable** : un avis est visible sur la fiche produit dès sa création. L'admin garde uniquement un droit de suppression a posteriori (page Avis Clients du panel) pour retirer un avis inapproprié — décision produit du 2026-08-06, changement volontaire par rapport à la version initiale qui bloquait tout avis avant validation admin.

### Configuration publique (`configController.js` / `routes/configRoute.js`, base `/api/config`)

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| GET | `/` | public | Réglages partagés lus par le client au démarrage |

Réponse : `{ fraisLivraison, monnaie, whatsappNum }`. Source unique de `FRAIS_LIVRAISON` (`config/siteConfig.js`, aussi utilisée par `orderController.js`) et du numéro WhatsApp — évite qu'ils soient dupliqués et désynchronisés entre le backend et `client/src/context/ShopContext.jsx` (qui les récupère au montage et les expose à tout le site, avec les valeurs précédemment codées en dur conservées comme repli si l'appel échoue).

### Contact (`contactController.js` / `routes/contactRoute.js`, base `/api/contact`)

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| POST | `/envoyer` | public (rate-limité) | Envoie le message du formulaire de contact par email via Resend |

Reçoit `{ nom, email, sujet, message }` depuis `Contact.jsx`/`Apropos.jsx`, envoie à `aridonabijoux@gmail.com` avec `reply_to` sur l'adresse du visiteur (réponse directe possible depuis la boîte mail). Limité à 5 requêtes / 15 min / IP (`express-rate-limit`) car c'est un endpoint public non authentifié qui déclenche un envoi d'email à chaque appel — sans ça, exposé au spam.

### Articles / Blog (`articleController.js` / `routes/articleRoute.js`, base `/api/article`)

| Méthode | Route | Accès | Fonction |
|---|---|---|---|
| GET | `/list` | public | Articles **publiés** uniquement |
| GET | `/single/:slug` | public | Un article publié (404 si brouillon ou inexistant) |
| GET | `/admin` | admin | Tous les articles, brouillons compris |
| POST | `/add` | admin | Création (1 image de couverture obligatoire) |
| PUT | `/update/:id` | admin | Modification (slug régénéré si le titre change) |
| DELETE | `/remove/:id` | admin | Suppression + nettoyage Cloudinary |

Même pattern que produits/catégories : slug unique auto-généré, upload puis suppression du fichier temporaire, suppression Cloudinary de l'ancienne image seulement après confirmation de la sauvegarde.

### Dashboard (`dashbordController.js`, monté dans `produitRoute.js` en `GET /api/produit/stats-dashboard`, admin uniquement)

Une seule fonction `getDashboardStats`, agrégations en parallèle (`Promise.all`) :

- Totaux catalogue : produits, catégories, ruptures de stock (`enStock: false`), produits "vedette" (`meilleurVente: true` — **pas** des favoris clients réels ; les favoris n'existent qu'en `localStorage` côté client, jamais synchronisés au backend).
- Chiffre d'affaires + nombre de commandes (exclut le statut `"Annulé"`).
- Top 5 produits les plus vendus : agrégation sur `orderModel.items`, avec `$lookup`/`$unwind` **avant** `$sort`/`$limit` — sinon un produit supprimé du catalogue mais présent dans un top 5 calculé "à l'aveugle" disparaîtrait après coup au lieu de laisser le 6ᵉ produit réellement éligible remonter.
- Top 5 zones de livraison (`address.city`).

---

## 4. Points d'attention pour la suite

- **Deux conventions d'image différentes coexistent** : `produitModel`/`articleModel` stockent `{url, publicId, alt}`, `categorieModel` stocke une simple `String` (URL). Si un nouveau modèle a besoin d'images, préférer la première forme (permet la suppression Cloudinary directe sans reparser l'URL).
- **Pas de suppression pour les commandes** : aucun endpoint `DELETE` n'existe sur `/api/order` — seule une intervention directe en base (script Mongoose) permet d'en effacer, volontairement, pour ne pas perdre d'historique commercial par erreur depuis l'admin.
- **`EventEmitter.defaultMaxListeners = 25`** dans `server.js` masque un `MaxListenersExceededWarning` sans en traiter la cause. Si ce warning réapparaît, chercher un `.on(...)` attaché à chaque requête sans être retiré, plutôt que d'augmenter encore la limite.

### Résolu depuis la dernière revue (2026-08-06)

- ~~`FRAIS_LIVRAISON` dupliqué~~ — centralisé dans `config/siteConfig.js`, exposé au client via `GET /api/config`.
- ~~CORS ouvert à toutes origines~~ — restreint à une liste blanche (voir section Middlewares).
- ~~Avis modérés avant publication~~ — publiés immédiatement, suppression a posteriori uniquement (voir section Avis).
- ~~Domaine Resend non vérifié~~ — `aridona.store` vérifié le 2026-08-06, expéditeur `contact@aridona.store` (mot de passe oublié et contact fonctionnent désormais pour n'importe quel destinataire, plus seulement l'email du compte Resend).
