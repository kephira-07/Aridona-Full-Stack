import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../config';
import { 
  Upload, 
  X, 
  Plus, 
  Sparkles, 
  Loader2, 
  Check, 
  Pencil, 
  Palette,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { availableSizes, availableColors, availableMatieres } from '../constants/produit';

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- ÉTATS FORMULAIRE ---
  const [existingImages, setExistingImages] = useState([]);
  const [images, setImages] = useState([null, null, null, null]); // Nouveaux fichiers uploadés

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  const [stock, setStock] = useState('');
  
  const [categorie, setCategorie] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);

  const [matiere, setMatiere] = useState('Acier Inoxydable');
  const [couleurs, setCouleurs] = useState(['Doré']);
  const [sizes, setSizes] = useState([]);
  const [meilleurVente, setMeilleurVente] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Alt-text des nouvelles photos (une par emplacement, laissé vide = fallback backend)
  const [newAlts, setNewAlts] = useState(['', '', '', '']);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');


  // 1. Charger les catégories et les détails du produit
  useEffect(() => {
    const fetchCategoriesAndProduct = async () => {
      try {
        setFetching(true);

        // A. Récupération des catégories
        const catResponse = await axios.get(`${backendUrl}/api/categorie`);
        if (catResponse.data.success) {
          setCategoriesList(catResponse.data.data || catResponse.data.categories || []);
        }

        // B. Récupération des détails du produit
        const prodResponse = await axios.get(`${backendUrl}/api/produit/single/${id}`);
        if (prodResponse.data.success) {
          const p = prodResponse.data.produit;
          setNom(p.nom || '');
          setDescription(p.description || '');
          setPrix(p.prix || '');
          setStock(p.stock === null || p.stock === undefined ? '' : String(p.stock));
          
          if (p.categorie) {
            const catId = typeof p.categorie === 'object' ? p.categorie._id : p.categorie;
            setCategorie(catId);
          }

          setMatiere(p.matiere || 'Acier Inoxydable');
          setCouleurs(Array.isArray(p.couleurs) && p.couleurs.length > 0 ? p.couleurs : ['Doré']);
          setSizes(Array.isArray(p.sizes) ? p.sizes : []);
          setMeilleurVente(Boolean(p.meilleurVente));
          setMetaTitle(p.metaTitle || '');
          setMetaDescription(p.metaDescription || '');
          setTagsInput(Array.isArray(p.tags) ? p.tags.join(', ') : '');

          // On garde url/publicId/alt de chaque image (nécessaires pour conserver ou éditer l'alt-text)
          const rawImages = Array.isArray(p.image) ? p.image : [];
          const formattedImages = [0, 1, 2, 3].map((i) => {
            const img = rawImages[i];
            if (!img) return null;
            return typeof img === 'object' && img?.url
              ? { url: img.url, publicId: img.publicId, alt: img.alt || '' }
              : { url: img, publicId: null, alt: '' };
          });
          setExistingImages(formattedImages);
        } else {
          toast.error(prodResponse.data.message || "Impossible de charger le produit.");
        }
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
        toast.error(error.response?.data?.message || "Erreur lors de la récupération des données.");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchCategoriesAndProduct();
  }, [id]);

  // Gestion des nouvelles images localement
  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const removeNewImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const removeExistingImage = (index) => {
    const updated = [...existingImages];
    updated[index] = null; // On vide l'emplacement
    setExistingImages(updated);
  };

  const handleExistingAltChange = (index, value) => {
    const updated = [...existingImages];
    if (updated[index]) updated[index] = { ...updated[index], alt: value };
    setExistingImages(updated);
  };

  const handleNewAltChange = (index, value) => {
    const updated = [...newAlts];
    updated[index] = value;
    setNewAlts(updated);
  };

  // Toggle Tailles & Couleurs
  const handleSizeToggle = (size) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleColorToggle = (color) => {
    setCouleurs(prev => {
      if (prev.includes(color)) {
        if (prev.length === 1) {
          toast.warning("Au moins une couleur doit être sélectionnée.");
          return prev;
        }
        return prev.filter(c => c !== color);
      } else {
        return [...prev, color];
      }
    });
  };

  // 2. Soumission du formulaire
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!categorie) {
      toast.error("Veuillez sélectionner une catégorie !");
      return;
    }

    const manifest = [0, 1, 2, 3].map((i) => {
      if (images[i]) return { type: 'new', alt: newAlts[i] || '' };
      if (existingImages[i]) return { type: 'existing', ...existingImages[i] };
      return { type: 'empty' };
    });

    if (manifest.every((slot) => slot.type === 'empty')) {
      toast.error("Veuillez conserver ou fournir au moins une photo pour le bijou.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("description", description);
      formData.append("prix", prix);
      formData.append("stock", stock);
      formData.append("categorie", categorie);
      formData.append("matiere", matiere);
      formData.append("meilleurVente", meilleurVente ? "true" : "false");
      formData.append("metaTitle", metaTitle);
      formData.append("metaDescription", metaDescription);
      formData.append("tags", tagsInput);

      formData.append("sizes", JSON.stringify(sizes));
      formData.append("couleurs", JSON.stringify(couleurs));

      // Décrit l'état voulu de chacun des 4 emplacements (conservé / remplacé / vidé) — voir updateproduit
      formData.append("imagesManifest", JSON.stringify(manifest));

      // Nouveaux fichiers d'images ajoutés (image1, image2, image3, image4)
      images.forEach((img, idx) => {
        if (img) formData.append(`image${idx + 1}`, img);
      });

      const response = await axios.put(
        `${backendUrl}/api/produit/update/${id}`,
        formData,
        {
          headers: {
            token: token,
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      if (response.data.success) {
        toast.success("✨ Bijou mis à jour avec succès !");
        navigate('/listeProduits');
      } else {
        toast.error(response.data.message || "Erreur lors de la mise à jour.");
      }
    } catch (error) {
      console.error("Erreur mise à jour produit:", error);
      toast.error(error.response?.data?.message || "Impossible de sauvegarder les modifications.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-75 gap-3 text-stone-500 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-amber-800" />
        <p className="text-xs font-medium">Chargement des détails de la création...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl font-sans text-stone-800">
      
      {/* En-tête */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold uppercase tracking-widest mb-1">
            <Pencil className="w-4 h-4" />
            <span>Atelier & Édition</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Modifier la Création
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Ajustez les caractéristiques et visuels de votre pièce.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/listeProduits')}
          className="flex items-center gap-2 px-4 py-2 border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-xs font-medium rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Retour au catalogue</span>
        </button>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs">
        
        {/* --- 1. VISUELS DU BIJOU --- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-2">
              <Upload size={14} className="text-amber-800" />
              <span>Visuels de la création (4 max)</span>
            </label>
            <span className="text-[11px] text-stone-400">Cliquez pour ajouter ou remplacer</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((index) => {
              const newFile = images[index];
              const existingImg = existingImages[index];

              return (
                <div key={index} className="relative">
                  {/* Prévisualisation d'une nouvelle photo sélectionnée */}
                  {newFile ? (
                    <div className="space-y-1.5">
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-amber-600/50 group">
                        <img
                          src={URL.createObjectURL(newFile)}
                          alt={`Nouveau ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full transition-colors shadow-md cursor-pointer"
                          title="Annuler le remplacement"
                        >
                          <X size={14} />
                        </button>
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-amber-800 text-white text-[9px] font-medium tracking-wider uppercase rounded">
                          Nouveau
                        </span>
                      </div>
                      <input
                        value={newAlts[index]}
                        onChange={(e) => handleNewAltChange(index, e.target.value)}
                        className="w-full border border-stone-200 bg-stone-50/30 rounded-lg px-2 py-1 text-[10px] outline-none focus:bg-white focus:border-stone-900 transition-all"
                        type="text"
                        placeholder={`Texte alternatif (SEO), ex: ${nom || 'Bijou'} - vue ${index + 1}`}
                      />
                    </div>
                  ) : existingImg ? (
                    /* Image déjà enregistrée en BDD */
                    <div className="space-y-1.5">
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                        <img
                          src={existingImg.url}
                          alt={existingImg.alt || `Existante ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full transition-colors shadow-md cursor-pointer"
                          title="Retirer la photo"
                        >
                          <X size={14} />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-stone-900/90 text-white text-[9px] font-medium tracking-wider uppercase rounded">
                            Couverture
                          </span>
                        )}
                      </div>
                      <input
                        value={existingImg.alt}
                        onChange={(e) => handleExistingAltChange(index, e.target.value)}
                        className="w-full border border-stone-200 bg-stone-50/30 rounded-lg px-2 py-1 text-[10px] outline-none focus:bg-white focus:border-stone-900 transition-all"
                        type="text"
                        placeholder={`Texte alternatif (SEO), ex: ${nom || 'Bijou'} - vue ${index + 1}`}
                      />
                    </div>
                  ) : (
                    /* Slot vide pour ajouter une photo */
                    <label
                      htmlFor={`edit-image${index + 1}`}
                      className="w-full aspect-square border-2 border-dashed border-stone-200 hover:border-amber-700/60 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-all text-center p-2 group"
                    >
                      <div className="p-2.5 rounded-full bg-white border border-stone-200 group-hover:border-amber-600/40 text-stone-400 group-hover:text-amber-700 transition-all mb-1 shadow-xs">
                        <Plus size={16} />
                      </div>
                      <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-800">
                        Photo {index + 1}
                      </span>
                      <input 
                        onChange={(e) => handleImageChange(index, e.target.files[0])} 
                        type="file" 
                        id={`edit-image${index + 1}`} 
                        hidden 
                        accept="image/*" 
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* --- 2. INFORMATIONS PRINCIPALES --- */}
        <div className="space-y-5">
          {/* Nom */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Nom de la création *
            </label>
            <input 
              onChange={(e) => setNom(e.target.value)} 
              value={nom} 
              className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all" 
              type="text" 
              placeholder="Ex: Collier Pendeloque Aura" 
              required 
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Description & Histoire du bijou *
            </label>
            <textarea 
              onChange={(e) => setDescription(e.target.value)} 
              value={description} 
              className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all resize-none" 
              placeholder="Détails du maillage, pierres serties, conseils d'entretien..." 
              rows={4} 
              required 
            />
          </div>

          {/* Prix / Catégorie / Matière */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Stock disponible
              </label>
              <input
                onChange={(e) => setStock(e.target.value)}
                value={stock}
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
                type="number"
                min="0"
                step="1"
                placeholder="Vide = ancien mode"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Prix (FCFA) *
              </label>
              <div className="relative">
                <input 
                  onChange={(e) => setPrix(e.target.value)} 
                  value={prix} 
                  className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all pr-12" 
                  type="number" 
                  placeholder="25000" 
                  required 
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-stone-400">
                  FCFA
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Catégorie *
              </label>
              <select 
                onChange={(e) => setCategorie(e.target.value)} 
                value={categorie} 
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all cursor-pointer"
                required
              >
                <option value="">Sélectionner</option>
                {categoriesList.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.nom || cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Matière Principale
              </label>
              <select 
                onChange={(e) => setMatiere(e.target.value)} 
                value={matiere} 
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all cursor-pointer"
              >
                {availableMatieres.map((mat) => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags / Mots-clés SEO */}
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Tags / Mots-clés SEO <span className="text-stone-400 font-normal normal-case">(séparés par des virgules)</span>
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
              type="text"
              placeholder="ex: collier, double rang, fermoir T, choker, t-bar, doré"
            />
            {tagsInput && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagsInput.split(',').map((tag, idx) => tag.trim() && (
                  <span key={idx} className="bg-stone-100 text-stone-700 text-[11px] px-2 py-0.5 rounded border border-stone-200">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Surcharges SEO (optionnelles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Titre SEO <span className="text-stone-400 font-normal normal-case">(optionnel, sinon le nom est utilisé)</span>
              </label>
              <input
                onChange={(e) => setMetaTitle(e.target.value)}
                value={metaTitle}
                maxLength={70}
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
                type="text"
                placeholder="Ex: Collier Pendeloque Aura | Aridona"
              />
              <span className="text-[10px] text-stone-400">{metaTitle.length}/70</span>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Meta Description <span className="text-stone-400 font-normal normal-case">(optionnel, sinon la description est tronquée)</span>
              </label>
              <input
                onChange={(e) => setMetaDescription(e.target.value)}
                value={metaDescription}
                maxLength={160}
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
                type="text"
                placeholder="Résumé accrocheur affiché dans les résultats Google"
              />
              <span className="text-[10px] text-stone-400">{metaDescription.length}/160</span>
            </div>
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* --- 3. COULEURS & TAILLES --- */}
        <div className="space-y-6">
          {/* Couleurs */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              <Palette size={14} className="text-amber-800" />
              <span>Couleurs Disponibles</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {availableColors.map((color) => {
                const isSelected = couleurs.includes(color);
                return (
                  <button 
                    key={color} 
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected 
                        ? 'bg-amber-900 text-white border-amber-900 shadow-xs' 
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-amber-300" />}
                    <span>{color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tailles */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Tailles Disponibles
            </label>
            <div className="flex flex-wrap gap-2.5">
              {availableSizes.map((size) => {
                const isSelected = sizes.includes(size);
                return (
                  <button 
                    key={size} 
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs' 
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-amber-400" />}
                    <span>{size}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option Meilleure Vente */}
          <div className="p-4 bg-stone-50/80 border border-stone-200/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100/60 text-amber-800 rounded-lg">
                <Sparkles size={16} />
              </div>
              <div>
                <label htmlFor="edit-meilleurVente" className="text-xs font-semibold text-stone-900 cursor-pointer block">
                  Coup de Cœur / Meilleure Vente
                </label>
                <p className="text-[11px] text-stone-500">
                  Activer pour afficher ce produit en vedette sur la page d'accueil.
                </p>
              </div>
            </div>
            
            <input 
              onChange={() => setMeilleurVente(prev => !prev)} 
              checked={meilleurVente} 
              type="checkbox" 
              id="edit-meilleurVente" 
              className="w-4 h-4 accent-amber-900 rounded cursor-pointer" 
            />
          </div>
        </div>

        {/* --- 4. ACTIONS --- */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 hover:bg-stone-950 text-white font-medium text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.99] disabled:bg-stone-400 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-amber-400" />
                <span>Enregistrer les Modifications</span>
              </>
            )}
          </button>

          <button 
            type="button" 
            onClick={() => navigate('/listeProduits')}
            className="w-full sm:w-auto px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer text-center"
          >
            Annuler
          </button>
        </div>

      </form>
    </div>
  );
};

export default Edit;