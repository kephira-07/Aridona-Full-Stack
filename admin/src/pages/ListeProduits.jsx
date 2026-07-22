import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../config';

const ListeProduits = ({ token }) => {
  const [list, setList] = useState([]);
  // Remplace par ton URL backend

  // Récupérer tous les produits
  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/produit/list`);
      if (response.data.success) {
        setList(response.data.produits);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // 🔄 Mettre à jour le stock en temps réel
  const toggleStock = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      
      const response = await axios.post(
        `${backendUrl}/api/produit/stock`,
        { id, enStock: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Mise à jour de l'état local sans recharger la page
        setList(prevList =>
          prevList.map(item =>
            item._id === id ? { ...item, enStock: newStatus } : item
          )
        );
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className='flex flex-col gap-2 p-4'>
      <p className='mb-2 font-bold text-stone-700'>Catalogue des Bijoux</p>

      {/* En-tête du tableau / de la liste */}
      <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1.5fr_1fr] items-center py-2 px-4 border bg-stone-100 text-sm font-semibold text-stone-600 rounded-lg'>
        <span>Image</span>
        <span>Nom</span>
        <span>Catégorie</span>
        <span>Prix</span>
        <span className='text-center'>Statut Stock</span>
        <span className='text-center'>Action</span>
      </div>

      {/* Lignes des produits */}
      {list.map((item) => (
        <div 
          key={item._id} 
          className='grid grid-cols-[1fr_2fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1.5fr_1fr] items-center gap-2 py-3 px-4 border border-stone-200 text-sm rounded-xl hover:bg-stone-50/50 transition-colors'
        >
          {/* Image */}
          <img className='w-12 h-12 object-cover rounded-md' src={item.image[0]} alt={item.nom} />
          
          {/* Nom */}
          <p className='font-medium text-stone-800'>{item.nom}</p>
          
          {/* Catégorie */}
          <p className='hidden md:block text-stone-500'>{item.categorie}</p>
          
          {/* Prix */}
          <p className='hidden md:block font-semibold text-amber-900'>{item.prix} FCFA</p>

          {/* 🟢/🔴 BOUTON TOGGLE STOCK */}
          <div className='flex items-center justify-center'>
            <button
              onClick={() => toggleStock(item._id, item.enStock !== false)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 flex items-center gap-1.5 border
                ${item.enStock !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${item.enStock !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              {item.enStock !== false ? 'En Stock' : 'Rupture'}
            </button>
          </div>

          {/* Action Supprimer / Éditer */}
          <div className='text-center'>
            {/* Tes boutons d'action habituels (ex: suppression) */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListeProduits;