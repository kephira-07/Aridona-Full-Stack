import { createContext, useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios'; 
import { produits as produitsMock } from '../assets/image';
import backendUrl from '../config';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  const monnaie = 'FCFA';
  const delivery_free = 500;
  
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

  // 🛰️ APPEL API : Récupération du panier utilisateur
  const getUserCart = async (authToken) => {
    try {
      const response = await axios.get(`${backendUrl}/api/utilisateur/panier`, { 
        headers: { token: authToken } 
      });
      if (response.data.success && response.data.cartData) {
        setPanierProduits(response.data.cartData);
      }
    } catch (error) {
      console.error("Erreur récupération panier BDD :", error);
    }
  };

  useEffect(() => {
    getProductsData();
    getCategoriesData();
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
    await axios.delete(`${backendUrl}/api/utilisateur/panier/supprimer`, {
      headers: { token },
      data: { itemId: produitId, size }
    });

    let panierData = structuredClone(panierProduits);
    if (panierData[produitId] && panierData[produitId][size]) {
      delete panierData[produitId][size];
      if (Object.keys(panierData[produitId]).length === 0) {
        delete panierData[produitId];
      }
    }
    setPanierProduits(panierData);
    toast.success("Article supprimé du panier !");
  } catch (error) {
    console.error("Erreur suppression panier BDD :", error);
    toast.error("Impossible de supprimer l'article du panier.");
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
    ajouterPanier, 
    ajouterTousLesFavorisAuPanier, 
    modifierTaillePanier,
    getPanierCount, 
    updateQuantity, 
    getPanierMontant, 
    viderPanier,
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