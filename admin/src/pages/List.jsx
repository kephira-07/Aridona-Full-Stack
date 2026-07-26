import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../config';

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  // 1. Récupérer la liste des bijoux depuis MongoDB
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/produit/list`);
      if (response.data.success) {
        setList(response.data.produits || response.data.data || []);
      } else {
        alert(response.data.message || "Erreur lors de la récupération des bijoux.");
      }
    } catch (error) {
      console.error("Erreur fetchList:", error);
      alert(error.response?.data?.message || error.message || "Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Récupérer les catégories pour la correspondance des noms
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/categorie`);
      if (response.data.success) {
        setCategoriesList(response.data.data || response.data.categories || []);
      }
    } catch (error) {
      console.error("Erreur chargement catégories:", error);
    }
  };

  // 3. Supprimer un bijou (MongoDB + Cloudinary)
  const removeProduit = async (id) => {
    if (!window.confirm("Voulez-vous vraiment retirer ce bijou de la collection ?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await axios.delete(`${backendUrl}/api/produit/remove/${id}`, { 
        headers: { token } 
      });

      if (response.data.success) {
        alert("Produit supprimé avec succès ! ✨");
        // Mise à jour locale immédiate de l'état sans recharger la page
        setList(prevList => prevList.filter(item => item._id !== id));
      } else {
        alert(response.data.message || "Impossible de supprimer ce produit.");
      }
    } catch (error) {
      console.error("Erreur removeProduit:", error);
      alert(error.response?.data?.message || error.message || "Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  // 4. Helper pour traduire la catégorie (ID -> Nom ou Objet Populé)
  const getCategorieNom = (cat) => {
    if (!cat) return "Non classé";
    
    // Si le backend renvoie déjà un objet populé via Mongoose (.populate('categorie'))
    if (typeof cat === 'object' && cat.nom) return cat.nom;
    
    // Si la catégorie est juste une chaîne d'ID MongoDB
    const catFound = categoriesList.find(c => c._id === cat);
    return catFound ? catFound.nom : "Chargement...";
  };

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-500 font-medium text-sm">
        <span className="animate-pulse">Chargement de la collection Aridona Bijoux...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Toute la collection</h2>
          <p className="text-xs text-gray-400 mt-0.5">{list.length} pièce(s) actuellement en catalogue</p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-100 rounded-xl">
          <p className="text-gray-400 text-sm">Aucun bijou trouvé dans le catalogue.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                <th className="py-3 pl-2">Visuel</th>
                <th className="py-3">Nom</th>
                <th className="py-3">Catégorie</th>
                <th className="py-3">Matière</th>
                <th className="py-3">Prix</th>
                <th className="py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm text-slate-700">
              {list.map((item) => {
                const mainImage = Array.isArray(item.image) ? item.image[0] : item.image;

                return (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Visualisation de l'image */}
                    <td className="py-3 pl-2">
                      {mainImage ? (
                        <img 
                          src={mainImage} 
                          alt={item.nom} 
                          className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/48?text=Bijou";
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                          N/A
                        </div>
                      )}
                    </td>
                    
                    {/* Nom du produit */}
                    <td className="py-3 font-medium text-slate-900">
                      {item.nom}
                      {item.meilleurVente && (
                        <span className="ml-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-semibold">
                          Coup de cœur
                        </span>
                      )}
                    </td>
                    
                    {/* Nom de la Catégorie */}
                    <td className="py-3 text-gray-500 font-medium">
                      {getCategorieNom(item.categorie)}
                    </td>

                    {/* Métal/Matière */}
                    <td className="py-3 text-gray-400 text-xs font-medium">
                      {item.matiere || "Or Jaune"}
                    </td>
                    
                    {/* Prix public */}
                    <td className="py-3 font-semibold text-slate-800">
                      {Number(item.prix).toLocaleString()} FCFA
                    </td>
                    
                    {/* Boutons d'action */}
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => navigate(`/edit/${item._id}`)} 
                          className="text-xs uppercase tracking-wider text-amber-700 hover:text-amber-900 font-semibold bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-all"
                        >
                          Modifier ✏️
                        </button>

                        <button 
                          disabled={deletingId === item._id}
                          onClick={() => removeProduit(item._id)}
                          className="text-xs uppercase tracking-wider text-red-500 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                        >
                          {deletingId === item._id ? "..." : "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default List;