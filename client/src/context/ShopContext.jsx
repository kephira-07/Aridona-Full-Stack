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

  // 🛰️ APPEL API : Charger le panier de l'utilisateur connecté
  const getUserCart = async (authToken) => {
    try {
      const response = await axios.post(`${backendUrl}/api/cart/get`, {}, { headers: { token: authToken } });
      if (response.data.success && response.data.cartData) {
        setPanierProduits(response.data.cartData);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du panier BDD :", error);
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

  
// Ajouter au panier avec validation BDD (enStock)
  const ajouterPanier = async (produitId, size = 'Standard') => {
    const produitTarget = produits.find(p => String(p._id || p.id) === String(produitId));

    if (produitTarget && produitTarget.enStock === false) {
      toast.error("Désolé, ce bijou est actuellement en rupture de stock.");
      return;
    }

    let panierData = structuredClone(panierProduits);

    if (panierData[produitId]) {
      if (panierData[produitId][size]) {
        panierData[produitId][size] += 1;
      } else {
        panierData[produitId][size] = 1;
      }
    } else {
      panierData[produitId] = {};
      panierData[produitId][size] = 1;
    }

    setPanierProduits(panierData);
   

    // ✨ Ouvre automatiquement le tiroir/sidebar du panier
    setPanierOuvert(true);

    // Sync BDD si connecté
    if (token) {
      try {
        await axios.post(`${backendUrl}/api/cart/add`, { itemId: produitId, size }, { headers: { token } });
      } catch (error) {
        console.error("Erreur lors de la synchro panier BDD :", error);
      }
    }
  };

  const ajouterAuPanier = ajouterPanier;

  // Intervertir la taille d'un produit
  const changerTaille = async (produitId, ancienneTaille, nouvelleTaille) => {
    let panierData = structuredClone(panierProduits);

    if (panierData[produitId] && panierData[produitId][ancienneTaille]) {
      const quantite = panierData[produitId][ancienneTaille];
      delete panierData[produitId][ancienneTaille];

      if (panierData[produitId][nouvelleTaille]) {
        panierData[produitId][nouvelleTaille] += quantite;
      } else {
        panierData[produitId][nouvelleTaille] = quantite;
      }

      setPanierProduits(panierData);

      if (token) {
        try {
          await axios.post(`${backendUrl}/api/cart/update`, { itemId: produitId, size: nouvelleTaille, quantity: quantite }, { headers: { token } });
        } catch (error) {
          console.error("Erreur mise à jour taille BDD :", error);
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
        await axios.post(`${backendUrl}/api/cart/update`, { itemId: produitId, size, quantity }, { headers: { token } });
      } catch (error) {
        console.error("Erreur modification quantité BDD :", error);
      }
    }
  };

  // Vider le panier (Après commande réussie)
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
    ajouterAuPanier, 
    changerTaille, 
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
    setPanierOuvert
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;