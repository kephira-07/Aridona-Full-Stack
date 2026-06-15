import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendUrl } from '../config';

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Éléments du formulaire
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  
  // 🛠️ FIX 1 : Initialisation dynamique des catégories (au lieu des textes en dur)
  const [categorie, setCategorie] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);

  const [matiere, setMatiere] = useState('Or Jaune');
  const [sizes, setSizes] = useState([]);
  const [meilleurVente, setMeilleurVente] = useState(false);
  
  // Gestion des images
  const [existingImages, setExistingImages] = useState([]);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const availableSizes = ["50", "52", "54", "56", "58", "Unique"];

  // 1. Charger les catégories et les données du bijou au démarrage
  useEffect(() => {
    const fetchCategoriesAndProduct = async () => {
      try {
        // A. On récupère d'abord les vraies catégories
        const catResponse = await axios.get(`${backendUrl}/api/categorie`);
        if (catResponse.data.success) {
          setCategoriesList(catResponse.data.data);
        }

        // B. On récupère les détails du produit
        const prodResponse = await axios.get(`${backendUrl}/api/produit/single/${id}`);
        if (prodResponse.data.success) {
          const p = prodResponse.data.produit;
          setNom(p.nom);
          setDescription(p.description);
          setPrix(p.prix);
          
          // Si la catégorie est "populée" par le backend (objet), on extrait son _id
          setCategorie(p.categorie && typeof p.categorie === 'object' ? p.categorie._id : p.categorie);
          
          setMatiere(p.matiere);
          setSizes(p.sizes || []);
          setMeilleurVente(p.meilleurVente);
          setExistingImages(p.image || []);
        }
      } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement des informations du composant.");
      }
    };

    if (id) fetchCategoriesAndProduct();
  }, [id]);

  const handleSizeToggle = (size) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  // 2. Envoyer les modifications au serveur
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("description", description);
      formData.append("prix", prix);
      formData.append("categorie", categorie);
      formData.append("matiere", matiere);
      formData.append("meilleurVente", meilleurVente);
      formData.append("sizes", JSON.stringify(sizes));

      // On envoie aussi la liste des images actuelles pour que le backend sache ce qu'on garde
      formData.append("existingImages", JSON.stringify(existingImages));

      // Fichiers d'images modifiés
      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.put(
        `${backendUrl}/api/produit/update/${id}`, 
        formData, 
        { 
          headers: { 
            token,
            "Content-Type": "multipart/form-data" // 🛠️ Sécurité pour Axios
          } 
        }
      );

      if (response.data.success) {
        alert("Bijou mis à jour avec succès ! ✨");
        navigate('/list');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-5 max-w-2xl bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Modifier la création</h2>
        <p className="text-xs text-gray-400 mt-0.5">Ajustez les détails de votre bijou premium</p>
      </div>
      
      {/* Visualisation / Remplacement des Photos */}
      <div className="w-full">
        <p className="text-xs font-semibold text-slate-700 mb-2">Photos du bijou (Cliquez sur une case pour la remplacer)</p>
        <div className="flex gap-3">
          {[image1, image2, image3, image4].map((img, index) => {
            const setImg = [setImage1, setImage2, setImage3, setImage4][index];
            return (
              <label key={index} htmlFor={`edit-image${index+1}`} className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 relative overflow-hidden transition-all">
                {img ? (
                  <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                ) : existingImages[index] ? (
                  <img src={existingImages[index]} alt="actuelle" className="w-full h-full object-cover opacity-90" />
                ) : (
                  <span className="text-gray-400 text-xl">+</span>
                )}
                <input onChange={(e) => setImg(e.target.files[0])} type="file" id={`edit-image${index+1}`} hidden accept="image/*" />
              </label>
            );
          })}
        </div>
      </div>

      <div className="w-full">
        <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de la pièce</label>
        <input onChange={(e) => setNom(e.target.value)} value={nom} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-black" type="text" required />
      </div>

      <div className="w-full">
        <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Caractéristiques</label>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-black" rows={3} required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Prix public (Fcf)</label>
          <input onChange={(e) => setPrix(e.target.value)} value={prix} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm outline-none focus:border-black" type="number" required />
        </div>
        
        {/* 🛠️ FIX 2 : Liste déroulante des catégories branchée sur la BDD */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Catégorie</label>
          <select onChange={(e) => setCategorie(e.target.value)} value={categorie} className="w-full border border-gray-200 p-2.5 rounded-xl bg-white text-sm outline-none focus:border-black cursor-pointer">
            {categoriesList.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Métal précieux</label>
          <select onChange={(e) => setMatiere(e.target.value)} value={matiere} className="w-full border border-gray-200 p-2.5 rounded-xl bg-white text-sm outline-none focus:border-black cursor-pointer">
            <option value="Or Jaune">Or Jaune 18k</option>
            <option value="Or Blanc">Or Blanc</option>
            <option value="Argent 925">Argent 925</option>
            <option value="Plaqué Or">Plaqué Or</option>
          </select>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-700 mb-2">Tailles disponibles</p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map(size => (
            <button key={size} type="button" onClick={() => handleSizeToggle(size)} className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${sizes.includes(size) ? 'bg-slate-950 text-white border-slate-950 font-semibold shadow-sm' : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 py-1">
        <input onChange={() => setMeilleurVente(prev => !prev)} checked={meilleurVente} type="checkbox" id="edit-meilleurVente" className="w-4 h-4 accent-slate-950 cursor-pointer" />
        <label htmlFor="edit-meilleurVente" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">Mettre en avant (Coup de cœur boutique)</label>
      </div>

      <div className="flex gap-3 mt-2 w-full sm:w-auto">
        <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-slate-950 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:bg-slate-400 uppercase tracking-wider">
          {loading ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
        <button type="button" onClick={() => navigate('/list')} className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-wider">
          Annuler
        </button>
      </div>
    </form>
  );
};

export default Edit;