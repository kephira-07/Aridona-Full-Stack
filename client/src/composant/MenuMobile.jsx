import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../config';
import logo from '../assets/logo.png';
import { ShopContext } from '../context/ShopContext';
import {
  X,
  ChevronRight,
  User,

  Gem,
  Info,
  Newspaper,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

const MenuMobile = ({ visible, setVisible, logo2 }) => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const context = useContext(ShopContext);

  useEffect(() => {
    if (context?.categories && context.categories.length > 0) {
      setCategories(context.categories);
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categorie`);
        if (response.data.success) {
          setCategories(response.data.data || response.data.categories || []);
        }
      } catch (error) {
        console.error("Erreur chargement catégories:", error.message);
      }
    };

    if (visible) fetchCategories();
  }, [visible, context]);

  const handleCategoryClick = (id, slug) => {
    setVisible(false);
    if (id === 'all') {
      navigate('/collection');
    } else {
      navigate(slug ? `/collection/${slug}` : '/collection', {
        state: slug ? undefined : { initialCategory: id }
      });
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-stone-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setVisible(false)}
    >
      <div 
        className={`absolute top-0 left-0 w-5/6 max-w-sm h-full bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col justify-between font-sans ${
          visible ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CONTENU PRINCIPAL SCROLLABLE */}
        <div className="flex-1 overflow-y-auto min-h-0">
          
          {/* 1. En-tête de Marque */}
          <div className="px-6 pt-6 pb-4 border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center justify-between mb-2">
              <NavLink to="/" onClick={() => setVisible(false)} className="h-9 block"> 
                <img src={logo} alt="Aridona Bijoux" className="object-contain h-full w-auto" />
              </NavLink>
              <button 
                onClick={() => setVisible(false)} 
                className="p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
         
          </div>

          {/* 2. Section Collections & Catégories */}
          <div className="py-2">
            <div className="px-6 py-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-stone-800">
             
              <span>Nos Collections</span>
            </div>

            <nav className="divide-y divide-stone-100/70">
              <NavLink
                to="/packs"
                onClick={() => setVisible(false)}
                className="flex items-center justify-between px-6 py-3.5 text-left group transition-colors hover:bg-amber-50"
              >
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Packs de bijoux</span>
                <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-1 transition-all" />
              </NavLink>
              {/* Tout voir */}
              <button
                onClick={() => handleCategoryClick('all')}
                className="flex items-center justify-between px-6 py-3.5 w-full text-left group transition-colors hover:bg-stone-50"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 group-hover:text-amber-800 transition-colors">
                  Toutes les créations
                </span>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-800 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Catégories de la BDD */}
              {categories.map((cat) => (
                <button 
                  key={cat._id || cat.id} 
                  onClick={() => handleCategoryClick(cat._id || cat.id, cat.slug)}
                  className="flex items-center justify-between px-6 py-3.5 w-full text-left group transition-colors hover:bg-stone-50"
                >
                  <span className="text-xs font-medium uppercase tracking-wider text-stone-700 group-hover:text-amber-800 transition-colors">
                    {cat.nom || cat.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-800 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </nav>
          </div>

          {/* 3. Section "À Propos & Maison" (Les Grandes Lignes) */}
          <div className="mt-2 pt-4 border-t border-stone-100 bg-stone-50/30">
            <div className="px-6 py-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              <Gem className="w-3.5 h-3.5 text-amber-700" />
              <span>La Maison Aridona</span>
            </div>

            <nav className="space-y-1 py-1">
              <NavLink
                to="/a-propos"
                onClick={() => setVisible(false)}
                className="flex items-center gap-3 px-6 py-3 text-xs font-medium text-stone-700 hover:text-amber-800 transition-colors hover:bg-stone-50"
              >
                <Info className="w-4 h-4 text-stone-400" />
                <span>Notre Histoire & Savoir-faire</span>
              </NavLink>

              <NavLink
                to="/blog"
                onClick={() => setVisible(false)}
                className="flex items-center gap-3 px-6 py-3 text-xs font-medium text-stone-700 hover:text-amber-800 transition-colors hover:bg-stone-50"
              >
                <Newspaper className="w-4 h-4 text-stone-400" />
                <span>Le Journal</span>
              </NavLink>

              <div className="px-6 py-2 space-y-2 mt-2">
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>Matériaux nobles & durables</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>Livraison sécurisée & Écrin offert</span>
                </div>
              </div>
            </nav>
          </div>

        </div>

        {/* 4. Pied du Menu : Actions & Contact */}
        <div className="p-5 bg-stone-50 border-t border-stone-200/80 space-y-2.5">
          <NavLink 
            to="/login"
            onClick={() => setVisible(false)}
            className="flex items-center justify-center gap-2 w-full bg-white text-amber-800 py-3.5 px-4  text-xs font-semibold tracking-widest uppercase shadow-sm transition-all active:scale-[0.98]"
          >
            <User className="w-4 h-4 text-amber-800" />
            <span>Mon Espace Privé</span>
          </NavLink>

          <a
            href={`https://wa.me/${context?.whatsappNum || '22872656485'}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 py-2.5 px-4  text-[11px] font-medium tracking-wider uppercase transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Service Client WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default MenuMobile;