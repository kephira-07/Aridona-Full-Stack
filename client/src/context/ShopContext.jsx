import { createContext, useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios'; 
import { produits as produitsMock } from '../assets/image';
import backendUrl from '../config';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  const monnaie = 'FCFA';

  // Valeurs de repli si /api/config est injoignable — la vraie source de vérité est le backend
  // (config/siteConfig.js), pour ne plus dupliquer ces constantes dans chaque composant.
  const [delivery_free, setDeliveryFree] = useState(500);
  const [whatsappNum, setWhatsappNum] = useState('22872656485');

  const [produits, setProduits] = useState(produitsMock);
  const [categories, setCategories] = useState([]);
  const [packs, setPacks] = useState([]);
  
  const [recherche, setRecherche] = useState('');
  const [montreRecherche, setMontreRecherche] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [panierOuvert, setPanierOuvert] = useState(false);

  // 🩹 Migration silencieuse : d'anciennes versions du code stockaient "Taille Unique"
  // au lieu de "Unique" pour les bijoux sans déclinaison (bug corrigé). On fusionne toute
  // clé héritée dans "Unique" pour ne pas laisser des paniers déjà enregistrés (invités
  // en localStorage, clients en MongoDB) avec un affichage cassé ("Taille: Taille Unique").
  const normaliserPanier = (panier) => {
    const resultat = structuredClone(panier || {});
    const produitsMigres = [];
    for (const produitId in resultat) {
      const tailles = resultat[produitId];
      if (tailles && Object.prototype.hasOwnProperty.call(tailles, 'Taille Unique')) {
        const quantiteHeritee = tailles['Taille Unique'];
        tailles['Unique'] = (tailles['Unique'] || 0) + quantiteHeritee;
        delete tailles['Taille Unique'];
        produitsMigres.push({ produitId, quantite: tailles['Unique'] });
      }
    }
    return { panier: resultat, produitsMigres };
  };

  // 🛒 Panier initialisé avec le localStorage (pour les invités)
  const [panierProduits, setPanierProduits] = useState(() => {
    try {
      const localCart = localStorage.getItem('panierProduits');
      const parsed = localCart ? JSON.parse(localCart) : {};
      return normaliserPanier(parsed).panier;
    } catch (e) {
      return {};
    }
  });

  // 🩹 Migration silencieuse : une version antérieure stockait un objet enrichi
  // {quantite, nom, prix, image, slug} par pack au lieu d'une simple quantité — d'anciens
  // paniers en localStorage peuvent encore contenir cette forme et faire planter le rendu
  // (React refuse d'afficher un objet). On ne garde que la quantité, quelle que soit la forme.
  const normaliserPanierPacks = (panier) => {
    const resultat = {};
    for (const packId in panier || {}) {
      const valeur = panier[packId];
      const quantite = valeur && typeof valeur === 'object' ? Number(valeur.quantite) || 0 : Number(valeur) || 0;
      if (quantite > 0) resultat[packId] = quantite;
    }
    return resultat;
  };

  // 🎁 Panier des packs — { [packId]: quantite }, même principe que panierProduits/produits :
  // seule la quantité est stockée, l'affichage se résout via la liste `packs` chargée à part.
  const [panierPacks, setPanierPacks] = useState(() => {
    try {
      const localPacks = localStorage.getItem('panierPacks');
      return normaliserPanierPacks(localPacks ? JSON.parse(localPacks) : {});
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    if (!token) {
      localStorage.setItem('panierPacks', JSON.stringify(panierPacks));
    }
  }, [panierPacks, token]);

  // ❤️ Favoris conservés dans le localStorage
  const [favoris, setFavoris] = useState(() => {
    try {
      const favorisSauvegardes = localStorage.getItem('favoris');
      return favorisSauvegardes ? JSON.parse(favorisSauvegardes) : [];
    } catch (e) {
      return [];
    }
  });

  // Sauvegarde automatique du panier local et des favoris
  useEffect(() => {
    localStorage.setItem('favoris', JSON.stringify(favoris));
  }, [favoris]);

  useEffect(() => {
    if (!token) {
      localStorage.setItem('panierProduits', JSON.stringify(panierProduits));
    }
  }, [panierProduits, token]);

  // 🛰️ APPEL API : Charger les produits
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/produit/list`);
      if (response.data.success) {
        const donneesServeur = response.data.produits || response.data.produit;
        if (donneesServeur && donneesServeur.length > 0) {
          setProduits(donneesServeur);
        }
      }
    } catch (error) {
      console.warn("Mode Secours Actif 🛡️ : Impossible de joindre l'API des produits.");
    }
  };

  // 🛰️ APPEL API : Charger les catégories
  const getCategoriesData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/categorie/`);
      if (response.data.success) {
        const donneesCategories = response.data.categories || response.data.data;
        if (donneesCategories && donneesCategories.length > 0) {
          setCategories(donneesCategories);
        }
      }
    } catch (error) {
      console.warn("Impossible de charger les catégories depuis le serveur.");
    }
  };

  // 🛰️ APPEL API : Charger les packs
  const getPacksData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/packs`);
      if (response.data.success) {
        setPacks(response.data.packs || []);
      }
    } catch (error) {
      console.warn("Impossible de charger les packs depuis le serveur.");
    }
  };

  // 🛰️ APPEL API : Récupération du panier utilisateur (produits + packs)
  const getUserCart = async (authToken) => {
    try {
      const response = await axios.get(`${backendUrl}/api/utilisateur/panier`, {
        headers: { token: authToken }
      });
      if (response.data.success && response.data.cartData) {
        const { panier, produitsMigres } = normaliserPanier(response.data.cartData);
        setPanierProduits(panier);

        // Corrige durablement en base les paniers enregistrés avant le correctif.
        // Séquentiel (pas Promise.all) : chaque appel relit puis réécrit tout cartData
        // côté serveur, donc des requêtes concurrentes pourraient s'écraser entre elles.
        for (const { produitId, quantite } of produitsMigres) {
          try {
            await axios.post(
              `${backendUrl}/api/utilisateur/panier/update`,
              { itemId: produitId, oldSize: 'Taille Unique', size: 'Unique', quantity: quantite },
              { headers: { token: authToken } }
            );
          } catch (error) {
            console.error("Erreur migration panier BDD :", error);
          }
        }
      }
      if (response.data.success && response.data.cartPacks) {
        setPanierPacks(normaliserPanierPacks(response.data.cartPacks));
      }
    } catch (error) {
      console.error("Erreur récupération panier BDD :", error);
    }
  };

  // 🛰️ APPEL API : Charger les réglages partagés (frais de livraison, WhatsApp...)
  const getSiteConfig = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/config`);
      if (response.data.success && response.data.config) {
        const { fraisLivraison, whatsappNum: numeroServeur } = response.data.config;
        if (typeof fraisLivraison === 'number') setDeliveryFree(fraisLivraison);
        if (numeroServeur) setWhatsappNum(numeroServeur);
      }
    } catch (error) {
      console.warn("Impossible de charger la config serveur, valeurs par défaut conservées.");
    }
  };

  useEffect(() => {
    getProductsData();
    getCategoriesData();
    getPacksData();
    getSiteConfig();
  }, []);

  useEffect(() => {
    if (token) {
      getUserCart(token);
    }
  }, [token]);

  // Toggle Favori
  const toggleFavori = (produitId) => {
    setFavoris((prevFavoris) => {
      if (prevFavoris.includes(produitId)) {
        return prevFavoris.filter(id => id !== produitId);
      } else {
        return [...prevFavoris, produitId];
      }
    });
  };

  // Suggestions de recherche
  const suggestions = useMemo(() => {
    if (!recherche.trim()) return [];
    return produits
      .filter(p => {
        const nomProduit = p.nom || p.name || "";
        return nomProduit.toLowerCase().includes(recherche.toLowerCase());
      })
      .slice(0, 5);
  }, [recherche, produits]);

  useEffect(() => {
    setShowSuggestions(recherche.trim().length > 0);
  }, [recherche]);

  

