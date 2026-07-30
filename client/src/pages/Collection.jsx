import React, { useState, useEffect, useContext } from "react";
import { ShopContext } from '../context/ShopContext';
import { useLocation } from 'react-router-dom';
import { SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import Titre from '../composant/Titre';
import ProduitItem from "../composant/ProduitItem";
import Categorybar from "../composant/Categorybar"; 
import axios from "axios";
import { backendUrl } from "../config";
import BoutonRetour from "../composant/BoutonRetour";
import { Helmet } from 'react-helmet-async';

// --- DICTIONNAIRE TEXTES OPTIMISÉS SEO PAR CATÉGORIE ---
const SEO_TEXTS = {
    default: {
        title: "Bijoux en Acier Inoxydable",
        description: "Découvrez notre collection complète de bijoux en acier inoxydable pour femme. Des créations waterproof, hypoallergéniques et conçues pour résister au temps sans perdre leur éclat."
    },
    bague: {
        title: "Bagues en Acier Inoxydable",
        description: "Explorez nos bagues en acier inoxydable dorées et argentées. Des modèles ajustables, résistants à l'eau et hypoallergéniques à porter seuls ou en accumulation."
    },
    collier: {
        title: "Colliers & Ras de Cou en Acier Inoxydable",
        description: "Sublimez votre décolleté avec nos colliers en acier inoxydable. Ras de cou, chaînes et pendentifs waterproof qui ne noircissent pas au contact de l'eau."
    },
    bracelet: {
        title: "Bracelets & Joncs en Acier Inoxydable",
        description: "Trouvez le bracelet en acier inoxydable parfait : joncs rigides, chaînettes dorées et maillons tendance conçus pour résister à votre quotidien."
    },
    boucle: {
        title: "Boucles d'Oreilles en Acier Inoxydable",
        description: "Parcourez notre sélection de créoles, puces et pendantes en acier inoxydable. Des bijoux légers et doux pour les peaux sensibles."
    },
    Armlet:{
        title: "Bracelets de Bras en Acier Inoxydable",
        description: "Découvrez nos bracelets de bras en acier inoxydable, parfaits pour un look audacieux et élégant. Conçus pour durer et résister à l'eau."
    },
    chainedelunnette:{
        title: "Chaînes de Lunettes en Acier Inoxydable",
        description: "Ajoutez une touche de style à vos lunettes avec nos chaînes en acier inoxydable. Élégantes, durables et résistantes à l'eau."
    },
    parure: {
        title: "Parures & Ensembles de Bijoux en Acier Inoxydable",
        description: "Découvrez nos parures et ensembles de bijoux 2, 3 ou 4 pièces en acier inoxydable. Colliers, bagues, bracelets et boucles d'oreilles assortis, waterproof et résistant à l'eau."
    }
};

const Collection = () => {
    const { produits, recherche } = useContext(ShopContext);
    const location = useLocation();
    
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

    // Intercepter la catégorie cliquée depuis la Home Page (Categorybar → id direct)
    // ou depuis la barre de recherche (BarRecherche → slug, à résoudre une fois les
    // catégories chargées).
    useEffect(() => {
        if (!location.state) return;

        if (location.state.initialCategory) {
            setSelectedCategories([location.state.initialCategory]);
            window.history.replaceState({}, document.title);
            return;
        }

        if (location.state.initialCategorySlug && categoriesList.length > 0) {
            const cat = categoriesList.find((c) => c.slug === location.state.initialCategorySlug);
            if (cat) setSelectedCategories([cat._id]);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, categoriesList]);

    const toggleCategorie = (id) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories([]); 
        } else {
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

    // --- FONCTION DE RÉCUPÉRATION DU TEXTE SEO DYNAMIQUE ---
    const getSeoContent = () => {
        if (selectedCategories.length === 1) {
            const currentCatObj = categoriesList.find(c => c._id === selectedCategories[0]);
            const catName = (currentCatObj?.nom || "").toLowerCase();

            if (catName.includes("bague")) return SEO_TEXTS.bague;
            if (catName.includes("collier")) return SEO_TEXTS.collier;
            if (catName.includes("bracelet")) return SEO_TEXTS.bracelet;
            if (catName.includes("boucle") || catName.includes("oreille")) return SEO_TEXTS.boucle;
            if (catName.includes("armlet")) return SEO_TEXTS.Armlet;
            if (catName.includes("chaine") && catName.includes("lunette")) return SEO_TEXTS.chainedelunnette;
            if (catName.includes("parure") || catName.includes("ensemble")) return SEO_TEXTS.parure;

            if (currentCatObj?.nom) {
                return {
                    title: `${currentCatObj.nom} en Acier Inoxydable`,
                    description: `Découvrez notre gamme de ${currentCatObj.nom.toLowerCase()} en acier inoxydable. Des bijoux waterproof, résistants et hypoallergéniques pensés pour durer.`
                };
            }
        }
        return SEO_TEXTS.default;
    };

    const currentSeo = getSeoContent();

    // Compteur de filtres actifs
    const activeFiltersCount = selectedCategories.length + selectedMatieres.length + (sortType !== 'reveler' ? 1 : 0);

    return (
        <div className="min-h-screen bg-white mt-22 md:mt-24 ">
            <Helmet>
                <title>{`${currentSeo.title} | ARIDONA Bijoux`}</title>
                <meta name="description" content={currentSeo.description} />
                <meta property="og:title" content={currentSeo.title} />
                <meta property="og:description" content={currentSeo.description} />
                <meta property="og:type" content="website" />
            </Helmet>
            
            {/* BARRE DE CATÉGORIES INTELLIGENTE */}
            <Categorybar 
                selectedCategories={selectedCategories} 
                toggleCategorie={toggleCategorie}
                clearCategories={() => setSelectedCategories([])}
            />
            <BoutonRetour />

            <div className="max-w-7xl mx-auto px-4 mt-3">
                
                {/* BLOC TEXTE DYNAMIQUE OPTIMISÉ POUR LE SEO */}
                <div className="mb-6">
                    <h1 className="text-xl sm:text-2xl font-serif text-slate-800 font-medium mb-1">
                        {currentSeo.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 max-w-3xl leading-relaxed">
                        {currentSeo.description}
                    </p>
                </div>

                {/* BARRE D'OUTILS UNIQUE */}
                <div className="flex items-center justify-between gap-4 mb-6 pb-2 border-b border-gray-100">
                    <div>
                        <Titre text1={'Notre'} text2={'Collection'} />
                    </div>
                    
                    {/* BOUTON UNIQUE FILTRES ET TRI */}
                    <button 
                        onClick={() => setShowFilter(true)}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-xs font-semibold uppercase tracking-wider text-slate-700 bg-gray-50 hover:bg-gray-100 transition-colors rounded-sm"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
                        <span>Filtres & Tri</span>
                        {activeFiltersCount > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-amber-600 text-white text-[10px] rounded-full font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* GRILLE PRODUITS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-8">
                    {filtreProduits.map((item, index) => (
                        <ProduitItem 
                            key={index} 
                            id={item._id} 
                            slug={item.slug}
                            nom={item.nom} 
                            prix={item.prix}
                            image={item.image}
                            enStock={item.enStock}
                        />
                    ))}
                </div>

                {filtreProduits.length === 0 && (
                    <div className="text-center py-20 text-gray-400 text-sm italic">
                        Aucun bijou ne correspond à vos critères de recherche.
                    </div>
                )}
            </div>

            {/* --- TIROIR UNIFIÉ DE FILTRES ET TRI SLIDEOVER --- */}
            <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${showFilter ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div onClick={() => setShowFilter(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
                
                <div className={`absolute bottom-0 left-0 right-0 max-h-[85vh] md:max-h-full md:w-96 md:top-0 md:left-auto bg-white rounded-t-3xl md:rounded-t-none md:rounded-l-3xl shadow-2xl flex flex-col transition-transform duration-300 transform ${
                    showFilter ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'
                }`}>
                    
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold tracking-widest uppercase text-slate-800">Filtres & Tri</h3>
                        <button onClick={() => setShowFilter(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-slate-700 transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto space-y-8 flex-1">
                        
                        {/* SECTION TRI */}
                        <div>
                            <h4 className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-3 flex items-center gap-1.5">
                                <ArrowUpDown className="h-3.5 w-3.5" /> Trier Par
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { id: 'reveler', label: 'Pertinence' },
                                    { id: 'prix-asc', label: 'Prix : du - cher au + cher' },
                                    { id: 'prix-desc', label: 'Prix : du + cher au - cher' },
                                ].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSortType(option.id)}
                                        className={`py-2.5 px-3 border text-xs font-medium text-left transition-all ${
                                            sortType === option.id
                                                ? 'bg-amber-50 border-amber-500 text-amber-800 font-semibold'
                                                : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* SECTION CATÉGORIES */}
                        <div>
                            <h4 className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-3">Par Catégories</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {categoriesList.map((cat) => {
                                    const isChecked = selectedCategories.includes(cat._id);
                                    return (
                                        <button
                                            key={cat._id}
                                            onClick={() => toggleCategorie(cat._id)}
                                            className={`py-2.5 px-3 border text-xs font-medium text-left transition-all ${
                                                isChecked
                                                ? 'bg-amber-50 border-amber-500 text-amber-800 font-semibold'
                                                : 'bg-white border-gray-200 text-slate-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {cat.nom}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SECTION MATIÈRES */}
                        <div>
                            <h4 className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-3">Par Matière</h4>
                            <div className="flex flex-col gap-2">
                                {[
                                    { id: "Dore", label: "Doré à l'Or Fin" },
                                    { id: "Argenter", label: "Argenté Scintillant" },
                                    { id: "Perle", label: "Perles d'Eau Douce" }
                                ].map((mat) => {
                                    const isChecked = selectedMatieres.includes(mat.id);
                                    return (
                                        <label key={mat.id} className="flex items-center justify-between p-3 border border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-gray-50 transition-colors">
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

                    {/* PIED DU TIROIR */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-t-2xl flex gap-3">
                        <button 
                            onClick={() => { 
                                setSelectedCategories([]); 
                                setSelectedMatieres([]); 
                                setSortType('reveler');
                            }}
                            className="flex-1 py-3 border border-gray-200 bg-white text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            Réinitialiser
                        </button>
                        <button 
                            onClick={() => setShowFilter(false)}
                            className="flex-1 py-3 bg-slate-900 text-white text-xs font-semibold tracking-wide shadow-md hover:bg-slate-800 transition-colors"
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