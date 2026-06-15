import React, { useState, useEffect, useRef, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Search, X, FolderOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Fuse from 'fuse.js';
import axios from 'axios';
import { backendUrl } from '../config';

export default function BarRecherche({ isNavbar }) {
  const {
    recherche, setRecherche,
    montreRecherche, setMontreRecherche,
    showSuggestions, setShowSuggestions,
    produits
  } = useContext(ShopContext);

  // États locaux pour gérer Fuse.js, le clavier et les catégories
  const [categories, setCategories] = useState([]);
  const [suggestionsFiltrees, setSuggestionsFiltrees] = useState({ categories: [], produits: [] });
  const [activeIndex, setActiveIndex] = useState(-1);

  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  // 1. Charger les catégories pour pouvoir faire une recherche floue dedans
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categorie`);
        if (response.data.success) setCategories(response.data.data);
      } catch (error) {
        console.error("Erreur chargement suggestions catégories:", error.message);
      }
    };
    fetchCategories();
  }, []);

  // 2. Traitement Fuse.js en temps réel (Fuzzy Search + Combinaison Produits/Catégories)
  useEffect(() => {
    if (recherche.trim().length < 2) {
      setSuggestionsFiltrees({ categories: [], produits: [] });
      setActiveIndex(-1);
      return;
    }

    // Configuration Fuse pour les catégories (Tolérance orthographe)
    const fuseCat = new Fuse(categories, { keys: ['nom'], threshold: 0.4 });
    const resCat = fuseCat.search(recherche).map(r => r.item).slice(0, 2); // Top 2 catégories

    // Configuration Fuse pour les produits
    const fuseProd = new Fuse(produits || [], { keys: ['nom', 'description'], threshold: 0.4 });
    const resProd = fuseProd.search(recherche).map(r => r.item).slice(0, 5); // Top 5 produits

    setSuggestionsFiltrees({ categories: resCat, produits: resProd });
    setActiveIndex(-1); // On reset la surbrillance clavier quand le texte change
  }, [recherche, produits, categories]);

  const totalSuggestionsCount = suggestionsFiltrees.categories.length + suggestionsFiltrees.produits.length;

  // 3. Gestion ultra-fluide des touches du clavier (Haut, Bas, Entrée)
  const handleKeyDown = (e) => {
    if (totalSuggestionsCount === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1 < totalSuggestionsCount ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalSuggestionsCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        // Si l'utilisateur a survolé une suggestion avec ses flèches, on valide l'élément choisi
        executerSelectionClavier(activeIndex);
      } else {
        // Sinon, validation classique de ce qu'il a écrit
        validerRechercheGlobale();
      }
    }
  };
  const handleInputChange = (e) => {
  setRecherche(e.target.value);
  if (e.target.value.trim().length >= 2) {
    setShowSuggestions(true);
  }
};

  const executerSelectionClavier = (index) => {
    const nbCat = suggestionsFiltrees.categories.length;
    if (index < nbCat) {
      const catChoisie = suggestionsFiltrees.categories[index];
      handleCategoryClick(catChoisie.slug);
    } else {
      const prodChoisi = suggestionsFiltrees.produits[index - nbCat];
      handleProductClick(prodChoisi);
    }
  };

  // Actions de clics et redirections
  const handleProductClick = (produit) => {
    setRecherche('');               
    setShowSuggestions(false);      
    setMontreRecherche(false);      
    navigate(`/produit/${produit.slug}`)
  };

  const handleCategoryClick = (slug) => {
    setRecherche('');
    setShowSuggestions(false);
    setMontreRecherche(false);
    navigate('/collection', { state: { initialCategorySlug: slug } });
  };

  const validerRechercheGlobale = () => {
    setShowSuggestions(false);
    setMontreRecherche(false);
    inputRef.current?.blur(); 
    if (location.pathname !== '/collection') {
      navigate('/collection');
    }
  };

  // 4. Fonction de mise en valeur (Surligne les lettres tapées en gras ambré)
  const surlignerTexte = (text, highlight) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regexText = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${regexText})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) 
            ? <strong key={i} className="text-amber-700 font-bold bg-amber-50 px-0.5 rounded-xs">{part}</strong> 
            : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  if (!isNavbar && !montreRecherche) return null;

  return (
    <div className={`flex items-center justify-center ${isNavbar ? 'w-full mx-10' : 'w-full py-5 bg-white border-b'}`}>
      <div className={`relative inline-flex items-center border-2 border-amber-700 border-dashed rounded-full bg-white ${isNavbar ? 'w-full max-w-md' : 'w-[70%]'}`}>
        
        <input
          ref={inputRef}
          type="text"
          className="flex-1 px-4 py-2 outline-none bg-transparent text-sm font-medium text-gray-800"
          placeholder="Rechercher un bijou, une collection..."
          value={recherche}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (totalSuggestionsCount > 0) setShowSuggestions(true); }}
          // Un petit timeout pour laisser le temps au clic de s'exécuter avant de fermer
          onBlur={() => setTimeout(() => setShowSuggestions(false), 250)} 
        />
        
        <div 
          onClick={validerRechercheGlobale}
          className="bg-amber-700 w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-amber-800 transition-colors rounded-r-full"
        >
          <Search className="text-white w-5 h-5" />
        </div>

        {/* --- LISTE DES SUGGESTIONS AVANCÉES --- */}
        {showSuggestions && totalSuggestionsCount > 0 && (
          <ul className="absolute top-[115%] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-[9999] max-h-80 overflow-y-auto p-2 space-y-1 animate-slide-in">
            
            {/* SECTION DES CATÉGORIES RECONNUES */}
            {suggestionsFiltrees.categories.map((cat, index) => {
              const isCurrentActive = activeIndex === index;
              return (
                <li
                  key={cat.slug}
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={() => handleCategoryClick(cat.slug)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isCurrentActive ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-amber-100/60 flex items-center justify-center text-amber-800 flex-shrink-0">
                    <FolderOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs">
                    Découvrir l'univers : {surlignerTexte(cat.nom, recherche)}
                  </span>
                </li>
              );
            })}

            {/* SÉPARATEUR VISUEL SI ON A LES DEUX EN MÊME TEMPS */}
            {suggestionsFiltrees.categories.length > 0 && suggestionsFiltrees.produits.length > 0 && (
              <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
            )}

            {/* SECTION DES PRODUITS RECONNUS */}
            {suggestionsFiltrees.produits.map((p, index) => {
              const globalIndex = suggestionsFiltrees.categories.length + index;
              const isCurrentActive = activeIndex === globalIndex;
              return (
                <li
                  key={p._id || p.id}
                  onMouseDown={(e) => e.preventDefault()} 
                  onClick={() => handleProductClick(p)}
                  onMouseEnter={() => setActiveIndex(globalIndex)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                    isCurrentActive ? 'bg-amber-50/80 shadow-3xs' : 'hover:bg-gray-50'
                  }`}
                >
                  <img
                    src={p.image && p.image[0] ? p.image[0] : 'https://placehold.co/600x600?text=Bijou'}
                    alt={p.nom}
                    className="w-10 h-10 object-cover rounded-lg border border-amber-700/10 flex-shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {surlignerTexte(p.nom, recherche)}
                    </span>
                    <span className="text-xs text-amber-700 font-bold">
                      {Number(p.prix).toLocaleString()} FCFA
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {!isNavbar && (
        <X
          onClick={() => {
            setMontreRecherche(false);
            setRecherche('');
            setShowSuggestions(false);
          }}
          className="ml-3 w-6 h-6 text-amber-700 cursor-pointer"
        />
      )}
    </div>
  );
}