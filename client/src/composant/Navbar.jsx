import React, { useState, useEffect, useContext } from 'react';
import { Search, ShoppingBag, User, Menu, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import BarRecherche from './BarRecherche';
import MenuMobile from './MenuMobile';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  // Récupération des données et fonctions du contexte global
  const { setMontreRecherche, getPanierCount, montreRecherche, favoris, setPanierOuvert } = useContext(ShopContext);

  // Calcul du nombre de favoris
  const totalFavoris = favoris ? favoris.length : 0;

  // Gestion de la transparence / ombre au scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquer le scroll d'arrière-plan lorsque le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = visible ? 'hidden' : 'unset';
  }, [visible]);

  return (
    <div className="w-full font-dmsans">
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        
        {/* --- BANDEAU ANNONCE --- */}
        <div className="relative flex items-center bg-amber-950 text-stone-200 text-[11px] uppercase tracking-widest overflow-hidden h-8 w-full font-medium">
          <div 
            className="flex whitespace-nowrap"
            style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              animation: 'scroll-loop 22s linear infinite',
            }}
          >
            <style>{`
              @keyframes scroll-loop {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            <span className="px-6">LIVRAISON OFFERTE À PARTIR DE 150 000 FCFA D'ACHAT • </span>
            <span className="px-6">LIVRAISON OFFERTE À PARTIR DE 150 000 FCFA D'ACHAT • </span>
            <span className="px-6">LIVRAISON OFFERTE À PARTIR DE 150 000 FCFA D'ACHAT • </span>
            <span className="px-6">LIVRAISON OFFERTE À PARTIR DE 150 000 FCFA D'ACHAT • </span>
          </div>
        </div>

        {/* --- VERSION DESKTOP --- */}
        <div className={`hidden md:flex items-center justify-between px-12 lg:px-20 h-20 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}>
          {/* Logo */}
          <div className={`transition-all duration-500 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
            <Link to="/" className="flex items-center cursor-pointer h-16 w-36">
              <img src={logo} alt="Aridona Bijoux Logo" className="object-contain w-full h-full" />
            </Link>
          </div>

          {/* Barre de recherche au centre */}
          <div className="w-1/3 relative">
            <BarRecherche isNavbar={true} />
          </div>

          {/* Icônes Actions (Compte, Favoris, Panier) */}
          <div className="flex items-center gap-6">
            <Link to="/login" aria-label="Mon compte" className="text-stone-800 hover:text-amber-900 transition-colors p-1">
              <User className="w-5 h-5 stroke-[1.75]" />
            </Link>

            <Link to="/favoris" aria-label="Mes favoris" className="relative p-1 text-stone-800 hover:text-amber-900 transition-colors">
              <Heart className="w-5 h-5 stroke-[1.75]" />
              {totalFavoris > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalFavoris}
                </span>
              )}
            </Link>

            {/* Clic sur le panier ouvre le SidebarPanier */}
            <button 
              type="button"
              onClick={() => setPanierOuvert(true)} 
              aria-label="Ouvrir le panier" 
              className="text-stone-800 hover:text-amber-900 transition-colors relative p-1 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-900 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                {getPanierCount?.() || 0}
              </span>
            </button>
          </div>
        </div>

        {/* --- VERSION MOBILE --- */}
        <div className="md:hidden">
          <div className={`flex items-center h-16 justify-between px-4 border-b border-stone-100 ${
            isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white'
          }`}>
            <button 
              type="button"
              aria-label="Ouvrir menu mobile" 
              className="text-stone-800 p-1 rounded-full focus:outline-none" 
              onClick={() => setVisible(true)}
            >
              <Menu className="w-6 h-6 stroke-[1.75]" />
            </button>

            <div className="h-10 w-28">
              <Link to="/">
                <img src={logo} alt="Aridona Bijoux Logo" className="h-full w-full object-contain" />
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                aria-label="Recherche"
                onClick={() => setMontreRecherche(!montreRecherche)} 
                className={`p-1 transition-colors ${montreRecherche ? 'text-amber-900' : 'text-stone-800'}`}
              >
                <Search className="w-5 h-5 stroke-[1.75]" />
              </button>

              <Link to="/favoris" aria-label="Mes favoris" className="relative p-1 text-stone-800 hover:text-amber-900 transition-colors">
                <Heart className="w-5 h-5 stroke-[1.75]" />
                {totalFavoris > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-900 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalFavoris}
                  </span>
                )}
              </Link>

              <button 
                type="button"
                onClick={() => setPanierOuvert(true)} 
                aria-label="Panier" 
                className="text-stone-800 relative p-1 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-900 text-white text-[9px] flex items-center justify-center rounded-full font-bold">
                  {getPanierCount?.() || 0}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* --- RECHERCHE ACCORDÉON MOBILE --- */}
        {montreRecherche && (
          <>
            <div className="md:hidden fixed inset-0 top-[96px] bg-black/20 z-40 backdrop-blur-xs" onClick={() => setMontreRecherche(false)} />
            <div className="md:hidden fixed top-[96px] left-0 w-full z-50 bg-white p-3 shadow-md border-b border-stone-100">
              <BarRecherche isNavbar={false} />
            </div>
          </>
        )}
      </header>

      {/* --- MENU MOBILE DRAWER --- */}
      <MenuMobile visible={visible} setVisible={setVisible} />
    </div>
  );
}