import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../config';

const ListeProduits = ({ token }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // Pour éviter les double-clics

  // 📥 Récupérer tous les produits
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/produit/list`);
      
      if (response.data.success) {
        setList(response.data.produits);
      } else {
        toast.error(response.data.message || "Impossible de charger la liste");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Mettre à jour le stock en temps réel
  const toggleStock = async (id, currentStatus) => {
    try {
      setUpdatingId(id);
      const newStatus = !currentStatus;

      const response = await axios.post(
        `${backendUrl}/api/produit/stock`,
        { id, enStock: newStatus },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Statut mis à jour");
        setList(prevList =>
          prevList.map(item =>
            item._id === id ? { ...item, enStock: newStatus } : item
          )
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // 🗑️ Supprimer un produit
  const removeProduct = async (id) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer ce bijou ?")) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/produit/remove`,
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setList(prev => prev.filter(item => item._id !== id));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[200px] text-stone-500'>
        Chargement du catalogue...
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-2 p-4 max-w-6xl mx-auto'>
      <p className='mb-2 font-bold text-lg text-stone-800'>Catalogue des Bijoux</p>

      {/* En-tête du tableau (Bureau) */}
      <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1.5fr_1fr] items-center py-2.5 px-4 border bg-stone-100 text-sm font-semibold text-stone-600 rounded-lg'>
        <span>Image</span>
        <span>Nom</span>
        <span>Catégorie</span>
        <span>Prix</span>
        <span className='text-center'>Statut Stock</span>
        <span className='text-center'>Action</span>
      </div>

      {/* Liste des produits */}
      {list.length === 0 ? (
        <p className='text-stone-500 py-4 text-center'>Aucun produit trouvé.</p>
      ) : (
        list.map((item) => (
          <div 
            key={item._id} 
            className='grid grid-cols-[1fr_2fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1.5fr_1fr] items-center gap-2 py-3 px-4 border border-stone-200 text-sm rounded-xl hover:bg-stone-50/50 transition-colors'
          >
            {/* Image */}
            <img 
              className='w-12 h-12 object-cover rounded-md border border-stone-200' 
              src={item.image?.[0] || '/placeholder.png'} 
              alt={item.nom} 
            />
            
            {/* Nom */}
            <p className='font-medium text-stone-800 truncate'>{item.nom}</p>
            
            {/* Catégorie */}
            <p className='hidden md:block text-stone-500 truncate'>{item.categorie}</p>
            
            {/* Prix */}
            <p className='hidden md:block font-semibold text-amber-900'>
              {item.prix?.toLocaleString()} FCFA
            </p>

            {/* BOUTON TOGGLE STOCK */}
            <div className='flex items-center justify-center'>
              <button
                disabled={updatingId === item._id}
                onClick={() => toggleStock(item._id, item.enStock !== false)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 flex items-center gap-1.5 border
                  ${updatingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}
                  ${item.enStock !== false
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${item.enStock !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {item.enStock !== false ? 'En Stock' : 'Rupture'}
              </button>
            </div>

            {/* Actions (Suppression) */}
            <div className='text-center'>
              <button 
                onClick={() => removeProduct(item._id)}
                className='text-rose-600 hover:text-rose-800 text-xs font-medium underline px-2 py-1 rounded transition-colors'
              >
                Supprimer
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ListeProduits;