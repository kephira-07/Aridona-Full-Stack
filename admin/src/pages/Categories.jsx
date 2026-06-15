import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { backendUrl } from '../config';

export default function Categories({ token }) {
  const [categories, setCategories] = useState([]);
  const [nom, setNom] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); 
  const [loading, setLoading] = useState(false);

  // --- ÉTATS POUR LA MODIFICATION ---
  const [idEdition, setIdEdition] = useState(null); // Stocke l'ID de la catégorie en cours de modification

  // 1. Charger les catégories existantes
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/categorie`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error("Erreur chargement catégories:", err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Gérer le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); 
    }
  };

  // Activer le mode édition pour une catégorie
  const chargerEdition = (cat) => {
    setIdEdition(cat._id);
    setNom(cat.nom);
    setPreview(cat.image); // L'aperçu affiche l'ancienne image Cloudinary par défaut
    setImage(null); // On attend une NOUVELLE image optionnelle
  };

  // Annuler le mode édition
  const annulerEdition = () => {
    setIdEdition(null);
    setNom('');
    setImage(null);
    setPreview(null);
  };

  // 3. Soumettre le formulaire d'ajout OU de modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const nomNettoye = nom.trim();
    if (!nomNettoye) return alert("Le nom de la catégorie est requis");
    
    // En mode création, l'image est obligatoire. En mode édition, elle est optionnelle (si on ne veut pas la changer)
    if (!idEdition && !image) return alert("Veuillez sélectionner une image");

    setLoading(true);

    const formData = new FormData();
    formData.append('nom', nomNettoye);
    if (image) {
      formData.append('image', image); // N'envoie l'image que s'il y a un nouveau fichier
    }

    try {
      let response;

      if (idEdition) {
        // 🛠️ APPEL BACKEND POUR LA MISE À JOUR (PUT ou POST selon tes routes backend)
        response = await axios.put(`${backendUrl}/api/categorie/update/${idEdition}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // APPEL BACKEND POUR L'AJOUT
        response = await axios.post(`${backendUrl}/api/categorie/add`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        alert(idEdition ? "Catégorie modifiée avec succès !" : "Catégorie ajoutée avec succès !");
        annulerEdition(); // Réinitialise tout
        e.target.reset(); 
        fetchCategories(); 
      } else {
        alert("Erreur: " + response.data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      alert(error.response?.data?.message || "Erreur serveur (500)");
    } finally {
      setLoading(false);
    }
  };

  // 4. Supprimer une catégorie (Delete)
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette catégorie ? Cela peut impacter les produits associés.")) {
      try {
        const response = await axios.delete(`${backendUrl}/api/categorie/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          alert("Catégorie supprimée !");
          if (idEdition === id) annulerEdition();
          fetchCategories(); 
        }
      } catch (error) {
        console.error("Erreur de suppression:", error);
        alert(error.response?.data?.message || "Impossible de supprimer");
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Gestion des Catégories</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FORMULAIRE D'AJOUT / ÉDITION */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            {idEdition ? "Modifier la Catégorie" : "Nouvelle Catégorie"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nom de la catégorie</label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Bagues, Colliers..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Image {idEdition && "(Optionnel - Laissez vide pour conserver l'actuelle)"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                required={!idEdition} // Obligatoire uniquement à la création
              />
            </div>

            {/* Zone de prévisualisation */}
            {preview && (
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-400 block mb-1">Aperçu :</span>
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500 mx-auto">
                  <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white py-2.5 rounded-xl font-medium text-sm transition-colors disabled:bg-gray-300 ${
                idEdition ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {loading ? "Traitement en cours..." : idEdition ? "Sauvegarder les modifications" : "Ajouter la catégorie"}
            </button>

            {idEdition && (
              <button
                type="button"
                onClick={annulerEdition}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                Annuler la modification
              </button>
            )}
          </form>
        </div>

        {/* LISTE AVEC ACTIONS MODIFIER & SUPPRIMER */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Catégories Actuelles ({categories.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-sm font-medium">
                  <th className="pb-3">Image</th>
                  <th className="pb-3">Nom / Slug</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map((cat) => (
                  <tr key={cat._id} className={`text-slate-700 text-sm ${idEdition === cat._id ? 'bg-amber-50/40' : ''}`}>
                    <td className="py-3">
                      <img src={cat.image} alt={cat.nom} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-800">{cat.nom}</div>
                      <div className="text-xs text-amber-600 font-mono">/{cat.slug}</div>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button
                        onClick={() => chargerEdition(cat)}
                        className="text-amber-600 hover:text-amber-800 font-medium text-xs bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {categories.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">Aucune catégorie pour le moment.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}