// 1. Ajouter au panier avec validation de la taille et du stock
  const ajouterPanier = async (produitId, size = null) => {
    const produitTarget = produits.find(p => String(p._id || p.id) === String(produitId));

    if (!produitTarget) {
      toast.error("Produit introuvable.");
      return;
    }

    // Validation du Stock
    if (produitTarget.enStock === false) {
      toast.error("Désolé, ce bijou est actuellement en rupture de stock.");
      return;
    }

    const declinaisons = produitTarget.tailles || produitTarget.sizes || [];
    let tailleFinale = size;

    // Gestion de la taille
    if (declinaisons.length > 1) {
      if (!tailleFinale || (tailleFinale === 'Standard' && !declinaisons.includes('Standard'))) {
        toast.error("Veuillez sélectionner une taille avant d'ajouter ce bijou au panier.");
        return;
      }
    } else if (declinaisons.length === 1) {
      tailleFinale = declinaisons[0];
    } else {
      tailleFinale = size || 'Unique';
    }

    // Mise à jour du state local — forme fonctionnelle : lit toujours le panier le plus
    // récent, sinon deux ajouts rapprochés (deux clics, deux produits) peuvent s'écraser
    // l'un l'autre au lieu de s'additionner (le second écrasait le premier).
    setPanierProduits((panierActuel) => {
      const panierData = structuredClone(panierActuel);
      if (!panierData[produitId]) {
        panierData[produitId] = {};
      }
      panierData[produitId][tailleFinale] = (panierData[produitId][tailleFinale] || 0) + 1;
      return panierData;
    });
    toast.success("Bijou ajouté au panier !");
    setPanierOuvert(true);

    // Synchronisation BDD si connecté
    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/utilisateur/panier/ajouter`,
          { itemId: produitId, size: tailleFinale },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Erreur lors de la synchro panier BDD :", error);
      }
    }
  };

  // 🌟 Fonction pour ajouter TOUS les favoris d'un seul coup au panier
const ajouterTousLesFavorisAuPanier = async (listeProduitsFavoris) => {
  if (!listeProduitsFavoris || listeProduitsFavoris.length === 0) return;

  // 1-3. Clone + fusion + mise à jour en une seule passe, sur le panier le plus récent
  setPanierProduits((panierActuel) => {
    const panierData = structuredClone(panierActuel);
    listeProduitsFavoris.forEach((item) => {
      const idProduit = item._id || item.id;
      const tailleClf = 'Unique';

      if (!panierData[idProduit]) {
        panierData[idProduit] = {};
      }
      panierData[idProduit][tailleClf] = (panierData[idProduit][tailleClf] || 0) + 1;
    });
    return panierData;
  });
  toast.success("Tous vos favoris ont été ajoutés au panier !");
  setPanierOuvert(true);

  // 4. Synchroniser avec MongoDB si l'utilisateur est connecté
  if (token) {
    try {
      const requetes = listeProduitsFavoris.map((item) => {
        const idProduit = item._id || item.id;
        return axios.post(
          `${backendUrl}/api/utilisateur/panier/ajouter`,
          { itemId: idProduit, size: 'Unique' },
          { headers: { token } }
        );
      });
      await Promise.all(requetes);
    } catch (error) {
      console.error("Erreur lors de la synchronisation BDD des favoris :", error);
    }
  }
};
  // 3. Modifier la taille d'un article déjà dans le panier (Version unique et nettoyée)
  const modifierTaillePanier = async (produitId, ancienneTaille, nouvelleTaille) => {
    if (ancienneTaille === nouvelleTaille) return;

    // La quantité fusionnée est capturée depuis l'updater (état le plus récent) pour être
    // réutilisée ensuite dans la synchro BDD, hors de portée du setState lui-même.
    let quantiteFusionnee = null;

    setPanierProduits((panierActuel) => {
      if (!panierActuel[produitId] || !panierActuel[produitId][ancienneTaille]) return panierActuel;

      const panierData = structuredClone(panierActuel);
      const quantite = panierData[produitId][ancienneTaille];

      delete panierData[produitId][ancienneTaille];
      panierData[produitId][nouvelleTaille] = (panierData[produitId][nouvelleTaille] || 0) + quantite;
      quantiteFusionnee = panierData[produitId][nouvelleTaille];

      return panierData;
    });

    if (quantiteFusionnee !== null && token) {
      try {
        await axios.post(
          `${backendUrl}/api/utilisateur/panier/update`,
          { itemId: produitId, oldSize: ancienneTaille, newSize: nouvelleTaille, size: nouvelleTaille, quantity: quantiteFusionnee },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la taille :", error);
      }
    }
  };
  // Nombre d'articles totaux dans le panier (produits + packs)
  const getPanierCount = () => {
    let totalCount = 0;
    for (const items in panierProduits) {
      for (const item in panierProduits[items]) {
        try {
          if (panierProduits[items][item] > 0) {
            totalCount += panierProduits[items][item];
          }
        } catch (error) {
          console.error("Erreur décompte panier :", error);
        }
      }
    }
    for (const packId in panierPacks) {
      if (panierPacks[packId] > 0) totalCount += panierPacks[packId];
    }
    return totalCount;
  };

  // 🎁 Ajouter un pack au panier (toujours +1 ; l'ajustement fin se fait dans le panier)
  const ajouterPackAuPanier = async (pack) => {
    if (!pack || !pack._id) {
      toast.error("Pack introuvable.");
      return;
    }

    setPanierPacks((prev) => ({ ...prev, [pack._id]: (prev[pack._id] || 0) + 1 }));
    toast.success("Pack ajouté au panier !");
    setPanierOuvert(true);

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/utilisateur/panier/pack/ajouter`,
          { packId: pack._id },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Erreur lors de la synchro panier de packs BDD :", error);
      }
    }
  };

  // 🎁 Modifier la quantité d'un pack dans le panier (0 ou moins = suppression)
  const updateQuantityPack = async (packId, quantity) => {
    setPanierPacks((prev) => {
      if (quantity <= 0) {
        const reste = { ...prev };
        delete reste[packId];
        return reste;
      }
      return { ...prev, [packId]: quantity };
    });

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/utilisateur/panier/pack/update`,
          { packId, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Erreur modification quantité pack BDD :", error);
      }
    }
  };

  // 🎁 Retirer un pack du panier
  const supprimerPackDuPanier = async (packId) => {
    setPanierPacks((prev) => {
      const reste = { ...prev };
      delete reste[packId];
      return reste;
    });
    toast.success("Pack supprimé du panier !");

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/utilisateur/panier/pack/supprimer`,
          { packId },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Erreur suppression pack panier BDD :", error);
      }
    }
  };
  const supprimerDuPanier = async (produitId, size) => {
  try {
    setPanierProduits((panierActuel) => {
      const panierData = structuredClone(panierActuel);
      if (panierData[produitId] && panierData[produitId][size]) {
        delete panierData[produitId][size];
        if (Object.keys(panierData[produitId]).length === 0) {
          delete panierData[produitId];
        }
      }
      return panierData;
    });
    toast.success("Article supprimé du panier !");

    // Synchronisation BDD uniquement pour les utilisateurs connectés (un invité n'a pas de panier serveur)
    if (token) {
      await axios.delete(`${backendUrl}/api/utilisateur/panier/supprimer`, {
        headers: { token },
        data: { itemId: produitId, size }
      });
    }
  } catch (error) {
    // L'article est déjà retiré localement à ce stade — seule la synchro BDD a échoué,
    // pas la peine d'alarmer l'utilisateur pour un souci purement serveur.
    console.error("Erreur suppression panier BDD :", error);
  }
};
 // Alias pour la fonction d'ajout au panier depuis les favoris


  // Mettre à jour la quantité d'un article
  const updateQuantity = async (produitId, size, quantity) => {
    setPanierProduits((panierActuel) => {
      const panierData = structuredClone(panierActuel);

      if (quantity <= 0) {
        if (panierData[produitId]) {
          delete panierData[produitId][size];
          if (Object.keys(panierData[produitId]).length === 0) {
            delete panierData[produitId];
          }
        }
      } else {
        if (!panierData[produitId]) {
          panierData[produitId] = {};
        }
        panierData[produitId][size] = quantity;
      }

      return panierData;
    });

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/utilisateur/panier/update`, 
          { itemId: produitId, size, quantity }, 
          { headers: { token } }
        );
      } catch (error) {
        console.error("Erreur modification quantité BDD :", error);
      }
    }
  };

  // Une taille n'est valable que si elle fait réellement partie des déclinaisons du produit
  // (sinon le repli "Unique"/"Standard" posé par défaut quand le choix n'a pas été fait sur la
  // fiche produit passerait pour une vraie sélection). Centralisé ici et exporté pour que
  // Panier.jsx applique exactement la même règle au lieu de la réimplémenter localement.
  const estTailleValidePourProduit = (produitInfo, taille) => {
    if (!produitInfo) return true;
    const taillesDisponibles = produitInfo.sizes || produitInfo.tailles || [];
    if (taillesDisponibles.length === 0) return true;
    return taillesDisponibles.includes(taille);
  };

  // Un article a besoin d'une taille choisie si le produit a de vraies déclinaisons mais que
  // la clé enregistrée dans le panier n'en fait pas partie. Utilisé par Panier.jsx et
  // SidebarPanier.jsx pour imposer le choix avant la caisse.
  const panierNecessiteChoixTaille = () => {
    for (const produitId in panierProduits) {
      const produitInfo = produits.find((p) => String(p._id || p.id) === String(produitId));
      if (!produitInfo) continue;

      for (const taille in panierProduits[produitId]) {
        if (panierProduits[produitId][taille] > 0 && !estTailleValidePourProduit(produitInfo, taille)) {
          return true;
        }
      }
    }
    return false;
  };

  // Vider le panier (produits + packs)
  const viderPanier = () => {
    setPanierProduits({});
    localStorage.removeItem('panierProduits');
    setPanierPacks({});
    localStorage.removeItem('panierPacks');
  };

  // Montant total du panier (produits + packs)
  const getPanierMontant = () => {
    let totalMontant = 0;
    for (const items in panierProduits) {
      let itemInfo = produits.find((produit) =>
        String(produit._id || produit.id) === String(items)
      );

      if (itemInfo) {
        for (const size in panierProduits[items]) {
          try {
            const qte = panierProduits[items][size];
            if (qte > 0) {
              const prixProduit = itemInfo.prix || 0;
              totalMontant += prixProduit * qte;
            }
          } catch (error) {
            console.error("Erreur calcul du montant :", error);
          }
        }
      }
    }
    for (const packId in panierPacks) {
      const quantite = panierPacks[packId];
      const packInfo = packs.find((p) => String(p._id) === String(packId));
      if (packInfo && quantite > 0) {
        totalMontant += (Number(packInfo.prix) || 0) * quantite;
      }
    }
    return totalMontant;
  };

  const value = {
    produits,
    categories,
    packs,
    monnaie,
    delivery_free, 
    recherche, 
    setRecherche, 
    montreRecherche, 
    setMontreRecherche, 
    panierProduits, 
    ajouterPanier, 
    ajouterTousLesFavorisAuPanier, 
    modifierTaillePanier,
    getPanierCount,
    updateQuantity,
    getPanierMontant,
    panierNecessiteChoixTaille,
    estTailleValidePourProduit,
    viderPanier,
    whatsappNum,
    showSuggestions, 
    setShowSuggestions,
    suggestions, 
    backendUrl, 
    token, 
    setToken, 
    favoris, 
    setFavoris, 
    toggleFavori, 
    panierOuvert,
    setPanierOuvert,
    supprimerDuPanier,
    panierPacks,
    ajouterPackAuPanier,
    updateQuantityPack,
    supprimerPackDuPanier,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;