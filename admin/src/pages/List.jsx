import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../config';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]); // Stocke les catégories pour faire la correspondance
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Récupérer la liste des bijoux
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/produit/list`);
      if (response.data.success) {
        setList(response.data.produits);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Récupérer les catégories pour traduire les IDs en noms textuels
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/categorie`);
      if (response.data.success) {
        setCategoriesList(response.data.data);
      }
    } catch (error) {
      console.error("Erreur chargement catégories dans la liste:", error.message);
    }
  };

  // 3. Supprimer un bijou (Nettoie MongoDB + Cloudinary via ton API backend)
  const removeProduit = async (id) => {
    if (window.confirm("Voulez-vous vraiment retirer ce bijou de la collection ?")) {
      try {
        const response = await axios.delete(`${backendUrl}/api/produit/remove/${id}`, { 
          headers: { token } 
        });
        if (response.data.success) {
          alert("Produit supprimé !");
          await fetchList(); // Recharge le tableau rafraîchi
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };

  // 4. Fonction magique pour transformer l'ID de catégorie en Nom lisible
  const getCategorieNom = (id) => {
    if (!id) return "Non classé";
    // Si le backend utilise déjà le .populate() et renvoie un objet
    if (typeof id === 'object' && id.nom) return id.nom;
    
    // Sinon, on cherche l'ID dans notre liste locale chargée depuis l'API
    const catFound = categoriesList.find(cat => cat._id === id);
    return catFound ? catFound.nom : "Chargement...";
  };

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center py-10 font-medium text-gray-500">Chargement de la collection...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Toute la collection ({list.length} articles)</h2>

      {list.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Aucun produit trouvé dans le catalogue.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                <th className="py-3 pl-2">Visuel</th>
                <th className="py-3">Nom</th>
                <th className="py-3">Catégorie</th>
                <th className="py-3">Prix</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-slate-700">
              {list.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Colonne Image sécurisée */}
                  <td className="py-3 pl-2">
                    <img 
                      src={Array.isArray(item.image) ? item.image[0] : item.image} 
                      alt={item.nom} 
                      className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                    />
                  </td>
                  
                  {/* Colonne Nom */}
                  <td className="py-3 font-medium text-slate-900">{item.nom}</td>
                  
                  {/* Colonne Catégorie (Affiche le VRAI nom textuel au lieu de l'ID) */}
                  <td className="py-3 text-gray-500">{getCategorieNom(item.categorie)}</td>
                  
                  {/* Colonne Prix localisé */}
                  <td className="py-3 font-semibold text-slate-800">
                    {item.prix?.toLocaleString()} Fcf
                  </td>
                  
                  {/* Colonne Actions (Boutons Modifier et Supprimer regroupés proprement sur une ligne) */}
                  <td className="py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => navigate(`/edit/${item._id}`)} 
                        className="text-xs uppercase tracking-wider text-amber-700 hover:text-amber-900 font-semibold bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-all"
                      >
                        Modifier ✏️
                      </button>

                      <button 
                        onClick={() => removeProduit(item._id)}
                        className="text-xs uppercase tracking-wider text-red-500 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-all"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default List;