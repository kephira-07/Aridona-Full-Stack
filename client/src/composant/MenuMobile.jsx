import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../config';
import { X, ChevronRight, User } from 'lucide-react';

const MenuMobile = ({ visible, setVisible, logo2 }) => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Chargement ultra simple des catégories depuis l'API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categorie`);
        if (response.data.success) setCategories(response.data.data);
      } catch (error) {
        console.error("Erreur menu mobile:", error.message);
      }
    };
    if (visible) fetchCategories(); // Ne charge que si le menu est ouvert
  }, [visible]);

  // Quand on clique sur une catégorie : on navigue vers /collection en passant l'ID
  const handleCategoryClick = (id) => {
    setVisible(false); // Ferme le menu
    if (id === 'all') {
      navigate('/collection'); // Tout voir
    } else {
      navigate('/collection', { state: { initialCategory: id } }); // Catégorie spécifique
    }
  };

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
        <div>
          {/* En-tête */}
          <div className="flex items-center justify-between p-5 border-b border-stone-200/60 bg-white">
            <NavLink to="/" onClick={() => setVisible(false)} className="h-9 block"> 
              <img src={logo2} alt="Aura Héritage" className="object-contain h-full w-auto" />
            </NavLink>
            <button onClick={() => setVisible(false)} className="p-2 text-stone-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Liste des liens de catégories */}
          <nav className="flex flex-col py-2 bg-white max-h-[calc(100vh-160px)] overflow-y-auto">
            
            {/* Bouton Tout voir */}
            <button
              onClick={() => handleCategoryClick('all')}
              className="flex items-center justify-between px-5 py-4 border-b border-stone-100 group w-full text-left"
            >
              <span className="font-serif text-xs text-stone-900 uppercase tracking-wider group-hover:text-amber-700">
                Tout voir
              </span>
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600" />
            </button>

            {/* Catégories dynamiques de l'API */}
            {categories.map((cat) => (
              <button 
                key={cat._id} 
                onClick={() => handleCategoryClick(cat._id)}
                className="flex items-center justify-between px-5 py-4 border-b border-stone-100 group w-full text-left"
              >
                <span className="font-serif text-xs text-stone-900 uppercase tracking-wider group-hover:text-amber-700">
                  {cat.nom}
                </span>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600" />
              </button>
            ))}
          </nav>
        </div>

        {/* Pied de menu */}
        <div className="p-4 bg-white border-t border-stone-200/60">
          <NavLink 
            to="/login"
            onClick={() => setVisible(false)}
            className="flex items-center gap-3 w-full bg-stone-950 text-white p-4 rounded-xl text-xs font-semibold tracking-widest uppercase justify-center"
          >
            <User className="w-4 h-4 text-amber-400" />
            <span>Mon Espace Privé</span>
          </NavLink>
        </div>

      </div>
    </div>
  );
};

export default MenuMobile;