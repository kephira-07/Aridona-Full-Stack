import React from 'react';
import { Menu, ExternalLink, LogOut } from 'lucide-react';

const Navbar = ({ setToken, onToggleMenu }) => {
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  return (
    <nav className="w-full bg-white/95 border-b border-slate-200/80 px-4 py-3.5 sm:px-6 md:px-10 flex items-center justify-between sticky top-0 z-40 shadow-2xs backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMenu}
          aria-label="Ouvrir le menu"
          className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col items-start select-none">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-[0.2em] text-slate-900 font-serif leading-none">
            Aridona
          </h1>
          <span className="text-[10px] uppercase tracking-[0.15em] text-amber-700 font-semibold mt-1">
            Espace Admin
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/70">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-emerald-700">En ligne</span>
        </div>

        <a
          href="https://aridona.store"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 text-slate-700 hover:text-amber-900 text-xs font-semibold transition-all"
        >
          <ExternalLink size={14} />
          <span className="hidden sm:inline">Voir la boutique</span>
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 bg-slate-950 text-white text-xs font-semibold tracking-wide px-3.5 sm:px-4 py-2 rounded-xl transition-all hover:bg-slate-800 active:scale-95 cursor-pointer"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Quitter</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
