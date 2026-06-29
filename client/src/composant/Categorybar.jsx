import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../config';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Categorybar({ selectedCategories = [], toggleCategorie, clearCategories }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // 🌟 État de chargement
  const [isVisible, setIsVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const scrollContainerRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/home';

  const isAllSelected = selectedCategories.length === 0;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/categorie`);
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Erreur chargement catégories barre:", error.message);
      } finally {
        setLoading(false); // 🌟 Fin du chargement quoi qu'il arrive
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsSticky(currentScrollY > 950);

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

  const handleViewAllClick = () => {
    if (isHomePage) {
      navigate('/collection');
    } else {
      clearCategories();
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
          
          {/* Option "Tout" */}
          <button
            onClick={handleViewAllClick}
            className={`flex flex-col items-center flex-shrink-0 snap-center focus:outline-none text-center transition-all duration-300 ${
              isLarge ? 'w-32 md:w-48' : 'w-16 md:w-20'
            }`}
          >
            <div className={`rounded-full overflow-hidden border border-gray-100 shadow-xs aspect-square flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
              isLarge 
                ? 'w-30 h-30 md:w-45 md:h-45 hover:scale-105 text-sm font-semibold' 
                : 'w-11 h-11 md:w-12 md:h-12 text-xs font-bold'
            } ${
              (!isLarge && isAllSelected) 
                ? 'ring-2 ring-amber-500 ring-offset-2 bg-amber-50 text-amber-600' 
                : 'bg-stone-100 text-stone-600'
            }`}>
              <span className={isLarge ? "text-base tracking-wider" : "text-[10px]"}>ALL</span>
            </div>

            <span className={`tracking-wide font-medium mt-2 px-1 w-full line-clamp-2 break-words leading-tight transition-all ${
              isLarge ? 'text-xs md:text-sm font-semibold' : 'text-[10px]'
            } ${(!isLarge && isAllSelected) ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
              Tout
            </span>
          </button>

          {/* 🌟 LISTE DYNAMIQUE OU SQUELETTES DE CHARGEMENT */}
          {loading ? (
            // Affiche 6 fausses bulles animées pendant le chargement
            Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
                className={`flex flex-col items-center flex-shrink-0 animate-pulse ${
                  isLarge ? 'w-32 md:w-48' : 'w-16 md:w-20'
                }`}
              >
                <div className={`rounded-full bg-gray-200 aspect-square flex-shrink-0 ${
                  isLarge ? 'w-30 h-30 md:w-45 md:h-45' : 'w-11 h-11 md:w-12 md:h-12'
                }`} />
                <div className="h-3 bg-gray-200 rounded-sm w-3/4 mt-3" />
              </div>
            ))
          ) : (
            // Une fois chargé, on affiche les vraies données
            categories.map((cat) => {
              const isChecked = selectedCategories.includes(cat._id);
              
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryClick(cat._id)}
                  className={`flex flex-col items-center flex-shrink-0 snap-center focus:outline-none text-center transition-all duration-300 ${
                    isLarge ? 'w-32 md:w-48' : 'w-16 md:w-20'
                  }`}
                >
                  <div className={`rounded-full overflow-hidden border border-gray-100 shadow-xs aspect-square flex-shrink-0 transition-all duration-300 ${
                    isLarge 
                      ? 'w-30 h-30 md:w-45 md:h-45 hover:scale-105' 
                      : 'w-11 h-11 md:w-12 md:h-12'
                  } ${(!isLarge && isChecked) ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}>
                    <img src={cat.image} alt={cat.nom} className="w-full h-full object-cover" />
                  </div>

                  <span className={`tracking-wide font-medium mt-2 px-1 w-full line-clamp-2 break-words leading-tight transition-all ${
                    isLarge ? 'text-xs md:text-sm font-semibold' : 'text-[10px]'
                  } ${(!isLarge && isChecked) ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                    {cat.nom}
                  </span>
                </button>
              );
            })
          )}

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