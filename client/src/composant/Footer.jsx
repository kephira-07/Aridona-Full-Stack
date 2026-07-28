import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import logon from '../assets/logon.jpeg';
import logo from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  // Récupération des catégories dynamiques depuis le contexte global
  const { categories } = useContext(ShopContext);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-950 text-white pt-20 pb-10 border-t border-gray-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Colonne 1 : Marque, Objectif & Newsletter */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="transition-all duration-500">
              <Link to="/" onClick={scrollToTop} className="flex items-center cursor-pointer h-34 w-40">
                <img src={logo} alt="Logo Arilona Bijoux" className="object-contain w-full h-full" />
              </Link>
            </div>

            {/* Description explicative (Conformité Validation Google OAuth) */}
            <p className="text-gray-400 font-light max-w-md leading-relaxed text-xs">
              Maison de création de bijoux et haute joaillerie. Authentifiez-vous pour gérer vos commandes, enregistrer vos pièces favorites et bénéficier d'une expérience personnalisée.
            </p>

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

            {/* Contact pour la validation Google */}
            <div className="pt-2 text-xs text-gray-500">
              Contact & Support :{' '}
              <a href="mailto:contact@aridona.store" className="text-amber-500 hover:underline">
                contact@aridona.store
              </a>
            </div>
          </div>

          {/* Colonne 2 : Collections Dynamiques */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8 text-gray-500">Collections</h3>
            <ul className="space-y-4 text-xs font-light text-gray-400">
              {categories && categories.length > 0 ? (
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
                <>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Haute Joaillerie</Link></li>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Bagues de Fiançailles</Link></li>
                  <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Alliances</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Colonne 3 : La Maison */}
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

        {/* Ligne du bas : Copyright & Liens Légaux */}
        <div className="pt-10 border-t border-gray-900/50 flex flex-col md:flex-row items-center justify-between text-[9px] uppercase tracking-[0.2em] text-gray-600 gap-6">
          <p>&copy; {currentYear} Arilona Bijoux. Conçu avec excellence.</p>
          <div className="flex gap-8">
            <Link onClick={scrollToTop} to="/politique-confidentialite" className="hover:text-gray-300">
              Confidentialité
            </Link>
            <Link onClick={scrollToTop} to="/conditions-utilisation" className="hover:text-gray-300">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;