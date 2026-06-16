import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'; // 🌟 La correction est ici
import backendUrl from '../config'; 
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Categorybar({ selectedCategories = [], toggleCategorie, clearCategories }) {
  const [categories, setCategories] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  // 1. Charger les catégories depuis l'API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categorie`);
        if (response.data.success) {
          // 🌟 FIX 2 : Alignement sur la structure de ton backend (categories ou data)
          const donneesCategories = response.data.categories || response.data.data || [];
          setCategories(donneesCategories);
        }
      } catch (error) {
        console.error("Erreur chargement catégories barre:", error.message);
      }
    };
    fetchCategories();
  }, []);

  // 2. Gestion exclusive du scroll pour la Page d'accueil (Home)
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsSticky(currentScrollY > 450);

      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isHomePage]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      scrollContainerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (id) => {
    if (isHomePage) {
      navigate('/collection', { state: { initialCategory: id } });
    } else {
      toggleCategorie(id);
    }
  };

  const isLarge = isHomePage && !isSticky;

  return (
    <div 
      className={`w-full bg-white border-b border-gray-100 left-0 transition-all duration-300 ${
        !isHomePage 
          ? 'fixed shadow-xs z-30' 
          : isSticky 
            ? 'fixed shadow-md animate-slide-in z-30' 
            : 'relative z-10' 
      } ${
        isHomePage && isSticky && !isVisible ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
      style={{ 
        top: !isHomePage 
          ? 'calc(20px + 4rem)' 
          : isSticky 
            ? 'calc(20px + 4rem)' 
            : '0px'
      }}
    >
      <div className={`w-full max-w-7xl mx-auto px-10 relative group/bar transition-all duration-300 ${isLarge ? 'py-2' : 'py-2.5'}`}>
        
        {/* FLÈCHE GAUCHE */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-40 bg-white/90 backdrop-blur-xs border border-stone-200 p-1.5 rounded-full shadow-xs text-stone-700 hover:text-amber-600 hover:border-amber-500 md:opacity-0 md:group-hover/bar:opacity-100 transition-all duration-200 hidden md:flex items-center justify-center"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        {/* CONTENEUR DES CATÉGORIES */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-5 overflow-x-auto scrollbar-hide snap-x py-1 scroll-smooth"
        >
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat._id);
            
            return (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat._id)}
                className={`flex flex-col items-center flex-shrink-0 snap-center focus:outline-none text-center transition-all duration-300 ${
                  isLarge ? 'w-32 md:w-48' : 'w-16 md:w-20'
                }`}
              >
                {/* Bulle d'image de la catégorie */}
                <div className={`rounded-full overflow-hidden border border-gray-100 shadow-xs aspect-square flex-shrink-0 transition-all duration-300 ${
                  isLarge 
                    ? 'w-30 h-30 md:w-45 md:h-45 hover:scale-105' 
                    : 'w-11 h-11 md:w-12 md:h-12'
                } ${(!isLarge && isChecked) ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}>
                  <img 
                    src={cat.image} 
                    alt={cat.nom} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=150";
                    }}
                  />
                </div>

                {/* Texte descriptif */}
                <span className={`tracking-wide font-medium mt-2 px-1 w-full line-clamp-2 break-words leading-tight transition-all ${
                  isLarge ? 'text-xs md:text-sm font-semibold' : 'text-[10px]'
                } ${(!isLarge && isChecked) ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                  {cat.nom}
                </span>
              </button>
            );
          })}
        </div>

        {/* FLÈCHE DROITE */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-40 bg-white/90 backdrop-blur-xs border border-stone-200 p-1.5 rounded-full shadow-xs text-stone-700 hover:text-amber-600 hover:border-amber-500 md:opacity-0 md:group-hover/bar:opacity-100 transition-all duration-200 hidden md:flex items-center justify-center"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>

      </div>
    </div>
  );
}