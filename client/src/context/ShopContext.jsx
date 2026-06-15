import { createContext, useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios'; 
// 1. Données de secours (Mock Data) si le serveur est déconnecté
import { produits as produitsMock } from '../assets/image';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const backendUrl = "http://localhost:4000"; 

  const monnaie = 'FCFA';
  const delivery_free = 500;
  
  // Initialisation par défaut avec les données mockées pour éviter un écran vide au chargement
  const [produits, setProduits] = useState(produitsMock); 
  // 🌟 AJOUT : Initialisation d'un tableau vide pour les catégories
  const [categories, setCategories] = useState([]); 
  
  const [recherche, setRecherche] = useState('');
  const [montreRecherche, setMontreRecherche] = useState(false);
  const [panierProduits, setPanierProduits] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const [favoris, setFavoris] = useState([]);

  // 🛰️ APPEL API : Récupération des vrais bijoux depuis MongoDB
  const getProductsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/produit/list`);
      if (response.data.success) {
        const donneesServeur = response.data.produits || response.data.produit;
        
        // Si la BDD renvoie tes créations, elles remplacent discrètement les données de test
        if (donneesServeur && donneesServeur.length > 0) {
          setProduits(donneesServeur);
        }
      }
    } catch (error) {
      // Si ton serveur Node ou MongoDB Atlas n'est pas actif, le site tourne sur les mocks
      console.warn("Mode Secours Actif 🛡️ : Impossible de joindre l'API des produits. Affichage des mocks.");
    }
  };

  // 🌟 AJOUT : APPEL API pour récupérer les catégories de ta BDD
  const getCategoriesData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/categorie/`); // Ajuste l'URL si ton endpoint est juste '/api/categorie'
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

  useEffect(() => {
    getProductsData();
    getCategoriesData(); // 🌟 Lancement du chargement des catégories au démarrage
  }, []);

  // 🛠️ GESTION DES FAVORIS
  const toggleFavori = (productId) => {
    setFavoris((prevFavoris) => {
      if (prevFavoris.includes(productId)) {
        toast.info('Retiré de vos coups de cœur');
        return prevFavoris.filter(id => id !== productId);
      } else {
        toast.success('Ajouté à vos coups de cœur ! ✨');
        return [...prevFavoris, productId];
      }
    });
  };

  // --- LOGIQUE DES SUGGESTIONS DYNAMIQUE ---
  const suggestions = useMemo(() => {
    if (!recherche.trim()) return [];
    
    return produits
      .filter(p => {
        const nomProduit = p.nom || p.name || "";
        return nomProduit.toLowerCase().includes(recherche.toLowerCase());
      })
      .slice(0, 5); // Limite à 5 suggestions fluides pour l'UI
  }, [recherche, produits]);

  useEffect(() => {
    if (recherche.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [recherche]);

  // --- GESTION DU PANIER ---
  const ajouterPanier = async (produitId, sizes) => {
    if (!sizes) {
      toast.error('Veuillez sélectionner une taille');
      return;
    }
    
    let panierData = structuredClone(panierProduits);
    
    if (panierData[produitId]) {
      if (panierData[produitId][sizes]) {
        panierData[produitId][sizes] += 1;
      } else {
        panierData[produitId][sizes] = 1;
      }
    } else {
      panierData[produitId] = {};
      panierData[produitId][sizes] = 1;
    }
    
    setPanierProduits(panierData);
    
    toast.success('Article ajouté au panier !', {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      theme: "dark",
    });
  };

  const getPanierCount = () => {
    let totalCount = 0;
    for (const items in panierProduits) {
      for (const item in panierProduits[items]) {
        try {
          if (panierProduits[items][item] > 0) {
            totalCount += panierProduits[items][item];
          }
        } catch (error) {
          console.error("Erreur panier ID :", items, error);
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (produitId, sizes, quantity) => {
    let panierData = structuredClone(panierProduits);
    panierData[produitId][sizes] = quantity;
    setPanierProduits(panierData);
  };

  const getPanierMontant = () => {
    let totalMontant = 0;
    for (const items in panierProduits) {
      let itemInfo = produits.find((produit) => (produit._id === items || produit.id === items));
      if (itemInfo) { 
        for (const item in panierProduits[items]) {
          try {
            if (panierProduits[items][item] > 0) {
              const prixProduit = itemInfo.prix || 0;
              totalMontant += prixProduit * panierProduits[items][item];
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
    return totalMontant;
  };

  // 🌟 ÉTAPE ESSENTIELLE : Ajout de 'categories' dans l'objet partagé pour toute l'application
  const value = {
    produits, categories, monnaie, delivery_free, recherche, setRecherche, montreRecherche, 
    setMontreRecherche, panierProduits, ajouterPanier, getPanierCount, 
    updateQuantity, getPanierMontant, showSuggestions, setShowSuggestions,
    suggestions, backendUrl, token, setToken, favoris, setFavoris, toggleFavori
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;