# Documentation Client — Aridona Bijoux

Site public (React + Vite), consommant l'API décrite dans `Backend/DOCUMENTATION.md`. Pas de panier serveur obligatoire : les invités achètent sans compte, la commande finale se conclut sur WhatsApp (pas de paiement en ligne intégré).

## 1. Architecture générale

```
client/
├── scripts/generate-sitemap.js   # Génère public/sitemap.xml avant chaque build (hook "prebuild")
├── src/
│   ├── main.jsx                  # Providers racine (Router, Google OAuth, ShopContext, Helmet)
│   ├── App.jsx                   # Layout global + déclaration des routes (lazy-loaded)
│   ├── config.js                 # backendUrl (VITE_BACKEND_URL, pas de fallback)
│   ├── context/ShopContext.jsx   # Source de vérité unique : catalogue, panier, favoris, auth
│   ├── composant/                # Composants réutilisables (Navbar, cartes produit, etc.)
│   └── pages/                    # Une page par route
```

### Providers (`main.jsx`)

Ordre d'imbrication : `BrowserRouter` → `GoogleOAuthProvider` (clientId `VITE_GOOGLE_CLIENT_ID`) → `ShopContextProvider` → `HelmetProvider` → `App`. `ShopContextProvider` doit englober `App` avant `HelmetProvider` n'a pas d'importance particulière, mais il doit rester **sous** `GoogleOAuthProvider` car `Login.jsx`/`CommandeConfirmee.jsx` utilisent `useGoogleLogin()`.

### Routing (`App.jsx`)

Toutes les pages sauf les 4 composants de structure (`Navbar`, `SidebarPanier`, `Footer`, `ScrollToTop`) sont chargées en `React.lazy` + `Suspense` (spinner `PageLoader` pendant le chargement du chunk).

