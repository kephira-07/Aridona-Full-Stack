import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  ShoppingBag,
  Gem,
  PlusCircle,
  Package,
  Tag,
  MessageSquareText,
  Newspaper,
  Users,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, badges = {} }) => {
  const { commandesEnAttente = 0, rupturesStock = 0 } = badges;

  const navItems = [
    { to: '/dashbord', label: 'Tableau de Bord', icon: BarChart3 },
    {
      to: '/orders',
      label: 'Commandes',
      icon: ShoppingBag,
      badge: commandesEnAttente > 0 ? commandesEnAttente : null,
      badgeTone: 'bg-amber-500 text-white',
    },
    {
      to: '/listeProduits',
      label: 'Liste Produits',
      icon: Gem,
      badge: rupturesStock > 0 ? `${rupturesStock} rupt.` : null,
      badgeTone: 'bg-rose-500 text-white',
    },
    { to: '/add', label: 'Ajouter un bijou', icon: PlusCircle },
    { to: '/packs', label: 'Packs & Offres', icon: Package },
    { to: '/categories', label: 'Catégories', icon: Tag },
    { to: '/avis', label: 'Avis Clients', icon: MessageSquareText },
    { to: '/articles', label: 'Journal / Blog', icon: Newspaper },
    { to: '/utilisateurs', label: 'Utilisateurs', icon: Users },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-slate-950 text-white shadow-xs font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 md:w-60 md:shrink-0 md:min-h-[calc(100vh-65px)] ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-1.5 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 md:hidden">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">Menu Admin</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer le menu"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={linkClass}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeTone}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400">
          Aridona Bijoux • Admin
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
