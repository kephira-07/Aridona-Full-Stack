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
  
  const [recherche, setRecherche] = useState('');
  const [montreRecherche, setMontreRecherche] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [panierOuvert, setPanierOuvert] = useState(false);

  // 🛒 Panier initialisé avec le localStorage (pour les invités)
  const [panierProduits, setPanierProduits] = useState(() => {
    try {
      const localCart = localStorage.getItem('panierProduits');
      return localCart ? JSON.parse(localCart) : {};
    } catch (e) {
      return {};
    }
  });

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

  const mergeCartData = (guestCart = {}, serverCart = {}) => {
    const mergedCart = {};

    const addCartToMerged = (sourceCart = {}) => {
      Object.entries(sourceCart).forEach(([productId, sizes]) => {
        if (!sizes || typeof sizes !== 'object') return;

        if (!mergedCart[productId]) {
          mergedCart[productId] = {};
        }

        Object.entries(sizes).forEach(([size, quantity]) => {
          const validQty = Number(quantity);
          if (!size || !Number.isFinite(validQty) || validQty <= 0) return;
          mergedCart[productId][size] = (mergedCart[productId][size] || 0) + validQty;
        });
      });
    };

    addCartToMerged(serverCart);
    addCartToMerged(guestCart);

    Object.entries(mergedCart).forEach(([productId, sizes]) => {
      Object.keys(sizes).forEach((size) => {
        if (!sizes[size] || Number(sizes[size]) <= 0) delete sizes[size];
      });
      if (Object.keys(sizes).length === 0) delete mergedCart[productId];
    });

    return mergedCart;
  };

  // 🛰️ APPEL API : Récupération du panier utilisateur
  const getUserCart = async (authToken) => {
    try {
      const response = await axios.get(`${backendUrl}/api/utilisateur/panier`, { 
        headers: { token: authToken } 
      });

      if (response.data.success) {
        const guestCart = (() => {
          try {
            const localCart = localStorage.getItem('panierProduits');
            return localCart ? JSON.parse(localCart) : {};
          } catch (e) {
            return {};
          }
        })();

        const mergedCart = mergeCartData(guestCart, response.data.cartData || {});
        setPanierProduits(mergedCart);
        localStorage.setItem('panierProduits', JSON.stringify(mergedCart));

        await axios.post(
          `${backendUrl}/api/utilisateur/panier/remplacer`,
          { cartData: mergedCart },
          { headers: { token: authToken } }
        );
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
      tailleFinale = size || 'Taille Unique';
    }

    // Mise à jour du state local
    let panierData = structuredClone(panierProduits);

    if (!panierData[produitId]) {
      panierData[produitId] = {};
    }

    panierData[produitId][tailleFinale] = (panierData[produitId][tailleFinale] || 0) + 1;

    setPanierProduits(panierData);
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

  // 1. Cloner le panier actuel
  let panierData = structuredClone(panierProduits);

  // 2. Ajouter tous les produits favoris dans l'objet panier local
  listeProduitsFavoris.forEach((item) => {
    const idProduit = item._id || item.id;
    const tailleClf = 'Taille Unique';

    if (!panierData[idProduit]) {
      panierData[idProduit] = {};
    }
    panierData[idProduit][tailleClf] = (panierData[idProduit][tailleClf] || 0) + 1;
  });

  // 3. Mettre à jour l'état React en une seule fois
  setPanierProduits(panierData);
  toast.success("Tous vos favoris ont été ajoutés au panier !");
  setPanierOuvert(true);

  // 4. Synchroniser avec MongoDB si l'utilisateur est connecté
  if (token) {
    try {
      const requetes = listeProduitsFavoris.map((item) => {
        const idProduit = item._id || item.id;
        return axios.post(
          `${backendUrl}/api/utilisateur/panier/ajouter`,
          { itemId: idProduit, size: 'Taille Unique' },
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

    let panierData = structuredClone(panierProduits);

    if (panierData[produitId] && panierData[produitId][ancienneTaille]) {
      const quantite = panierData[produitId][ancienneTaille];

      // On supprime l'ancienne clé
      delete panierData[produitId][ancienneTaille];

      // On fusionne avec la nouvelle clé
      panierData[produitId][nouvelleTaille] = (panierData[produitId][nouvelleTaille] || 0) + quantite;

      setPanierProduits(panierData);

      if (token) {
        try {
          await axios.post(
            `${backendUrl}/api/utilisateur/panier/update`,
            { itemId: produitId, oldSize: ancienneTaille, newSize: nouvelleTaille, size: nouvelleTaille, quantity: quantite },
            { headers: { token } }
          );
        } catch (error) {
          console.error("Erreur lors de la mise à jour de la taille :", error);
        }
      }
    }
  };
  // Nombre d'articles totaux dans le panier
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
    return totalCount;
  };
  const supprimerDuPanier = async (produitId, size) => {
  try {
    let panierData = structuredClone(panierProduits);
    if (panierData[produitId] && panierData[produitId][size]) {
      delete panierData[produitId][size];
      if (Object.keys(panierData[produitId]).length === 0) {
        delete panierData[produitId];
      }
    }
    setPanierProduits(panierData);
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
    let panierData = structuredClone(panierProduits);

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

    setPanierProduits(panierData);

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

  // Vider le panier
  const viderPanier = () => {
    setPanierProduits({});
    localStorage.removeItem('panierProduits');
  };

  // Montant total du panier
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
    return totalMontant;
  };

  const value = {
    produits, 
    categories, 
    monnaie, 
    delivery_free, 
    recherche, 
    setRecherche, 
    montreRecherche, 
    setMontreRecherche, 
    panierProduits,
    setPanierProduits,
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
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;