import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';


const Footer = () => {
  const currentYear = new Date().getFullYear();
  // Récupération des catégories dynamiques depuis ton contexte global
  const { categories } = useContext(ShopContext);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-950 text-white pt-20 pb-10 border-t border-gray-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Colonne 1 : Marque & Newsletter */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            {/* 🌟 Ajustement de la marque vers sa nouvelle identité */}
            <h2 className="font-serif text-3xl tracking-[0.25em] text-amber-500 uppercase">
              Aura Héritage
            </h2>
            <p className="text-gray-400 font-light max-w-sm leading-relaxed text-sm">
              Inscrivez-vous pour recevoir les invitations à nos ventes privées et les nouvelles créations exclusives de la Maison.
            </p>
            
            <div className="relative max-w-md">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="w-full bg-transparent border-b border-gray-800 py-3 text-white focus:outline-none focus:border-amber-500 transition-all duration-500 placeholder:text-gray-600 text-sm"
              />
              <button className="absolute right-0 bottom-3 text-amber-500 hover:text-white transition-all duration-300 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em]">S'inscrire</span>
              </button>
            </div>

            {/* 🌟 Icônes Sociales avec Lucide (Stylisées Elite Pop sans filtres brisés) */}
            {/* <div className="flex gap-6 pt-2">
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-amber-500 transition-all duration-300 hover:-translate-y-1 transform">
                <Instagram size={20} strokeWidth={1.5} />
              </a>
              <a href="#" aria-label="🥲" className="text-gray-500 hover:text-amber-500 transition-all duration-300 hover:-translate-y-1 transform">
                <🥲 size={20} strokeWidth={1.5} />
              </a>
              <a href="#" aria-label="😎/ X" className="text-gray-500 hover:text-amber-500 transition-all duration-300 hover:-translate-y-1 transform">
                <😎size={20} strokeWidth={1.5} />
              </a>
            </div> */}
          </div>

          {/* Colonne 2 : Collections Dynamiques */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8 text-gray-500">Collections</h3>
            <ul className="space-y-4 text-xs font-light text-gray-400">
              {categories && categories.length > 0 ? (
                // 🌟 On affiche dynamiquement les 4 premières catégories renvoyées par MongoDB
                categories.slice(0, 4).map((cat) => (
                  <li key={cat._id}>
                    <Link 
                      onClick={scrollToTop} 
                      to="/collection" 
                      state={{ initialCategory: cat._id }}
                      className="hover:text-amber-500 transition-all duration-300 capitalize"
                    >
                      {cat.nom}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback élégant pendant le chargement initial du serveur
                <>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Haute Joaillerie</Link></li>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Bagues de Fiançailles</Link></li>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Alliances</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Colonne 3 : Maison Aura Héritage */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8 text-gray-500">La Maison</h3>
            <ul className="space-y-4 text-xs font-light text-gray-400">
              <li><Link onClick={scrollToTop} to="/contact" className="hover:text-amber-500 transition-all duration-300">Notre Histoire</Link></li>
              <li><Link onClick={scrollToTop} to="/contact" className="hover:text-amber-500 transition-all duration-300">Prendre rendez-vous</Link></li>
              <li><Link onClick={scrollToTop} to="/contact" className="hover:text-amber-500 transition-all duration-300">Guide des Tailles</Link></li>
              <li><Link onClick={scrollToTop} to="/contact" className="hover:text-amber-500 transition-all duration-300">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Ligne du bas : Copyright */}
        <div className="pt-10 border-t border-gray-900/50 flex flex-col md:flex-row items-center justify-between text-[9px] uppercase tracking-[0.2em] text-gray-600 gap-6">
          <p>&copy; {currentYear} Aura Héritage. Conçu avec excellence.</p>
          <div className="flex gap-8">
            <Link to="/" className="hover:text-gray-300">Confidentialité</Link>
            <Link to="/" className="hover:text-gray-300">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;