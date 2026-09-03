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
<NavLink to="/utilisateurs" className={({ isActive }) => `flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0 1 4 16c-1.657 0-3 .895-3 2s1.343 2 3 2a3.98 3.98 0 0 0 1.121-.196M19.879 17.804A13.937 13.937 0 0 0 20 16c1.657 0 3 .895 3 2s-1.343 2-3 2a3.98 3.98 0 0 1-1.121-.196M15.536 11.464a5 5 0 1 1-7.072-7.072 5 5 0 0 1 7.072 7.072ZM12 15c-2.5 0-7.5 1.25-7.5 3.75V21h15v-2.25C19.5 16.25 14.5 15 12 15Z" />
  </svg>
  <span>Utilisateurs</span>
</NavLink>
<NavLink to="/listeProduits" className={({ isActive }) => `
            flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
            ${isActive 
              ? 'bg-slate-950 text-white shadow-sm font-semibold' 
              : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'
            }
          `}>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M16 3h-1a4 4 0 0 0-8 0H7a2 2 0 0 0-2 2v1h14V5a2 2 0 0 0-2-2Z" />
  </svg>
  <span>Liste Produits</span>
</NavLink>

<NavLink to="/avis" className={({ isActive }) => `
            flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
            ${isActive
              ? 'bg-slate-950 text-white shadow-sm font-semibold'
              : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'
            }
          `}>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-4 4v-4z" />
  </svg>
  <span>Avis Clients</span>
</NavLink>

<NavLink to="/articles" className={({ isActive }) => `
            flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
            ${isActive
              ? 'bg-slate-950 text-white shadow-sm font-semibold'
              : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'
            }
          `}>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10l6 6v10a2 2 0 0 1-2 2ZM9 13h6M9 17h6M9 9h1" />
  </svg>
  <span>Journal / Blog</span>
</NavLink>

<NavLink to="/packs" className={({ isActive }) => `
            flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
            ${isActive ? 'bg-slate-950 text-white shadow-sm font-semibold' : 'text-gray-500 hover:text-slate-900 hover:bg-gray-50'}
          `}>
  <span className="text-lg leading-none">✦</span>
  <span className="tracking-wide">Packs & Offres</span>
</NavLink>

      </div>

      {/* Partie Basse : Informations de session ou copyright discret */}
      <div className="p-4 border-t border-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-between text-center pl-2.5">
          <span className="text-xs font-bold text-amber-800">A</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-800">Administrateur</span>
          <span className="text-[10px] text-gray-400">Gestion Aridona</span>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;