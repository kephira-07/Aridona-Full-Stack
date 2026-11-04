import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';
import { 
  Upload, 
  X, 
  Plus, 
  Sparkles, 
  Loader2, 
  Check, 
  PackagePlus, 
  Palette,
  Wand2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { availableSizes, availableColors, availableMatieres } from '../constants/produit';

const Add = ({ token }) => {
  // --- ÉTATS FORMULAIRE ---
  const [images, setImages] = useState([null, null, null, null]);

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
  const [aiLoading, setAiLoading] = useState(false); // État de chargement pour l'IA
  const [tagsInput, setTagsInput] = useState('');

  const [alts, setAlts] = useState(['', '', '', '']);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Charger la liste des catégories depuis le serveur
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categorie`);
        if (response.data.success) {
          const list = response.data.data || response.data.categories || [];
          setCategoriesList(list);
          if (list.length > 0) {
            setCategorie(list[0]._id || list[0].id);
          }
        }
      } catch (error) {
        console.error("Erreur chargement catégories:", error.message);
      }
    };
    fetchCategories();
  }, []);

  // Gestion des images localement
  const handleImageChange = (index, file) => {
    const newImages = [...images];
    newImages[index] = file;
    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleAltChange = (index, value) => {
    const newAlts = [...alts];
    newAlts[index] = value;
    setAlts(newAlts);
  };

  // --- FONCTION D'ANALYSE IA (GEMINI) ---
  const handleAiAutoFill = async () => {
    const mainImage = images[0];
    if (!mainImage) {
      toast.warning("Veuillez d'abord ajouter une photo principale (Photo 1) pour que l'IA puisse l'analyser.");
      return;
    }

    setAiLoading(true);
    try {
      // Convertir l'image en Base64
      const reader = new FileReader();
      reader.readAsDataURL(mainImage);
      
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1];
        const mimeType = mainImage.type;

        // Appel vers la route backend qui gère Gemini
        const response = await axios.post(
          `${backendUrl}/api/produit/ai-analyze`,
          { imageBase64: base64String, mimeType },
          { headers: { token, Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          const data = response.data.product;
          
          // Remplissage automatique des champs du formulaire
          if (data.nom) setNom(data.nom);
          if (data.description) setDescription(data.description);
          if (data.prix) setPrix(data.prix.toString());
          if (data.tags) setTagsInput(data.tags);
          if (data.metaTitle) setMetaTitle(data.metaTitle);
          if (data.metaDescription) setMetaDescription(data.metaDescription);

          // Correspondance des couleurs si reconnues
          if (data.couleurs && Array.isArray(data.couleurs)) {
            const validColors = data.couleurs.filter(c => availableColors.includes(c));
            if (validColors.length > 0) setCouleurs(validColors);
          }

          toast.success("✨ Fiche produit générée avec succès par l'IA !");
        } else {
          toast.error("L'IA n'a pas pu analyser l'image.");
        }
        setAiLoading(false);
      };
    } catch (error) {
      console.error("Erreur IA Auto-fill:", error);
      toast.error(error.response?.data?.message || "Erreur lors de la communication avec l'IA.");
      setAiLoading(false);
    }
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

  // Envoi du formulaire au contrôleur backend `addproduit`
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!categorie) {
      toast.error("Veuillez sélectionner ou créer une catégorie !");
      return;
    }

    if (!images.some(img => img !== null)) {
      toast.error("Veuillez fournir au moins une photo pour le bijou.");
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("description", description);
      formData.append("prix", prix);
      if (stock !== '') formData.append("stock", stock);
      formData.append("categorie", categorie); 
      formData.append("matiere", matiere);
      formData.append("meilleurVente", meilleurVente ? "true" : "false");
      formData.append("tags", tagsInput);
      formData.append("metaTitle", metaTitle);
      formData.append("metaDescription", metaDescription);

      formData.append("sizes", JSON.stringify(sizes));
      formData.append("couleurs", JSON.stringify(couleurs));
      formData.append("alts", JSON.stringify(alts));

      images.forEach((img, idx) => {
        if (img) formData.append(`image${idx + 1}`, img);
      });

      const response = await axios.post(
        `${backendUrl}/api/produit/add`, 
        formData, 
        { headers: { token, Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("✨ Bijou ajouté avec succès au catalogue !");
        setNom(''); setDescription(''); setPrix(''); setStock('');
        setSizes([]); setCouleurs(['Doré']); setTagsInput('');
        setMeilleurVente(false); setImages([null, null, null, null]);
        setAlts(['', '', '', '']); setMetaTitle(''); setMetaDescription('');
      } else {
        toast.error(response.data.message || "Erreur lors de la création.");
      }
    } catch (error) {
      console.error("Erreur ajout produit:", error);
      toast.error(error.response?.data?.message || "Impossible de publier le produit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl font-sans text-stone-800">
      
      {/* En-tête */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold uppercase tracking-widest mb-1">
            <PackagePlus className="w-4 h-4" />
            <span>Atelier & Catalogue</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Ajouter un Nouveau Bijou
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Complétez les caractéristiques de la pièce ou laissez l'IA l'analyser pour vous.
          </p>
        </div>

        {/* BOUTON MAGIQUE IA */}
        <button
          type="button"
          onClick={handleAiAutoFill}
          disabled={aiLoading || !images[0]}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-900 hover:to-stone-900 text-white text-xs font-medium uppercase tracking-wider rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title={!images[0] ? "Ajoutez une photo principale d'abord" : "Remplir automatiquement via l'IA"}
        >
          {aiLoading ? (
            <>
              <Loader2 size={15} className="animate-spin text-amber-300" />
              <span>Analyse en cours...</span>
            </>
          ) : (
            <>
              <Wand2 size={15} className="text-amber-300" />
              <span>✨ Remplir avec l'IA</span>
            </>
          )}
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
            <span className="text-[11px] text-stone-400">La photo 1 sert de base à l'IA</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative">
                {img ? (
                  <div className="space-y-1.5">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-stone-200 group">
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 p-1 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full transition-colors shadow-md cursor-pointer"
                        title="Supprimer la photo"
                      >
                        <X size={14} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-amber-900/90 text-white text-[9px] font-medium tracking-wider uppercase rounded">
                          Couverture & IA
                        </span>
                      )}
                    </div>
                    <input
                      value={alts[index]}
                      onChange={(e) => handleAltChange(index, e.target.value)}
                      className="w-full border border-stone-200 bg-stone-50/30 rounded-lg px-2 py-1 text-[10px] outline-none focus:bg-white focus:border-stone-900 transition-all"
                      type="text"
                      placeholder={`Texte alt (SEO), ex: ${nom || 'Bijou'} vue ${index + 1}`}
                    />
                  </div>
                ) : (
                  <label
                    htmlFor={`image${index + 1}`}
                    className="w-full aspect-square border-2 border-dashed border-stone-200 hover:border-amber-700/60 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-all text-center p-2 group"
                  >
                    <div className="p-2.5 rounded-full bg-white border border-stone-200 group-hover:border-amber-600/40 text-stone-400 group-hover:text-amber-700 transition-all mb-1 shadow-xs">
                      <Plus size={16} />
                    </div>
                    <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-800">
                      {index === 0 ? "Photo principale *" : `Photo ${index + 1}`}
                    </span>
                    <input 
                      onChange={(e) => handleImageChange(index, e.target.files[0])} 
                      type="file" 
                      id={`image${index + 1}`} 
                      hidden 
                      accept="image/*" 
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* --- 2. INFORMATIONS PRINCIPALES --- */}
        <div className="space-y-5">
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
                placeholder="Optionnel"
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
              >
                {categoriesList.length === 0 ? (
                  <option value="">Aucune catégorie</option>
                ) : (
                  categoriesList.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.nom || cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* SAISIE DES TAGS */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Tags / Mots-clés SEO <span className="text-stone-400 font-normal">(séparés par des virgules)</span>
            </label>
            <input 
              value={tagsInput} 
              onChange={(e) => setTagsInput(e.target.value)} 
              className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all" 
              type="text" 
              placeholder="ex: collier, double rang, fermoir T, choker, doré" 
            />
            {tagsInput && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tagsInput.split(',').map((tag, idx) => tag.trim() && (
                  <span key={idx} className="bg-amber-900/5 text-amber-900 text-[11px] px-2.5 py-1 rounded-lg border border-amber-900/10 font-medium">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
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

          {/* Surcharges SEO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Titre SEO <span className="text-stone-400 font-normal normal-case">(optionnel)</span>
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
                Meta Description <span className="text-stone-400 font-normal normal-case">(optionnel)</span>
              </label>
              <input
                onChange={(e) => setMetaDescription(e.target.value)}
                value={metaDescription}
                maxLength={160}
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
                type="text"
                placeholder="Résumé accrocheur pour Google"
              />
              <span className="text-[10px] text-stone-400">{metaDescription.length}/160</span>
            </div>
          </div>
        </div>

        <hr className="border-stone-100" />

        {/* --- 3. COULEURS & TAILLES --- */}
        <div className="space-y-6">
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

          <div className="p-4 bg-stone-50/80 border border-stone-200/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100/60 text-amber-800 rounded-lg">
                <Sparkles size={16} />
              </div>
              <div>
                <label htmlFor="meilleurVente" className="text-xs font-semibold text-stone-900 cursor-pointer block">
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
              id="meilleurVente" 
              className="w-4 h-4 accent-amber-900 rounded cursor-pointer" 
            />
          </div>
        </div>

        {/* --- 4. ACTION --- */}
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 hover:bg-stone-950 text-white font-medium text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.99] disabled:bg-stone-400 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Publication en cours...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="text-amber-400" />
                <span>Enregistrer & Publier le Bijou</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Add;