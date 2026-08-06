# Documentation Admin — Aridona Bijoux

Panel d'administration React (Vite), consommant l'API définie dans `Backend/DOCUMENTATION.md`. Un seul compte admin (pas de gestion de rôles multiples côté UI). Déployé sous le chemin `/admin/` (voir `vite.config.js` → `base: '/admin/'`).

## 1. Architecture générale

```
admin/
├── src/
│   ├── main.jsx            # Point d'entrée : BrowserRouter avec basename="/admin"
│   ├── App.jsx              # Auth gate + définition des routes protégées
│   ├── config.js            # backendUrl (VITE_BACKEND_URL)
│   ├── components/
│   │   ├── Navbar.jsx       # Barre du haut (branding + déconnexion)
│   │   └── Sidebar.jsx      # Navigation latérale (8 sections)
│   ├── constants/
│   │   └── produit.js      # Tailles/couleurs/matières partagées entre Add.jsx et Edit.jsx
│   └── pages/                # Une page par section fonctionnelle
```

### Authentification (`App.jsx` + `Login.jsx`)

- Pas de router dédié pour l'auth : `App.jsx` garde le `token` en `useState` (initialisé depuis `localStorage.getItem('token')`), et **si `token` est vide, affiche directement `<Login />`** au lieu du layout complet — aucune route publique n'existe, tout le panel est derrière ce garde.
- Un `useEffect` synchronise le state vers `localStorage` à chaque changement (écrit `token`, supprime la clé si vide).
- `Login.jsx` appelle `POST /api/utilisateur/admin` (voir Backend) puis `setToken(...)` ; le `useEffect` de `App.jsx` persiste ce token sous la clé `localStorage` `token` — seule clé utilisée (l'ancienne clé redondante `admin_token`, écrite en double par `Login.jsx` et lue en repli par `Utilisateurs.jsx`, a été retirée).
- Le token est transmis à chaque page via prop (`<Route element={<Page token={token} />} />`), puis chaque page l'envoie aux appels API dans **deux headers simultanément** : `token: <jwt>` et `Authorization: Bearer <jwt>` — redondance qui couvre les deux façons dont `middleware/auth.js` sait lire le token côté backend.
- Déconnexion (`Navbar.jsx`) : `setToken('')` + suppression manuelle de `localStorage.token` (le `useEffect` de `App.jsx` s'en chargerait aussi, la double suppression est inoffensive).

### Routing (`App.jsx`, base `/admin`)

| Route | Page | Notes |
|---|---|---|
| `/` | → redirige vers `/listeProduits` | |
| `/dashbord` | `DashboardStats` | orthographe volontairement conservée sans accent, cohérente partout (route + lien Sidebar) |
| `/add` | `Add` | création produit |
| `/edit/:id` | `Edit` | édition produit |
| `/orders` | `Orders` | |
| `/categories` | `Categories` | |
| `/listeProduits` | `ListeProduits` | |
| `/avis` | `Avis` | |
| `/articles` | `Articles` | |
| `/utilisateurs` | `Utilisateurs` | |
| `*` | → redirige vers `/listeProduits` | catch-all |

### Config (`config.js`)

`backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"` — **doit pointer vers l'API de prod au build** (via `.env` non commité, jamais `.env.local` laissé par erreur dans l'image Docker, cf. incident déjà rencontré dans ce projet).

---

## 2. Pages

### `Login.jsx`

Formulaire email/mot de passe → `POST /api/utilisateur/admin`. Pas d'inscription ni de récupération de mot de passe côté admin (un seul compte, géré par variables d'environnement backend).

### `Add.jsx` — Créer un produit

- Charge la liste des catégories au montage (`GET /api/categorie`) et pré-sélectionne la première.
- Formulaire : nom, description, prix, catégorie, matière (liste `availableMatieres` importée de `src/constants/produit.js`, indépendante de tout enum backend), couleurs (toggle multi-sélection, doit toujours en garder au moins une — bloqué côté UI par un `toast.warning`), tailles (toggle multi-sélection libre, liste `availableSizes` du même fichier de constantes), tags (saisie texte séparée par virgules, aperçu sous forme de puces), jusqu'à 4 images avec alt-text individuel, `metaTitle`/`metaDescription` optionnels (compteurs de caractères 70/160 affichés).
- Soumission : `FormData` → `POST /api/produit/add`. Les tableaux (`sizes`, `couleurs`, `alts`) sont sérialisés en JSON string avant l'envoi (le backend les re-parse via son `parseArrayHelper`).
- Après succès, réinitialise entièrement le formulaire (pas de redirection).

