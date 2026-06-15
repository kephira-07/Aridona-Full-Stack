import React, { useState, useEffect, useContext } from "react";
import { ShopContext } from '../context/ShopContext';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Titre from '../composant/Titre';
import ProduitItem from "../composant/ProduitItem";
import Categorybar from "../composant/Categorybar"; 
import axios from "axios";
import { backendUrl } from "../config";
import BoutonRetour from "../composant/BoutonRetour";

const Collection = () => {
    const { produits, recherche } = useContext(ShopContext);
    const location = useLocation();
    
    // Ajout de categoriesList pour alimenter le tiroir de filtres
    const [categoriesList, setCategoriesList] = useState([]); 
    const [showFilter, setShowFilter] = useState(false);
    const [filtreProduits, setFiltreProduits] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedMatieres, setSelectedMatieres] = useState([]);
    const [sortType, setSortType] = useState('reveler');

    // Charger les catégories pour le tiroir de filtres
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/categorie`);
                if (response.data.success) {
                    setCategoriesList(response.data.data);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des catégories dans Collection:", error.message);
            }
        };
        fetchCategories();
    }, []);

    // Intercepter la catégorie cliquée sur la Home Page
    useEffect(() => {
        if (location.state && location.state.initialCategory) {
            setSelectedCategories([location.state.initialCategory]);
            // Nettoie l'état pour éviter les conflits au rechargement ou retour arrière
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

   const toggleCategorie = (id) => {
  // Si la catégorie cliquée est déjà active, on la désactive (on repasse à "Tout voir")
  if (selectedCategories.includes(id)) {
    setSelectedCategories([]); // Vide le filtre
  } else {
    // Sinon, on remplace le tableau par un tableau contenant UNIQUEMENT le nouvel ID
    setSelectedCategories([id]); 
  }
};

    const toggleMatiere = (val) => {
        setSelectedMatieres(prev => 
            prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]
        );
    };

    // --- LOGIQUE DE FILTRAGE ET TRI ---
    useEffect(() => {
        if (!produits) return;
        let copie = produits.slice();

        if (recherche.trim()) {
            copie = copie.filter(item => (item.nom || item.name || "").toLowerCase().includes(recherche.toLowerCase()));
        }

        if (selectedCategories.length > 0) {
            copie = copie.filter(item => {
                const catId = item.categorie?._id || item.categorie;
                return selectedCategories.includes(catId);
            });
        }

        if (selectedMatieres.length > 0) {
            copie = copie.filter(item => selectedMatieres.includes(item.matiere));
        }

        if (sortType === 'prix-asc') {
            copie.sort((a, b) => (a.prix || a.price) - (b.prix || b.price));
        } else if (sortType === 'prix-desc') {
            copie.sort((a, b) => (b.prix || b.price) - (a.prix || a.price));
        }

        setFiltreProduits(copie);
    }, [selectedCategories, selectedMatieres, recherche, sortType, produits]);

    return (
        <div className="min-h-screen bg-white mt-50">
            
            {/* BARRE DE CATÉGORIES INTELLIGENTE */}
            <Categorybar 
                selectedCategories={selectedCategories} 
                toggleCategorie={toggleCategorie}
                clearCategories={() => setSelectedCategories([])}
            />
            <BoutonRetour />

            <div className="max-w-7xl mx-auto px-4 mt-3">
                
                {/* BARRE D'OUTILS */}
                <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-gray-100">
                    <div className="">
                        <Titre text1={'Notre'} text2={'Collection'} />
                    </div>
                    
                    <button 
                        onClick={() => setShowFilter(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold uppercase tracking-wider text-slate-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
                        Filtres  {(selectedCategories.length + selectedMatieres.length) > 0 && `(${selectedCategories.length + selectedMatieres.length})`}
                    </button>

                    {/* Sélecteur de Tri */}
                    <div className="relative flex items-center border border-gray-200 rounded-xl px-1 py-1 bg-gray-50 text-xs font-medium text-slate-700">
                        <select 
                            onChange={(e) => setSortType(e.target.value)} 
                            className="appearance-none bg-transparent  outline-none cursor-pointer font-semibold"
                        >
                            <option value="reveler">Pertinence</option>
                            <option value="prix-asc">Prix : Croissant</option>
                            <option value="prix-desc">Prix : Décroissant</option>
                        </select>
                        <ChevronDown className="h-3 w-3 absolute right-2.5 text-gray-700 pointer-events-none" />
                    </div>
                </div>

                {/* GRILLE PRODUITS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-8">
                    {filtreProduits.map((item, index) => (
                    <ProduitItem 
                            key={index} 
                            id={item._id} 
                            slug={item.slug} // 🌟 N'oublie surtout pas cette ligne !
                            nom={item.nom} 
                            prix={item.prix} 
                            image={item.image} 
                        />
                    ))}
                </div>

                {filtreProduits.length === 0 && (
                    <div className="text-center py-20 text-gray-400 text-sm italic">
                        Aucun bijou ne correspond à vos critères de recherche.
                    </div>
                )}
            </div>

            {/* --- TIROIR DE FILTRES SLIDEOVER (MOBILE FIRST) --- */}
            <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${showFilter ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div onClick={() => setShowFilter(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
                
                <div className={`absolute bottom-0 left-0 right-0 max-h-[85vh] md:max-h-full md:w-96 md:top-0 md:left-auto bg-white rounded-t-3xl md:rounded-t-none md:rounded-l-3xl shadow-2xl flex flex-col transition-transform duration-300 transform ${
                    showFilter ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'
                }`}>
                    
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold tracking-widest uppercase text-slate-800">Ajuster la sélection</h3>
                        <button onClick={() => setShowFilter(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-slate-700 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-8 flex-1">
                        {/* Section Catégories réparée */}
                        <div>
                            <h4 className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-4">Par Catégories</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {categoriesList.map((cat) => {
                                    const isChecked = selectedCategories.includes(cat._id);
                                    return (
                                        <button
                                            key={cat._id}
                                            onClick={() => toggleCategorie(cat._id)}
                                            className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-left transition-all ${
                                                isChecked
                                                ? 'bg-amber-50 border-amber-500 text-amber-800 font-semibold'
                                                : 'bg-white border-gray-200 text-slate-600'
                                            }`}
                                        >
                                            {cat.nom}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Section Matières */}
                        <div>
                            <h4 className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-4">Par Matière</h4>
                            <div className="flex flex-col gap-3">
                                {[
                                    { id: "Dore", label: "Doré à l'Or Fin" },
                                    { id: "Argenter", label: "Argenté Scintillant" },
                                    { id: "Perle", label: "Perles d'Eau Douce" }
                                ].map((mat) => {
                                    const isChecked = selectedMatieres.includes(mat.id);
                                    return (
                                        <label key={mat.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
                                            <span className="text-xs font-medium text-slate-700">{mat.label}</span>
                                            <input 
                                                type="checkbox" 
                                                checked={isChecked}
                                                onChange={() => toggleMatiere(mat.id)}
                                                className="w-4 h-4 rounded-sm accent-amber-600 cursor-pointer" 
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-t-2xl flex gap-3">
                        <button 
                            onClick={() => { setSelectedCategories([]); setSelectedMatieres([]); }}
                            className="flex-1 py-3 border border-gray-200 bg-white rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Réinitialiser
                        </button>
                        <button 
                            onClick={() => setShowFilter(false)}
                            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-semibold tracking-wide shadow-md hover:bg-slate-800 transition-colors"
                        >
                            Voir les résultats
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Collection;