import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, ChevronRight, User, Sparkles } from 'lucide-react';

const MenuMobile = ({ visible, setVisible, logo2 }) => {
  
  // 🌟 Vos vraies catégories fonctionnelles
  const navigationItems = [
    { name: 'Nouveautés', to: '/collection', search: '?filtre=nouveautes', desc: 'Les dernières créations exclusives' },
    { name: 'Colliers', to: '/collection', search: '?categorie=collier', desc: 'Sautoirs & pendentifs d’exception' },
    { name: 'Boucles d’oreilles', to: '/collection', search: '?categorie=boucles-oreille', desc: 'Créations et puces précieuses' },
    { name: 'Bagues', to: '/collection', search: '?categorie=bagues', desc: 'Anneaux de prestige & solitaires' },
    { name: 'Bracelets', to: '/collection', search: '?categorie=bracelets', desc: 'Gourmettes & joncs délicats' },
    { name: 'Armlets', to: '/collection', search: '?categorie=armlets', desc: 'Alliances & parures de cérémonie' },
    { name: 'Ensembles', to: '/collection', search: '?categorie=ensembles', desc: 'Parures complètes et harmonieuses' },
    { name: 'Chaines de lunette', to: '/collection', search: '?categorie=chaines-lunette', desc: 'Accessoires de style et élégance' },

  ];

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-stone-950/40 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setVisible(false)}
    >
      <div 
        className={`absolute top-0 left-0 w-4/5 max-w-xs h-full bg-[#FAF9F6] shadow-2xl transition-transform duration-300 ease-out flex flex-col justify-between ${
          visible ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= EN-TÊTE DU MENU ================= */}
        <div>
          <div className="flex items-center justify-between p-5 border-b border-stone-200/60 bg-white">
            <NavLink to="/" onClick={() => setVisible(false)} className="h-9 block"> 
              <img src={logo2} alt="Aridona Héritage" className="object-contain h-full w-auto" />
            </NavLink>
            <button 
              aria-label="Fermer menu mobile" 
              onClick={() => setVisible(false)} 
              className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* ================= LIENS DE NAVIGATION FONCTIONNELS ================= */}
          <nav className="flex flex-col py-2 divide-y divide-stone-100 bg-white">
            {navigationItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={{ pathname: item.to, search: item.search }}
                onClick={() => setVisible(false)}
                className={({ isActive }) => 
                  `flex items-center justify-between px-6 py-4 group hover:bg-stone-50/50 transition-all duration-200 ${
                    isActive && item.search === window.location.search ? 'bg-stone-50/80 border-l-2 border-amber-600 pl-5' : ''
                  }`
                }
              >
                <div className="flex flex-col">
                  <span className="font-serif text-sm text-stone-900 uppercase tracking-wider group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                    {item.name === 'Nouveautés' && <Sparkles size={12} className="text-amber-500 animate-pulse" />}
                    {item.name}
                  </span>
                  <span className="text-[10px] text-stone-400 font-light mt-0.5">
                    {item.desc}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" strokeWidth={1.5} />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ================= PIED DE MENU : ACCÈS COMPTE PRIVÉ ================= */}
        <div className="p-4 bg-white border-t border-stone-200/60">
          <NavLink 
            to="/login"
            onClick={() => setVisible(false)}
            className="flex items-center gap-3 w-full bg-stone-950 text-white p-4 rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-300 hover:bg-amber-700 justify-center shadow-md shadow-stone-950/10"
          >
            <User className="w-4 h-4 text-amber-400" strokeWidth={2} />
            <span>Mon Espace Privé Aridona</span>
          </NavLink>
        </div>

      </div>
    </div>
  );
};

export default MenuMobile;