### `Edit.jsx` — Modifier un produit

- Récupère `id` depuis l'URL (`/edit/:id`), charge en parallèle les catégories et `GET /api/produit/single/:id`.
- Reconstruit un tableau `existingImages` (4 emplacements, `null` si vide) à partir de `produit.image`, chaque entrée gardant `{url, publicId, alt}` — nécessaire pour reconstituer le `imagesManifest` attendu par le backend.
- Chaque emplacement d'image a 3 états visuels : nouvelle photo sélectionnée (bordure ambre, badge "Nouveau"), photo existante (bordure neutre, alt éditable), slot vide (zone de dépôt).
- À la soumission, construit le `imagesManifest` (voir contrat détaillé dans `Backend/DOCUMENTATION.md`) : `{ type: 'new', alt }` si un nouveau fichier est sélectionné pour ce slot, `{ type: 'existing', ...existingImages[i] }` si l'ancienne photo est conservée, `{ type: 'empty' }` sinon. Bloque la soumission si tous les slots sont vides.
- Envoie en `PUT /api/produit/update/:id`, puis `navigate('/listeProduits')` (succès ou annulation).

### `ListeProduits.jsx` — Catalogue

- `GET /api/produit/list` au montage.
- Recherche **côté client uniquement** (filtre en mémoire sur `list`, pas d'appel à `/api/produit/search`) par nom ou nom de catégorie.
- Toggle stock en direct (`PUT /api/produit/changer-stock/:id`) avec mise à jour optimiste de l'état local après confirmation serveur.
- Suppression (`DELETE /api/produit/remove/:id`) avec confirmation navigateur (`window.confirm`).
- Contient des helpers de compatibilité (`getImageUrl`, `getImageAlt`, `getCategorieNom`) qui gèrent aussi bien l'ancien format (chaîne simple) que le nouveau (`{url, publicId, alt}` / objet catégorie populé) — utile si d'anciennes données existent encore dans des états intermédiaires.

### `Categories.jsx` — Gestion des catégories

- Un seul composant gère à la fois la création et l'édition (mode déterminé par `idEdition !== null`), formulaire en colonne de gauche (sticky), tableau en colonne de droite.
- `chargerEdition(cat)` préremplit le formulaire et affiche l'image Cloudinary existante en aperçu ; si l'admin sélectionne une nouvelle image puis clique "Retirer", `handleRemoveImage` **restaure l'aperçu Cloudinary d'origine** plutôt que de vider l'aperçu (évite de perdre l'affichage de l'image actuelle par erreur).
- Création : `POST /api/categorie/add`. Modification : `PUT /api/categorie/update/:id` (image optionnelle — absente du FormData si non changée). Suppression : `DELETE /api/categorie/delete/:id` avec confirmation.

### `Orders.jsx` — Suivi des commandes

- `POST /api/order/list` (l'admin utilise le verbe POST bien que GET soit aussi disponible côté backend — les deux existent pour compatibilité).
- Affiche pour chaque commande : articles (image/nom/taille/quantité), adresse de livraison complète (affiche "Adresse non renseignée" en rouge si `order.address` est absent — c'était le symptôme visible du bug historique où l'adresse n'était jamais persistée, désormais corrigé côté backend), montant total, méthode de paiement, statut de paiement, et un `<select>` de statut logistique dont le changement déclenche immédiatement `POST /api/order/status`.
- Le `<select>` liste explicitement les 5 statuts de l'enum backend, y compris `"Annulé"`.

### `Utilisateurs.jsx` — Répertoire clients

- `GET /api/utilisateur/liste`, lecture seule (aucune action de modification/suppression depuis cette page).
- Récupère le token avec `propToken || localStorage.getItem('token')`.
- Tableau : nom, email, rôle (badge doré si `admin`), téléphone (ou "Non renseigné"), date d'inscription formatée en français.

### `DashboardStats.jsx` — Tableau de bord

- `GET /api/produit/stats-dashboard` (route montée dans `produitRoute.js` côté backend malgré le nom).
- 4 cartes en tête : chiffre d'affaires total, nombre de produits "Vedette" (flag éditorial `meilleurVente`, explicitement présenté comme "Sélection Boutique" et non comme des favoris clients réels — le libellé et l'icône ont été choisis pour ne pas induire en erreur), commandes traitées, zone de livraison principale.
- Ligne secondaire : total produits, total catégories, ruptures de stock (carte mise en évidence en rouge si `rupturesStock > 0`).
- Deux classements côte à côte : produits les plus vendus (quantité + CA généré) et produits vedette (même flag éditorial, présenté séparément).
- Graphique en barres horizontales (Chart.js / `react-chartjs-2`) des zones de livraison les plus demandées (`stats.zonesPlusDemandees`).
- Bouton de rafraîchissement manuel (pas de polling automatique).

### `Avis.jsx` — Avis clients

- `GET /api/avis/admin` (tous les avis).
- Les avis sont publiés immédiatement dès leur soumission côté client (plus de modération préalable, décision du 2026-08-06) — cette page sert désormais à **retirer a posteriori** un avis inapproprié, pas à valider avant publication.
- Filtre par défaut sur "Tous" (le filtre "En attente" reste disponible pour le cas résiduel où un avis serait repassé à `approuve: false` manuellement, mais ne contient plus rien par défaut).
- Bouton "Supprimer" (`DELETE /api/avis/supprimer/:id`, avec confirmation) ; le bouton "Approuver" (`PUT /api/avis/approuver/:id`) reste disponible mais n'est plus une étape obligatoire du flux.
- Affiche la note en étoiles, le commentaire, le nom du produit concerné (ou "Produit supprimé" si la référence est cassée).

### `Articles.jsx` — Journal / Blog

- Même structure que `Categories.jsx` (formulaire sticky à gauche + liste à droite), mais avec plus de champs : titre, extrait (≤300, compteur affiché), contenu (textarea `font-mono`, indication explicite "laissez une ligne vide entre deux paragraphes" — correspond au découpage `contenu.split(/\n\s*\n/)` fait côté client public), tags, image de couverture + alt-text, `metaTitle`/`metaDescription`, et un toggle "Publier immédiatement".
- `GET /api/article/admin` (liste complète, brouillons compris).
- Création : `POST /api/article/add`. Modification : `PUT /api/article/update/:id`. Suppression : `DELETE /api/article/remove/:id`.
- **Bascule rapide de publication** (`togglePublication`) : action séparée du formulaire d'édition complet — envoie un `FormData` contenant uniquement `publie` inversé, ce qui permet de publier/dépublier un article en un clic depuis la liste sans ouvrir le formulaire.
- Chaque ligne de la liste affiche un badge Publié/Brouillon, la date de création, et 3 actions rapides (bascule publication, éditer, supprimer).

---

## 3. Points d'attention pour la suite

- **Recherche produits côté client** dans `ListeProduits.jsx` — fonctionne bien tant que le catalogue reste petit ; si le nombre de produits grossit significativement, envisager de basculer sur `GET /api/produit/search` (déjà disponible côté backend, indexé et pondéré) plutôt qu'un filtre en mémoire sur la totalité de la liste.
- **`matiere` et `sizes` restent des listes statiques codées en dur** dans `src/constants/produit.js` (mutualisées entre `Add.jsx`/`Edit.jsx`, mais toujours indépendantes de tout enum réel côté backend — le modèle ne contraint que `couleurs`). Toute nouvelle matière ou taille standard s'ajoute à ce seul fichier désormais.
- **Pas de pagination** sur `ListeProduits`, `Orders`, `Utilisateurs`, `Avis` ni `Articles` — toutes les listes sont chargées intégralement à chaque visite. À surveiller si le volume de données augmente nettement (temps de chargement, poids de la réponse JSON).

### Résolu depuis la dernière revue (2026-08-06)

- ~~Route `/list` vs `/listeProduits` dans `Edit.jsx`~~ — corrigé, pointe vers la vraie route.
- ~~Deux clés localStorage pour le token~~ — `admin_token` retiré, seule `token` est utilisée.
- ~~`matiere`/`sizes`/`couleurs` dupliqués entre `Add.jsx` et `Edit.jsx`~~ — mutualisés dans `src/constants/produit.js`.
