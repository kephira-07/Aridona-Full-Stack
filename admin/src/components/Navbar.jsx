import React from 'react';

const Navbar = ({ setToken }) => {
  
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token'); // Nettoyage propre de la session
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-6 py-4 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
      
      {/* Côté Gauche : Branding / Logo */}
      <div className="flex flex-col items-start select-none">
        <h1 className="text-xl md:text-2xl font-semibold tracking-[0.2em] text-slate-900 font-serif">
          ARILONA
        </h1>
        <span className="text-[10px] uppercase tracking-[0.15em] text-amber-600 font-medium mt-0.5">
          Espace Admin
        </span>
      </div>

      {/* Côté Droit : Statut & Déconnexion */}
      <div className="flex items-center gap-4">
        {/* Badge de statut discret (Optionnel mais très pro) */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-emerald-700">Serveur Connecté</span>
        </div>

        {/* Bouton Déconnexion Premium */}
        <button 
          onClick={handleLogout}
          className="relative overflow-hidden group bg-slate-950 text-white text-xs md:text-sm font-medium tracking-wide px-5 py-2.5 rounded-lg transition-all duration-300 hover:bg-slate-800 active:scale-95 shadow-sm"
        >
          <span className="flex items-center gap-2">
            {/* Icône de déconnexion minimaliste en SVG */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Quitter
          </span>
        </button>
      </div>

    </nav>
  );
};

export default Navbar;