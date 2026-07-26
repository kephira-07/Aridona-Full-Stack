import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Search, X, FolderOpen, Loader2,ShoppingBag, ArrowLeft, ChevronRight } from 'lucide-react';
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

  const [categories, setCategories] = useState([]);
  const [suggestionsFiltrees, setSuggestionsFiltrees] = useState({ categories: [], produits: [] });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [estEnChargement, setEstEnChargement] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const inputRefMobile = useRef(null);
  const inputRefDesktop = useRef(null);
  const containerRef = useRef(null);

  // 1. Charger les catégories API
  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categorie`);
        if (response.data.success && isMounted) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error("Erreur chargement catégories:", err.message);
      }
    };
    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  // 2. Synchronisation avec le bouton Loupe de la Navbar Mobile
  useEffect(() => {
    // Si l'utilisateur clique sur la loupe dans la Navbar mobile (montreRecherche = true)
    if (!isNavbar && montreRecherche && window.innerWidth < 768) {
      setIsMobileModalOpen(true);
    }
  }, [montreRecherche, isNavbar]);

  // 3. Gestion du verrouillage du scroll en mode Overlay Mobile
  useEffect(() => {
    if (isMobileModalOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRefMobile.current?.focus(), 100);
    } else {
      // Évite de déverrouiller si un autre drawer (ex: MenuMobile) est ouvert
      if (!document.querySelector('.menu-mobile-ouvert')) {
        document.body.style.overflow = 'unset';
      }
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileModalOpen]);

  // 4. Mémorisation de l'indexation Fuse.js
  const fuseCat = useMemo(() => new Fuse(categories || [], { keys: ['nom'], threshold: 0.4 }), [categories]);
  const fuseProd = useMemo(() => new Fuse(produits || [], { keys: ['nom', 'description'], threshold: 0.4 }), [produits]);

  // 5. Traitement dynamique des requêtes avec effet d'analyse "Debounce"
  useEffect(() => {
    if (recherche.trim().length < 2) {
      setSuggestionsFiltrees({ categories: [], produits: [] });
      setEstEnChargement(false);
      setActiveIndex(-1);
      return;
    }

    setEstEnChargement(true);
    const timer = setTimeout(() => {
      const resCat = fuseCat.search(recherche).map(r => r.item).slice(0, 3);
      const resProd = fuseProd.search(recherche).map(r => r.item).slice(0, 6);

      setSuggestionsFiltrees({ categories: resCat, produits: resProd });
      setEstEnChargement(false);
      setActiveIndex(-1);
    }, 150);

    return () => clearTimeout(timer);
  }, [recherche, fuseCat, fuseProd]);

  const totalSuggestionsCount = suggestionsFiltrees.categories.length + suggestionsFiltrees.produits.length;

  // Clic à l'extérieur (Desktop)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  // Navigation Clavier (Desktop)
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (totalSuggestionsCount === 0) return;
      setActiveIndex(prev => (prev + 1 < totalSuggestionsCount ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (totalSuggestionsCount === 0) return;
      setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalSuggestionsCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        executerSelectionClavier(activeIndex);
      } else {
        validerRechercheGlobale();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const executerSelectionClavier = (index) => {
    const nbCat = suggestionsFiltrees.categories.length;
    if (index < nbCat) {
      handleCategoryClick(suggestionsFiltrees.categories[index].slug);
    } else {
      handleProductClick(suggestionsFiltrees.produits[index - nbCat]);
    }
  };

  const fermerTout = () => {
    setShowSuggestions(false);
    setIsMobileModalOpen(false);
    setMontreRecherche(false);
  };

  const handleProductClick = (produit) => {
    setRecherche('');
    fermerTout();
    navigate(`/produit/${produit.slug}`);
  };

  const handleCategoryClick = (slug) => {
    setRecherche('');
    fermerTout();
    navigate('/collection', { state: { initialCategorySlug: slug } });
  };

  const validerRechercheGlobale = () => {
    fermerTout();
    if (location.pathname !== '/collection') {
      navigate('/collection');
    }
  };

  const surlignerTexte = (text, highlight) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regexText = highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${regexText})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part)
            ? <strong key={i} className="text-amber-900 font-bold bg-amber-100/90 px-1 rounded-xs">{part}</strong>
            : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  return (
    <>
      {/* ========================================================= */}
      {/* A. BARRE DESKTOP ET CHAMP D'ACCÈS MOBILE                  */}
      {/* ========================================================= */}
      <div className="w-full flex items-center justify-center">
        <div 
          ref={containerRef} 
          className="relative flex items-center w-full border-2 border-dashed border-amber-700  focus-within:border-amber-800 rounded-full bg-stone-50/60 md:bg-white transition-all shadow-2xs"
        >
          <div className="pl-3.5 text-amber-900/70">
            <Search className="w-4 h-4" />
          </div>

          <input
            ref={inputRefDesktop}
            type="text"
            className="w-full px-3 py-2 outline-none bg-transparent text-xs md:text-sm font-medium text-stone-800 placeholder-stone-400 cursor-pointer md:cursor-text"
            placeholder="Rechercher un bijou, une collection..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (window.innerWidth < 768) {
                setIsMobileModalOpen(true);
              } else {
                setShowSuggestions(true);
              }
            }}
            onClick={() => {
              if (window.innerWidth < 768) setIsMobileModalOpen(true);
            }}
            readOnly={window.innerWidth < 768}
          />

          {recherche && (
            <button 
              type="button"
              onClick={() => setRecherche('')}
              className="p-1 text-stone-400 hover:text-stone-600 mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 768) {
                setIsMobileModalOpen(true);
              } else {
                validerRechercheGlobale();
              }
            }}
            className="bg-amber-900 hover:bg-amber-950 text-white p-2 rounded-full transition-colors mr-1 flex-shrink-0 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* SUGGESTIONS DESKTOP (DROPDOWN) */}
          {showSuggestions && (
            <div className="hidden md:block absolute top-[115%] left-0 w-full bg-white border border-stone-100 rounded-2xl shadow-xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <ContenuSuggestions 
                estEnChargement={estEnChargement}
                recherche={recherche}
                totalSuggestionsCount={totalSuggestionsCount}
                categories={categories}
                suggestionsFiltrees={suggestionsFiltrees}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                handleCategoryClick={handleCategoryClick}
                handleProductClick={handleProductClick}
                surlignerTexte={surlignerTexte}
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* B. OVERLAY FULLSCREEN MOBILE (Style Google / Mobile-First) */}
      {/* ========================================================= */}
      {isMobileModalOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-[99999] flex flex-col animate-in slide-in-from-bottom duration-200">
          
          {/* Header Mobile avec retour tactile */}
          <div className="flex items-center gap-2 p-3 border-b border-stone-100 bg-white shadow-2xs">
            <button 
              type="button"
              onClick={fermerTout}
              className="p-2 text-stone-700 hover:bg-stone-100 rounded-full active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-amber-900" />
            </button>

            <div className="flex-1 flex items-center bg-stone-100/80 rounded-full px-3 py-2 border border-stone-200/60 focus-within:border-amber-800 focus-within:bg-white">
              <Search className="w-4 h-4 text-stone-400 mr-2 flex-shrink-0" />
              <input
                ref={inputRefMobile}
                type="text"
                className="w-full bg-transparent text-sm font-medium text-stone-900 outline-none placeholder-stone-400"
                placeholder="Rechercher un bijou..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && validerRechercheGlobale()}
              />
              {estEnChargement ? (
                <Loader2 className="w-4 h-4 text-amber-900 animate-spin ml-2" />
              ) : recherche ? (
                <button type="button" onClick={() => setRecherche('')} className="p-1">
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              ) : null}
            </div>

            {recherche.trim() && (
              <button 
                type="button"
                onClick={validerRechercheGlobale}
                className="text-xs font-bold text-amber-900 px-2 py-1"
              >
                Voir
              </button>
            )}
          </div>

          {/* Liste des résultats scrollable */}
          <div className="flex-1 overflow-y-auto p-4 bg-stone-50/40">
            <ContenuSuggestions 
              estEnChargement={estEnChargement}
              recherche={recherche}
              totalSuggestionsCount={totalSuggestionsCount}
              categories={categories}
              suggestionsFiltrees={suggestionsFiltrees}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              handleCategoryClick={handleCategoryClick}
              handleProductClick={handleProductClick}
              surlignerTexte={surlignerTexte}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </>
  );
}

// =========================================================
// C. SOUS-COMPOSANT RENDER DES ETATS (Chargement, Vide, Résultats)
// =========================================================
function ContenuSuggestions({
  estEnChargement,
  recherche,
  totalSuggestionsCount,
  categories,
  suggestionsFiltrees,
  activeIndex,
  setActiveIndex,
  handleCategoryClick,
  handleProductClick,
  surlignerTexte,
  isMobile = false
}) {
  // SKELETON LOADER
  if (estEnChargement && totalSuggestionsCount === 0) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-amber-100/50 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-stone-200 rounded-md w-2/3" />
              <div className="h-3 bg-stone-100 rounded-md w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ETAT : CHAMPS VIDE OU TROP COURT (Tendances)
  if (!estEnChargement && recherche.trim().length < 2) {
    return (
      <div className="p-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-3 px-2">
          
          <span>Collections à découvrir</span>
        </div>
        <div className="flex flex-wrap gap-2 px-1">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat._id || cat.slug}
              type="button"
              onClick={() => handleCategoryClick(cat.slug)}
              className="flex items-center gap-1.5 text-xs bg-white text-stone-800 font-medium px-3 py-2 rounded-xl border border-stone-200 shadow-2xs active:bg-amber-50"
            >
              <span>{cat.nom}</span>
              <ChevronRight className="w-3 h-3 text-stone-400" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ETAT : AUCUN RÉSULTAT
  if (!estEnChargement && recherche.trim().length >= 2 && totalSuggestionsCount === 0) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6 text-amber-800" />
        </div>
        <p className="text-sm font-semibold text-stone-900">
          Aucun bijou ne correspond à "{recherche}"
        </p>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
          Découvrez nos collections phares :
        </p>
        <div className="flex justify-center flex-wrap gap-2 mt-4">
          {categories.slice(0, 3).map((cat) => (
            <button
              key={cat._id || cat.slug}
              type="button"
              onClick={() => handleCategoryClick(cat.slug)}
              className="text-xs bg-amber-900 text-white font-medium px-3.5 py-1.5 rounded-full shadow-2xs active:scale-95 transition-transform"
            >
              {cat.nom}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ETAT : RÉSULTATS TROUVÉS
  return (
    <ul className="space-y-1">
      {/* CATEGORIES */}
      {suggestionsFiltrees.categories.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 py-1">
            Univers & Catégories
          </div>
          {suggestionsFiltrees.categories.map((cat, index) => (
            <li
              key={cat.slug || cat._id}
              onClick={() => handleCategoryClick(cat.slug)}
              onMouseEnter={() => !isMobile && setActiveIndex(index)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                activeIndex === index ? 'bg-amber-50 text-amber-950 font-semibold' : 'hover:bg-stone-50 text-stone-800'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100/80 flex items-center justify-center text-amber-900 flex-shrink-0">
                <FolderOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs md:text-sm flex-1 truncate">
                {surlignerTexte(cat.nom, recherche)}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </li>
          ))}
        </div>
      )}

      {/* SEPARATEUR */}
      {suggestionsFiltrees.categories.length > 0 && suggestionsFiltrees.produits.length > 0 && (
        <div className="h-[1px] bg-stone-100 my-2 mx-2" />
      )}

      {/* PRODUITS */}
      {suggestionsFiltrees.produits.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-3 py-1">
            Bijoux suggérés
          </div>
          {suggestionsFiltrees.produits.map((p, index) => {
            const globalIndex = suggestionsFiltrees.categories.length + index;
            const isCurrentActive = activeIndex === globalIndex;
            return (
              <li
                key={p._id || p.id}
                onClick={() => handleProductClick(p)}
                onMouseEnter={() => !isMobile && setActiveIndex(globalIndex)}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                  isCurrentActive ? 'bg-amber-50/90' : 'hover:bg-stone-50 active:bg-stone-100'
                }`}
              >
                <img
                  src={p.image && p.image[0] ? p.image[0] : 'https://placehold.co/600x600?text=Bijou'}
                  alt={p.nom}
                  className="w-12 h-12 md:w-10 md:h-10 object-cover rounded-xl border border-stone-200/60 flex-shrink-0"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs md:text-sm font-medium text-stone-900 truncate">
                    {surlignerTexte(p.nom, recherche)}
                  </span>
                  <span className="text-xs text-amber-900 font-bold mt-0.5">
                    {Number(p.prix).toLocaleString()} FCFA
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 md:hidden" />
              </li>
            );
          })}
        </div>
      )}
    </ul>
  );
}