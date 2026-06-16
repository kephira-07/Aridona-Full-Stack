import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-[18%] min-w-[200px] min-h-[calc(100vh-80px)] bg-white border-r border-gray-100 pt-8 flex flex-col justify-between sticky top-[80px]">
      
      {/* Partie Haute : Liens de Navigation */}
      <div className="flex flex-col gap-2 px-4">
        <NavLink to="/dashbord" className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-slate-950 text-white shadow-sm font-semibold' : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'}`}>
          {/* Icône Tableau de Bord / Graphique */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
          <span className="tracking-wide">Tableau de Bord</span>
        </NavLink>
        
        {/* Onglet : Ajouter un produit */}
        <NavLink 
          to="/add" 
          className={({ isActive }) => `
            flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
            ${isActive 
              ? 'bg-slate-950 text-white shadow-sm font-semibold' 
              : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'
            }
          `}
        >
          {/* Icône Ajouter (+ / Cube) */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span className="tracking-wide">Ajouter un produit</span>
        </NavLink>

        {/* Onglet : Liste des produits */}
        <NavLink 
          to="/list" 
          className={({ isActive }) => `
            flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
            ${isActive 
              ? 'bg-slate-950 text-white shadow-sm font-semibold' 
              : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'
            }
          `}
        >
          {/* Icône Liste / Collection */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
          </svg>
          <span className="tracking-wide">Collections</span>
        </NavLink>
        <NavLink 
  to="/orders" 
  className={({ isActive }) => `
    flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
    ${isActive ? 'bg-slate-950 text-white shadow-sm font-semibold' : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'}
  `}
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
  <span className="tracking-wide">Commandes</span>
</NavLink>

 <NavLink to="/categories" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 0 1 .586 1.414V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
  </svg>
  <span>Catégories</span>
</NavLink>

      </div>

      {/* Partie Basse : Informations de session ou copyright discret */}
      <div className="p-4 border-t border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-between text-center pl-2.5">
          <span className="text-xs font-bold text-amber-800">A</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800">Administrateur</span>
          <span className="text-[10px] text-gray-400">Gestion Arilona</span>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;