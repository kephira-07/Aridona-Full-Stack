import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { backendUrl } from '../config';
import { 
  FolderPlus, 
  Pencil, 
  Trash2, 
  Upload, 
  X, 
  Loader2, 
  Sparkles, 
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'react-toastify';

const isSafeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('blob:') || url.startsWith('https://');
};

export default function Categories({ token }) {
  const [categories, setCategories] = useState([]);
  const [nom, setNom] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); 
  const [loading, setLoading] = useState(false);

  // --- ÉTATS POUR LA MODIFICATION ---
  const [idEdition, setIdEdition] = useState(null);

  // 1. Charger les catégories existantes
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/categorie`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error("Erreur chargement catégories:", err.message);
      toast.error("Impossible de charger les catégories.");
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

  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setImage(null);
    if (idEdition) {
      // Si en édition, on réaffiche la photo Cloudinary d'origine
      const catCurrent = categories.find(c => c._id === idEdition);
      setPreview(catCurrent && isSafeImageUrl(catCurrent.image) ? catCurrent.image : null);
    } else {
      setPreview(null);
    }
  };

  // Activer le mode édition pour une catégorie
  const chargerEdition = (cat) => {
    setIdEdition(cat._id);
    setNom(cat.nom);
    setPreview(isSafeImageUrl(cat.image) ? cat.image : null); // Aperçu Cloudinary par défaut
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!nomNettoye) {
      toast.warning("Le nom de la catégorie est requis");
      return;
    }
    
    if (!idEdition && !image) {
      toast.warning("Veuillez sélectionner une image d'illustration");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('nom', nomNettoye);
    if (image) {
      formData.append('image', image);
    }

    try {
      let response;

      if (idEdition) {
        response = await axios.put(`${backendUrl}/api/categorie/update/${idEdition}`, formData, {
          headers: { 
            token: token,
            Authorization: `Bearer ${token}` 
          }
        });
      } else {
        response = await axios.post(`${backendUrl}/api/categorie/add`, formData, {
          headers: { 
            token: token,
            Authorization: `Bearer ${token}` 
          }
        });
      }

      if (response.data.success) {
        toast.success(idEdition ? "✨ Catégorie modifiée avec succès !" : "✨ Catégorie créée avec succès !");
        annulerEdition();
        fetchCategories(); 
      } else {
        toast.error(response.data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error(error.response?.data?.message || "Erreur serveur (500)");
    } finally {
      setLoading(false);
    }
  };

  // 4. Supprimer une catégorie (Delete)
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette catégorie ? Cela peut impacter les produits associés.")) {
      try {
        const response = await axios.delete(`${backendUrl}/api/categorie/delete/${id}`, {
          headers: { 
            token: token,
            Authorization: `Bearer ${token}` 
          }
        });

        if (response.data.success) {
          toast.info("Catégorie supprimée du catalogue");
          if (idEdition === id) annulerEdition();
          fetchCategories(); 
        } else {
          toast.error(response.data.message || "Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur de suppression:", error);
        toast.error(error.response?.data?.message || "Impossible de supprimer la catégorie");
      }
    }
  };

  return (
    <div className="max-w-6xl font-sans text-stone-800">
      
      {/* En-tête de la Page */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold uppercase tracking-widest mb-1">
          <Layers className="w-4 h-4" />
          <span>Atelier & Taxonomie</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Gestion des Catégories
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Organisez les divisions de votre catalogue (Bagues, Colliers, Bracelets...).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- FORMULAIRE D'AJOUT / ÉDITION --- */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs lg:col-span-1 sticky top-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-stone-100">
            <FolderPlus className="w-4 h-4 text-amber-800" />
            <h2 className="text-sm font-semibold tracking-wide text-stone-900 uppercase">
              {idEdition ? "Modifier la Catégorie" : "Nouvelle Catégorie"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nom */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Nom de la catégorie *
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Colliers & Pendentifs"
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Illustration {idEdition && "(Optionnelle)"}
              </label>

              {isSafeImageUrl(preview) ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-stone-200 group">
                  <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                  {image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full transition-colors shadow-md"
                      title="Retirer la nouvelle image"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-stone-900/60 backdrop-blur-xs py-1 px-3 text-center">
                    <span className="text-[10px] text-white font-medium">
                      {image ? "Nouvelle image sélectionnée" : "Image actuelle Cloudinary"}
                    </span>
                  </div>
                </div>
              ) : (
                <label className="w-full h-36 border-2 border-dashed border-stone-200 hover:border-amber-700/60 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-all text-center p-4 group">
                  <div className="p-2.5 rounded-full bg-white border border-stone-200 group-hover:border-amber-600/40 text-stone-400 group-hover:text-amber-700 transition-all mb-2 shadow-xs">
                    <Upload size={16} />
                  </div>
                  <span className="text-xs font-medium text-stone-600 group-hover:text-stone-900">
                    Cliquez pour choisir un visuel
                  </span>
                  <span className="text-[10px] text-stone-400 mt-0.5">JPG, PNG ou WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    required={!idEdition}
                  />
                </label>
              )}
            </div>

            {/* Actions du formulaire */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-medium text-xs uppercase tracking-widest text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  idEdition 
                    ? 'bg-amber-800 hover:bg-amber-900' 
                    : 'bg-stone-900 hover:bg-stone-950'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-400" />
                    <span>{idEdition ? "Enregistrer les modifications" : "Créer la catégorie"}</span>
                  </>
                )}
              </button>

              {idEdition && (
                <button
                  type="button"
                  onClick={annulerEdition}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Annuler l'édition
                </button>
              )}
            </div>

          </form>
        </div>

        {/* --- TABLEAU DES CATÉGORIES --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <h2 className="text-sm font-semibold tracking-wide text-stone-900 uppercase">
              Catégories Existantes
            </h2>
            <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-semibold">
              {categories.length} au total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">Aperçu</th>
                  <th className="pb-3">Désignation</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {categories.map((cat) => {
                  const isBeingEdited = idEdition === cat._id;
                  return (
                    <tr 
                      key={cat._id} 
                      className={`transition-colors ${
                        isBeingEdited ? 'bg-amber-50/60' : 'hover:bg-stone-50/50'
                      }`}
                    >
                      <td className="py-3.5 pl-2">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                          {isSafeImageUrl(cat.image) ? (
                            <img src={cat.image} alt={cat.nom} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5">
                        <div className="font-medium text-xs text-stone-900">{cat.nom}</div>
                        <div className="text-[11px] text-amber-800 font-mono mt-0.5">
                          /{cat.slug || cat.nom.toLowerCase().replace(/\s+/g, '-')}
                        </div>
                      </td>

                      <td className="py-3.5 text-right pr-2">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => chargerEdition(cat)}
                            className="p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-100/60 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Pencil size={15} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(cat._id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {categories.length === 0 && (
              <div className="text-center py-12 text-stone-400 text-xs">
                <Layers size={32} className="mx-auto mb-2 text-stone-300" />
                <span>Aucune catégorie enregistrée pour le moment.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}