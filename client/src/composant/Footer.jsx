import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Liens des icônes SVG (Style minimaliste Or/Amber)
  const socialIcons = [
    { name: 'Instagram', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg' },
    { name: 'Facebook', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg' },
    { name: 'X', url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg' }
  ];

  return (
    <footer className="bg-gray-950 text-white pt-20 pb-10 border-t border-gray-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Colonne 1 : Marque & Newsletter */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            <h2 className="font-serif text-4xl tracking-[0.25em] text-amber-500">Aridona</h2>
            <p className="text-gray-400 font-light max-w-sm leading-relaxed text-sm">
              Inscrivez-vous pour recevoir les invitations à nos ventes privées et les nouvelles collections de la Maison Aridona.
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

            {/* Icônes Sociales en ligne (SVG Filtre Amber au survol) */}
            <div className="flex gap-6 pt-4">
              {socialIcons.map((icon, index) => (
                <a key={index} href="#" className="opacity-40 hover:opacity-100 transition-all duration-300 hover:-translate-y-1 transform">
                  <img 
                    src={icon.url} 
                    alt={icon.name} 
                    className="w-5 h-5 invert" // Invert rend l'icône blanche pour le fond noir
                    style={{ filter: 'brightness(0) saturate(100%) invert(85%) sepia(34%) saturate(769%) hue-rotate(355deg) brightness(102%) contrast(102%)' }} 
                    // Ce filtre donne une teinte dorée/amber au survol ou par défaut
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Colonne 2 : Boutique */}
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8 text-gray-500">Collections</h3>
            <ul className="space-y-4 text-xs font-light text-gray-400">
              <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Haute Joaillerie</Link></li>
              <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Bagues de Fiançailes</Link></li>
              <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Alliances</Link></li>
              <li><Link onClick={scrollToTop} to="/collection" className="hover:text-amber-500 transition-all duration-300">Colliers & Pendentifs</Link></li>
            </ul>
          </div>

          {/* Colonne 3 : Maison Aridona */}
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
          <p>&copy; {currentYear} Aridona. Conçu avec excellence.</p>
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