import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  X, 
  ChevronRight, 
  User, 
  Sparkles, 
  Gem, 
  Layers, 
  Glasses 
} from 'lucide-react';

const MenuMobile = ({ visible, setVisible, logo2 }) => {
  
  // 🌟 Tableau enrichi avec icônes appropriées et badges marketing discrets
  const navigationItems = [
    { 
      name: 'Nouveautés', 
      to: '/collection', 
      search: '?filtre=nouveautes', 
      desc: 'Les dernières créations exclusives', 
      icon: Sparkles,
      badge: 'New'
    },
    { 
      name: 'Ensembles', 
      to: '/collection', 
      search: '?categorie=ensembles', 
      desc: 'Parures complètes et harmonieuses', 
      icon: Layers,
      badge: 'Elite'
    },
    { 
      name: 'Colliers', 
      to: '/collection', 
      search: '?categorie=collier', 
      desc: 'Sautoirs & pendentifs d’exception', 
      icon: Gem 
    },
    { 
      name: 'Boucles d’oreilles', 
      to: '/collection', 
      search: '?categorie=boucles-oreille', 
      desc: 'Créations et puces précieuses', 
      icon: Gem // Réutilisation ou autre icône selon préférence
    },
    { 
      name: 'Bagues', 
      to: '/collection', 
      search: '?categorie=bagues', 
      desc: 'Anneaux de prestige & solitaires', 
      icon: Gem 
    },
    { 
      name: 'Bracelets', 
      to: '/collection', 
      search: '?categorie=bracelets', 
      desc: 'Gourmettes & joncs délicats', 
      icon: Gem 
    },
    { 
      name: 'Armlets', 
      to: '/collection', 
      search: '?categorie=armlets', 
      desc: 'Bracelets de bras pour un style audacieux', 
      icon: Gem 
    },
    { 
      name: 'Chaines de lunette', 
      to: '/collection', 
      search: '?categorie=chaines-lunette', 
      desc: 'Accessoires de style et élégance', 
      icon: Glasses 
    },
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
              <img src={logo2} alt="Aura Héritage" className="object-contain h-full w-auto" />
            </NavLink>
            <button 
              aria-label="Fermer menu mobile" 
              onClick={() => setVisible(false)} 
              className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* ================= LIENS DE NAVIGATION AMÉLIORÉS ================= */}
          <nav className="flex flex-col py-2 divide-y divide-stone-100 bg-white max-h-[calc(100vh-160px)] overflow-y-auto">
            {navigationItems.map((item) => {
              const IconeItem = item.icon;
              return (
                <NavLink 
                  key={item.name} 
                  to={{ pathname: item.to, search: item.search }}
                  onClick={() => setVisible(false)}
                  className={({ isActive }) => 
                    `flex items-center justify-between px-5 py-3.5 group hover:bg-stone-50/50 transition-all duration-200 ${
                      isActive && item.search === window.location.search ? 'bg-stone-50/80 border-l-2 border-amber-600 pl-4.5' : ''
                    }`
                  }
                >
                  <div className="flex items-center gap-3.5">
                    {/* Conteneur d'icône style Bento épuré */}
                    <div className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors shrink-0">
                      <IconeItem size={15} strokeWidth={1.5} className={item.name === 'Nouveautés' ? 'text-amber-600 animate-pulse' : ''} />
                    </div>

                    <div className="flex flex-col">
                      <span className="font-serif text-xs text-stone-900 uppercase tracking-wider group-hover:text-amber-700 transition-colors flex items-center gap-2">
                        {item.name}
                        {item.badge && (
                          <span className="text-[7px] font-sans font-bold uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200/50 px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-stone-400 font-light mt-0.5 leading-tight">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" strokeWidth={1.5} />
                </NavLink>
              );
            })}
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
            <span>Mon Espace Privé Aura</span>
          </NavLink>
        </div>

      </div>
    </div>
  );
};

export default MenuMobile;