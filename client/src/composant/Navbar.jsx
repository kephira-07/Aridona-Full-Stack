import React, { useState, useEffect, useContext } from 'react';
import { Search, ShoppingCart, User, Menu, X, Heart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import BarRecherche from './BarRecherche';

import logo2 from '../assets/logo2.svg';
import MenuMobile from './MenuMobile';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  // 🎯 MODIFICATION ICI : On récupère directement le tableau 'favoris' du contexte
  const { setMontreRecherche, getPanierCount, montreRecherche, favoris } = useContext(ShopContext);

  // 🎯 MODIFICATION ICI : On calcule la longueur directement (ultra-stable au rafraîchissement)
  const totalFavoris = favoris ? favoris.length : 0;


  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : 'unset';
  }, [visible]);

  return (
    <div className="w-full">
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        
        {/* --- BANDEAU ANNONCE --- */}
        <div className="relative flex items-center bg-amber-950 text-white text-xs overflow-hidden h-6 w-full">
          <div 
            className="flex whitespace-nowrap"
            style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              animation: 'scroll-loop 20s linear infinite',
            }}
          >
            <style>{`
              @keyframes scroll-loop {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            <span className="px-4">LIVRAISON OFFERTE À PARTIR DE 150 000 FCFA D'ACHAT • </span>
            <span className="px-4">LIVRAISON OFFERTE À PARTIR DE 150 000 FCFA D'ACHAT • </span>
            <span className="px-4">LIVRAISON OFFERTE À PARTIR DE 150 000 FCFA D'ACHAT • </span>
            <span className="px-4">LIVRAISON OFFERTE À PARTIR DE 150 000 FCFA D'ACHAT • </span>
          </div>
        </div>

        {/* VERSION PC */}
        <div className={`hidden md:flex items-center justify-between px-20 h-20 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}>
          {/* Logo */}
          <div className={`transition-all duration-500 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
            <Link to="/" className="flex items-center cursor-pointer h-34 w-40">
              <img src={logo2} alt="Logo" className="object-contain w-full h-full" />
            </Link>
          </div>

          {/* Barre de recherche */}
          <div className="w-1/3 relative">
            <BarRecherche isNavbar={true} />
          </div>

          {/* Icônes Actions */}
          <div className="flex items-center gap-6">
            <Link to="/login"  className="text-gray-800 hover:text-amber-500 transition-colors relative p-1">
              <User className="w-6 h-6" />
            </Link>

          <Link to="/favoris" className="relative p-2 text-stone-600 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    
                    {/* 🛠️ Le badge n'apparait que si le nombre de favoris est supérieur à 0 */}
                    {totalFavoris > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                            {totalFavoris}
                        </span>
                    )}
                </Link>

            <Link to="/panier" aria-label="Panier" className="text-gray-800 hover:text-amber-500 transition-colors relative p-1">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {getPanierCount?.() || 0}
              </span>
            </Link>
          </div>
        </div>

        {/* VERSION MOBILE */}
        <div className="md:hidden">
          <div className={`flex items-center h-16 justify-between px-6 border-b border-gray-100 ${
            isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'
          }`}>
            <button aria-label="Ouvrir menu mobile" className="text-black p-1 rounded-full" onClick={() => setVisible(true)}>
              <Menu className="w-6 h-6" />
            </button>

            <div className="h-32 w-32">
              <Link to="/">
                <img src={logo2} alt="Logo" className="h-full w-full object-contain" />
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button 
                aria-label="Recherche"
                onClick={() => setMontreRecherche(!montreRecherche)} 
                className={`p-1 rounded-full transition-colors ${montreRecherche ? 'text-amber-500' : 'text-black'}`}
              >
                <Search className="w-5 h-5" />
              </button>

              <Link to="/login" aria-label="Profil" className="text-black p-1 rounded-full px-4 py-3 text-sm text-gray-700 hover:bg-amber-50/50">
                <User className="w-5 h-5" />
              </Link>
              <Link to="/favoris" className="relative p-2 text-stone-600 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    
                    {/* 🛠️ Le badge n'apparait que si le nombre de favoris est supérieur à 0 */}
                    {totalFavoris > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                            {totalFavoris}
                        </span>
                    )}
                </Link>

              <Link to="/panier" aria-label="Panier" className="text-black relative p-1">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {getPanierCount?.() || 0}
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* CONTENEUR RECHERCHE MOBILE */}
        {montreRecherche && (
          <>
            <div className="md:hidden fixed inset-0 top-[88px] bg-black/20 z-40" onClick={() => setMontreRecherche(false)} />
            <div className="md:hidden fixed top-[88px] left-0 w-full z-50 bg-white p-3 shadow-md border-b transition-all duration-300">
              <BarRecherche isNavbar={false} />
            </div>
          </>
        )}
      </header>

      {/* MENU MOBILE */}
      <MenuMobile visible={visible} setVisible={setVisible} />
     
    </div>
  );
}