| Route | Page | Notes |
|---|---|---|
| `/`, `/home` | `Home` | |
| `/collection` | `Collection` | accepte `location.state.initialCategory` (ID) ou `initialCategorySlug` (slug) |
| `/produit/:slug` | `PageProduit` | |
| `/panier` | `Panier` | |
| `/commander` | `PasserCommande` | |
| `/commande-confirmee` | `CommandeConfirmee` | redirige vers `/` si accédée directement (pas d'état de navigation) |
| `/login` | `Login` | sert aussi de page profil si connecté |
| `/favoris` | `PageFavoris` | `noindex` (contenu localStorage, personnel) |
| `/reset-password/:token` | `ResetPassword` | |
| `/a-propos` | `Apropos` | |
| `/conditions-utilisation` | `ConditionUtilisation` | |
| `/politique-confidentialite` | `PolitiqueConfidentialite` | |
| `/contact` | `Contact` | |
| `/blog` | `Blog` | |
| `/blog/:slug` | `ArticleDetail` | |
| `*` | `Erreur404` | `noindex` — servie en HTTP 200 par le SPA fallback nginx, donc `noindex` évite un soft-404 aux yeux de Google |

### `ShopContext.jsx` — état global

Seul contexte de l'app ; toute page/composant y accède via `useContext(ShopContext)`.

**État et persistance :**
- `produits` — initialisé avec un mock local (`assets/image.js`) puis remplacé par `GET /api/produit/list` dès que l'appel réussit (`getProductsData`). Si l'API échoue, le mock reste affiché ("Mode Secours") plutôt que de bloquer l'affichage.
- `categories` — même logique via `GET /api/categorie/`, sans mock de repli (reste vide en cas d'échec).
- `delivery_free` / `whatsappNum` — initialisés avec des valeurs de repli codées en dur (500 FCFA / numéro WhatsApp), puis remplacés par `GET /api/config` (`getSiteConfig`) au montage — source unique côté backend (`Backend/config/siteConfig.js`), plus aucune duplication de ces constantes dans les composants.
- `panierProduits` — objet `{ [produitId]: { [taille]: quantité } }`. Persisté dans `localStorage` **seulement si l'utilisateur n'est pas connecté** (`if (!token)`) ; une fois connecté, le panier vit côté serveur (`GET /api/utilisateur/panier` au login, synchronisé à chaque mutation).
- `favoris` — tableau d'IDs produit, persisté dans `localStorage` uniquement (jamais synchronisé au backend, à tout niveau de connexion).
- `token` — lu depuis `localStorage.getItem('token')` au montage.

**Fonctions exposées (extrait des plus significatives) :**
- `ajouterPanier(produitId, size)` — valide le stock (`enStock`) et la taille (si le produit a plusieurs déclinaisons réelles, une taille valide est obligatoire ; sinon repli automatique sur la taille unique ou `'Taille Unique'`). Met à jour l'état local en premier (optimiste), puis synchronise en BDD si connecté (`POST /api/utilisateur/panier/ajouter`), sans annuler l'action locale en cas d'échec réseau.
- `modifierTaillePanier(produitId, ancienneTaille, nouvelleTaille)` — fusionne les quantités si la nouvelle taille existe déjà dans le panier ; synchro `POST /api/utilisateur/panier/update` avec `oldSize`/`newSize`.
- `supprimerDuPanier` / `updateQuantity` — retrait local immédiat ; en cas d'échec de la synchro BDD, **aucun toast d'erreur** n'est affiché (l'état local a déjà réussi, un souci serveur ne doit pas alarmer inutilement l'utilisateur).
- `estTailleValidePourProduit(produitInfo, taille)` — règle centrale ("une taille n'est valable que si elle appartient réellement à `product.sizes`"), exportée pour que `Panier.jsx` l'utilise directement au lieu de la réimplémenter.
- `panierNecessiteChoixTaille()` — garde-fou "taille manquante" côté panier global, construit sur `estTailleValidePourProduit`. Utilisée par `SidebarPanier.jsx` (bloque le passage direct à la commande) et par `Panier.jsx`.
- `getPanierMontant()` / `getPanierCount()` — recalculent en parcourant `panierProduits` × `produits` à chaque appel (pas de mémoïsation), en cherchant le prix actuel du produit plutôt qu'un prix figé au moment de l'ajout.

### Config SEO/build

- `scripts/generate-sitemap.js` (exécuté via `npm run prebuild`, donc automatiquement avant chaque `vite build`) — récupère `/api/produit/list` et `/api/article/list` en direct au moment du build, génère `public/sitemap.xml` avec : pages statiques (accueil, collection, blog, à-propos, contact, mentions légales), une entrée par produit **en stock** (`enStock !== false`), une entrée par article. Se dégrade en douceur si le backend est injoignable (sitemap statique uniquement, warning en console plutôt qu'échec de build).
- `vite.config.js` — découpe manuelle des chunks (`react-vendor`, `icons`, `toastify`) pour limiter le poids du bundle principal.

---

## 2. SEO — patterns transverses

- **`react-helmet-async`** sur chaque page publique indexable : `title`, `meta description`, `canonical`, Open Graph. Absent ou associé à `noindex` sur les pages sans valeur SEO (`/favoris`, `/commande-confirmee`, `Erreur404`).
- **JSON-LD (schema.org)** à plusieurs niveaux :
  - `Hero.jsx` déclare un schéma `Store` global (nom, description, adresse, zone desservie) — **sans** champ `makesOffer` (retiré après une erreur de validation Google Search Console : un `Offer`/`itemOffered` incomplet à ce niveau était traité comme un `Product` à part entière et échouait la validation des résultats enrichis).
  - `ProduitItem.jsx` (utilisé dans les grilles/listes) et `PageProduit.jsx` (fiche produit complète) déclarent chacun un schéma `Product` avec `offers`. La fiche produit ajoute `aggregateRating`/`review` **uniquement s'il existe de vrais avis publiés** (`totalAvis > 0`) — jamais de note ou d'avis fabriqués, conformément aux règles Google sur les faux avis.
  - `ArticleDetail.jsx` déclare un schéma `BlogPosting`.
- **Un seul `<h1>` par page** : sur `Hero.jsx`, le titre desktop statique est le `<h1>`, tandis que le titre qui change à chaque slide du carrousel mobile est volontairement un `<h2>` (corrige un doublon de `<h1>` détecté précédemment).
- **Texte alternatif (`alt`)** systématiquement dérivé du champ `alt` renseigné côté admin (`{url, publicId, alt}`), avec repli sur le nom du produit/article si absent — jamais d'`alt` vide sur les images de contenu.
- **Contenu marketing volontairement factuel** : les descriptions (Hero, DerniereCollection, MeilleurVente) évitent toute promesse invérifiable (ex: un ancien "livraison en moins de 30 minutes" a été retiré au profit de "livraison rapide à Lomé/à domicile", formulation honnête et non engageante).

---

## 3. Composants (`composant/`)

- **`Navbar.jsx`** — bandeau d'annonce défilant (CSS `@keyframes`), barre desktop (logo + `BarRecherche` + icônes compte/favoris/panier), version mobile avec `MenuMobile` (drawer) et accordéon de recherche. Le compteur panier lit `getPanierCount()` du contexte à chaque render.
- **`SidebarPanier.jsx`** — tiroir panier global monté une fois dans `App.jsx`, piloté par `panierOuvert`/`setPanierOuvert` du contexte (pas de route dédiée). `allerACommande()` applique le garde-fou taille (`panierNecessiteChoixTaille()`) : si une taille manque, toast d'erreur + redirection vers `/panier` au lieu de `/commander`.
- **`BarRecherche.jsx`** — recherche instantanée côté client via **Fuse.js** (fuzzy search sur `produits`/`categories` déjà chargés dans le contexte, pas d'appel à `/api/produit/search`), avec debounce de 150 ms, navigation clavier (flèches + Entrée), overlay plein écran dédié sur mobile. Distincte de la recherche `Collection.jsx` (celle-ci fait un filtre exact `includes`, pas fuzzy).
- **`Categorybar.jsx`** — bandeau de catégories scrollable horizontalement, comportement différent selon la page : sur `/` et `/home`, clic → navigation vers `/collection` avec état ; ailleurs (rendu dans `Collection.jsx`), clic → toggle du filtre local. Devient sticky après 900px de scroll sur la home uniquement.
- **`Hero.jsx`** — bloc principal de la home : image statique + CTA côté gauche (desktop), pop-box avec effet machine à écrire côté droit (desktop), carrousel autoplay dédié sur mobile. Contient le schéma JSON-LD `Store` (voir section SEO).
- **`ProduitItem.jsx`** — carte produit réutilisée partout (Collection, DerniereCollection, MeilleurVente, ApparenteProduit, résultats de recherche). Bouton d'ajout rapide qui appelle `ajouterPanier(id, "Unique")` **sans tenir compte des vraies déclinaisons du produit** — sur un produit à tailles multiples, ça peut poser une taille `"Unique"` qui n'existe pas dans `sizes`, déclenchant ensuite le garde-fou `panierNecessiteChoixTaille()` à la case panier (comportement voulu : l'ajout rapide n'a pas d'UI de sélection de taille, donc le système renvoie l'utilisateur choisir au bon endroit).
- **`ApparenteProduit.jsx`** — suggestions "Créations Similaires" avec 3 niveaux de repli en cascade : (1) même catégorie + même matière, (2) complété avec la même catégorie seule, (3) complété avec n'importe quel autre produit du catalogue — toujours exactement 5 suggestions si le catalogue le permet.
- **`MenuMobile.jsx`** — drawer de navigation mobile ; réutilise `context.categories` s'il est déjà chargé (évite un second appel réseau), sinon fetch dédié.
- **`PanierTotal.jsx`** — résumé sous-total/livraison/total, réutilisé par `SidebarPanier` (implicitement, logique dupliquée) et surtout par `Panier.jsx`/`PasserCommande.jsx`.
- **`Titre.jsx`**, **`Boutton.jsx`**, **`BoutonRetour.jsx`** — composants de présentation purs (typographie de section, CTA stylé, bouton `navigate(-1)`).

---

## 4. Pages (`pages/`)

### `Home.jsx`
Assemble `Hero`, `Categorybar`, `DerniereCollection`, `MeilleurVente`, `AboutSection`. Meta SEO statique (titre/description/canonical/OG).

### `Collection.jsx`
Page catalogue avec filtres. Dictionnaire `SEO_TEXTS` : titre/description `<h1>` + meta dynamiques selon la catégorie sélectionnée (matching par sous-chaîne insensible à la casse sur le nom de catégorie : "bague", "collier", "bracelet", "boucle"/"oreille", etc.), avec repli générique si aucune correspondance. Filtres cumulables : catégorie (un seul choix actif à la fois malgré l'apparence multi-sélection — `toggleCategorie` remplace plutôt qu'ajoute), matière (liste `matieresDisponibles` **dérivée dynamiquement** des vraies valeurs `matiere` présentes dans `produits`, plus de valeurs codées en dur déconnectées du catalogue), tri prix. Réceptionne la catégorie pré-sélectionnée envoyée par `Categorybar` (`initialCategory`, un ID) ou par `BarRecherche` (`initialCategorySlug`, résolu une fois `categoriesList` chargée).

### `PageProduit.jsx`
Fiche produit complète : galerie d'images avec zoom modal, sélection de taille (`selectedSizes` en tableau — permet en théorie plusieurs tailles à la fois via des boutons toggle, chacune ajoutée séparément au panier au clic sur "Ajouter"), bouton d'alerte WhatsApp si rupture de stock (au lieu du bouton d'ajout), produits apparentés. Construit son propre schéma `Product` JSON-LD avec avis réels uniquement.

**Section avis** (redesign 2026-08-06) : carte de résumé (note moyenne + répartition en barres par étoile 5→1, calculée depuis `avisListe`), formulaire d'envoi avec sélecteur de note en étoiles cliquables (plus de `<select>`), grille de cartes avis (avatar = initiale du nom, date, note, commentaire). Les avis sont **publiés immédiatement** à la soumission (`POST /api/avis/ajouter`, plus de modération admin préalable) — `handleSoumettreAvis` rappelle `fetchAvis()` (extrait du `useEffect` de chargement pour être réutilisable) juste après un envoi réussi afin que le nouvel avis apparaisse sans recharger la page.

### `Panier.jsx`
Page panier complète (vs. le tiroir `SidebarPanier`, plus sommaire). `verifierTaillesEtProceder()` bloque le passage à la caisse si un produit est en rupture de stock **ou** si une taille invalide est détectée, via `estTailleValidePourProduit()` du contexte (plus de logique réimplémentée localement). Permet de changer la taille d'un article directement via un `<select>` (surligné en rouge si la taille actuelle n'est pas valide).

### `PasserCommande.jsx`
Formulaire de livraison (nom, téléphone, pays/ville/quartier) + choix du mode de paiement (COD / Mobile Money, informatif seulement — aucune intégration de paiement réelle). À la soumission : construit `orderItems` depuis `panierProduits` + `produits`, extrait l'`userId` du JWT côté client (décodage manuel du payload base64, pas de librairie), envoie `POST /api/order/place`, puis construit un message WhatsApp pré-rempli (récapitulatif complet + total) et redirige vers `/commande-confirmee` avec `whatsappUrl` en état de navigation. Le numéro WhatsApp (`WHATSAPP_NUMBER`) vient de `whatsappNum` (contexte, source backend), avec repli codé en dur si le contexte n'est pas encore chargé.

### `CommandeConfirmee.jsx`
Page affichée juste après l'enregistrement de la commande (avant confirmation WhatsApp) — construite spécifiquement pour répondre au champ "page vue après achat" de Google Business Profile. Redirige vers `/` si accédée sans état de navigation (évite l'accès direct/rechargement). Propose optionnellement la création de compte via Google OAuth si l'utilisateur a commandé en invité (`estInvite`). `noindex`.

### `Login.jsx`
Combine formulaire connexion/inscription/mot-de-passe-oublié **et** page de profil (bascule selon `token && profil`). Décodage/affichage read-only puis formulaire d'édition (nom, téléphone, adresse, ville) via `PUT /api/utilisateur/modifier-profil`. Connexion Google via `useGoogleLogin` → `POST /api/utilisateur/google-login`.

### `PageFavoris.jsx`
Grille des produits dont l'ID figure dans `favoris` (contexte, localStorage uniquement). Action groupée "Tout ajouter au panier et commander" (`ajouterTousLesFavorisAuPanier` puis redirection `/panier`). `noindex`.

### `ResetPassword.jsx`
Formulaire nouveau mot de passe (`≥8` caractères, doit correspondre à la confirmation), lit le `token` depuis l'URL (`/reset-password/:token`), `POST /api/utilisateur/reinitialiser-mot-de-passe`.

### `Apropos.jsx`
Page vitrine + formulaire de contact. Soumission → `POST /api/contact/envoyer` (Resend, expéditeur `contact@aridona.store`, destinataire `aridonabijoux@gmail.com`) avec état de chargement (`envoiEnCours`) et gestion d'erreur via toast. Numéro WhatsApp lu depuis `whatsappNum` (contexte).

### `Contact.jsx`
Variante dédiée du formulaire de contact (design différent, thème sombre) — même intégration `POST /api/contact/envoyer` qu'`Apropos.jsx`.

### `ConitionUtilisation.jsx` / `PolitiqueConfidentialite.jsx`
Pages légales structurées en tableau `articles` (contenu long-forme, 14-15 articles chacune), design cohérent avec l'identité ambre/or du site (`font-ebgaramond`/`font-caveat`/`font-dmsans` déjà chargées globalement). Coordonnées de contact réelles (email + WhatsApp).

### `Blog.jsx` / `ArticleDetail.jsx`
Liste (`GET /api/article/list`, publiés uniquement) et détail (`GET /api/article/single/:slug`) du blog. `ArticleDetail` découpe `contenu` en paragraphes via `split(/\n\s*\n/)` (convention : une ligne vide sépare deux paragraphes, cohérente avec l'indication donnée à l'admin dans `admin/src/pages/Articles.jsx`).

### `Erreur404.jsx`
Catch-all de `App.jsx`. `noindex` pour éviter qu'une route SPA renvoyant du 200 HTTP soit indexée comme contenu valide par Google (soft-404).

---

## 5. Points d'attention pour la suite

- **Recherche `BarRecherche` (Fuse.js, fuzzy) vs filtre `Collection.jsx` (`includes` strict)** utilisent deux logiques de correspondance différentes pour le même champ `nom` — une recherche qui trouve un résultat dans la barre peut donc ne rien afficher une fois arrivée sur `/collection` si le texte contient une faute de frappe que seul Fuse.js tolère.
- **Pas de pagination** sur `Collection.jsx`, `Blog.jsx` ni `PageFavoris.jsx` — tout le catalogue/tous les articles sont chargés et filtrés en mémoire côté client. À surveiller si le catalogue grossit significativement.

### Résolu depuis la dernière revue (2026-08-06)

- ~~Filtre "Par Matière" de `Collection.jsx` non fonctionnel~~ — liste désormais dérivée dynamiquement des vraies valeurs `matiere` du catalogue.
- ~~Numéro WhatsApp dupliqué en dur~~ — centralisé dans `ShopContext` (`whatsappNum`, source `GET /api/config`), utilisé partout avec repli codé en dur uniquement en cas d'échec du chargement.
- ~~Formulaires de contact non fonctionnels~~ — `Apropos.jsx`/`Contact.jsx` envoient réellement un email via `POST /api/contact/envoyer` (Resend, domaine `aridona.store` vérifié).
- ~~Logique de validation de taille dupliquée~~ — centralisée dans `ShopContext.estTailleValidePourProduit`, réutilisée par `Panier.jsx`.
- ~~Avis clients modérés avant publication~~ — publiés immédiatement, section entièrement redessinée sur `PageProduit.jsx` (voir section dédiée ci-dessus).
