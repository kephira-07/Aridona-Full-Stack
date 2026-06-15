import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';

const Add = ({ token }) => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState('');
  
  const [categorie, setCategorie] = useState(''); 
  const [categoriesList, setCategoriesList] = useState([]);

  const [matiere, setMatiere] = useState('Or Jaune');
  const [sizes, setSizes] = useState([]);
  const [meilleurVente, setMeilleurVente] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableSizes = ["50", "52", "54", "56", "58", "Unique"];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categorie`);
        if (response.data.success) {
          setCategoriesList(response.data.data);
          if (response.data.data.length > 0) {
            setCategorie(response.data.data[0]._id);
          }
        }
      } catch (error) {
        console.error("Erreur chargement catégories:", error.message);
      }
    };
    fetchCategories();
  }, []);

  const handleSizeToggle = (size) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!categorie) return alert("Veuillez d'abord créer une catégorie !");
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("description", description);
      formData.append("prix", prix);
      formData.append("categorie", categorie); 
      formData.append("matiere", matiere);
      
      // 🌟 SÉCURITÉ : On force le format string pour correspondre au === "true" du backend
      formData.append("meilleurVente", meilleurVente ? "true" : "false");
      
      formData.append("sizes", JSON.stringify(sizes));

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        `${backendUrl}/api/produit/add`, 
        formData, 
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          } 
        }
      );

      if (response.data.success) {
        alert("Bijou ajouté à la collection !");
        setNom(''); setDescription(''); setPrix(''); setSizes([]); setMeilleurVente(false);
        setImage1(null); setImage2(null); setImage3(null); setImage4(null);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-5 max-w-2xl bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      
      {/* Zone Images */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Photos du bijou (4 max)</p>
        <div className="flex gap-3">
          {[image1, image2, image3, image4].map((img, index) => {
            const setImg = [setImage1, setImage2, setImage3, setImage4][index];
            return (
              <label key={index} htmlFor={`image${index+1}`} className="w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden">
                {img ? (
                  <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xl">+</span>
                )}
                <input onChange={(e) => setImg(e.target.files[0])} type="file" id={`image${index+1}`} hidden accept="image/*" />
              </label>
            );
          })}
        </div>
      </div>

      {/* Nom */}
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la création</label>
        <input onChange={(e) => setNom(e.target.value)} value={nom} className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:border-slate-900 text-sm" type="text" placeholder="Ex: Alliance Éternité" required />
      </div>

      {/* Description */}
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-1">Description & Détails</label>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:border-slate-900 text-sm" placeholder="Sertissage, histoire de la pièce..." rows={3} required />
      </div>

      {/* Prix / Catégorie / Matière */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Prix Fcf</label>
          <input onChange={(e) => setPrix(e.target.value)} value={prix} className="w-full border border-gray-200 p-2.5 rounded-xl text-sm" type="number" placeholder="450" required />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
          <select onChange={(e) => setCategorie(e.target.value)} value={categorie} className="w-full border border-gray-200 p-2.5 rounded-xl bg-white text-sm">
            {categoriesList.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Matière</label>
          <select onChange={(e) => setMatiere(e.target.value)} value={matiere} className="w-full border border-gray-200 p-2.5 rounded-xl bg-white text-sm">
            <option value="Or Jaune">Or Jaune 18k</option>
            <option value="Or Blanc">Or Blanc</option>
            <option value="Argent 925">Argent 925</option>
            <option value="Plaqué Or">Plaqué Or</option>
          </select>
        </div>
      </div>

      {/* Tailles */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-1.5">Tailles disponibles</p>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map(size => (
            <button 
              key={size} 
              type="button"
              onClick={() => handleSizeToggle(size)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${sizes.includes(size) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* En vedette */}
      <div className="flex items-center gap-2 mt-1">
        <input onChange={() => setMeilleurVente(prev => !prev)} checked={meilleurVente} type="checkbox" id="meilleurVente" className="w-4 h-4 accent-slate-900 cursor-pointer" />
        <label htmlFor="meilleurVente" className="text-sm font-medium text-slate-700 cursor-pointer select-none">Mettre en valeur (Meilleure Vente)</label>
      </div>

      <button type="submit" disabled={loading} className="mt-2 px-6 py-3 bg-slate-950 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:bg-slate-400">
        {loading ? 'Création en cours...' : 'Publier le produit'}
        
      </button>
      
    </form>
  );
};

export default Add;