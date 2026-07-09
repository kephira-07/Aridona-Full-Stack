import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext'; 
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from "lucide-react"; 


const ProduitItem = ({ id, slug, image, nom, prix }) => {
    // On récupère les outils du contexte global
    const { monnaie, ajouterPanier, favoris, toggleFavori } = useContext(ShopContext);
    
    // Petit état local pour animer le bouton temporairement après l'ajout
    const [isAdded, setIsAdded] = useState(false);

    // Vérification dynamique des favoris
    const isFavorite = favoris ? favoris.includes(id) : false;

    const handleFavoriteClick = (e) => {
        e.preventDefault(); 
        if (toggleFavori) {
            toggleFavori(id);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        if (ajouterPanier) {
            // "Standard" ou taille par défaut pour la liste globale
            ajouterPanier(id, "Standard"); 

            // 🎯 EFFET VISUEL : Le bouton se transforme brièvement
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
        }
    };

    return (
        <Link 
            className='text-gray-700 cursor-pointer group flex flex-col h-full bg-white  hover:bg-gray-100  border border-transparent hover:border-stone-100 hover:shadow-xl transition-all duration-500' 
            to={`/produit/${slug || id}`}
        >
            <div className='relative overflow-hidden aspect-square bg-stone-50 border border-stone-100/60'> 
                <img 
                    className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105' 
                    src={Array.isArray(image) ? image[0] : image} 
                    alt={nom} 
                />
                
                {/* 🌟 Bouton Favoris : Miniature sur mobile, taille normale sur desktop */}
                <button 
                    onClick={handleFavoriteClick} 
                    className={`absolute p-1.5 top-2 right-2 md:top-3 md:right-3 md:p-2.5 rounded-full transition-all duration-300 shadow-xs border focus:outline-none backdrop-blur-md
                        ${isFavorite 
                            ? 'bg-red-50/90 border-red-200 text-amber-700 scale-105 md:scale-110' 
                            : 'bg-white/80 border-stone-100 text-stone-400 hover:text-amber-700 hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0'
                        }`}
                >
                    <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isFavorite ? 'fill-amber-700' : ''}`} />
                </button>

                {/* 🌟 Bouton d'ajout : Totalement masqué sur mobile (hidden) et visible sur desktop (md:block) */}
                <div className="hidden md:block absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out">
                    <button 
                        onClick={handleAddToCart} 
                        disabled={isAdded}
                        className={`w-full py-3 text-xs font-semibold  transition-all duration-300 uppercase tracking-widest shadow-md flex items-center justify-center gap-2
                            ${isAdded 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-white/95 backdrop-blur-md text-stone-900 hover:bg-amber-900 hover:text-white'
                            }`}
                    >
                        {isAdded ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                Ajouté
                            </>
                        ) : (
                            <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                Ajouter
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Détails textuels du bijou */}
            <div className="flex flex-col flex-1 pt-3 pb-1 px-1 justify-between">
                <div>
                    <p className='text-l font-medium text-black font- font-dmsans
                     tracking-tight line-clamp-1 group-hover:text-stone-600 transition-colors duration-300'>
                        {nom || "Création unique"}
                    </p>
                </div>
                <p className='text-sm font-dmsans text-stone-900 mt-2 italic'>
                    {prix?.toLocaleString()} {monnaie}
                </p>
            </div>
        </Link>
    );
};

export default ProduitItem;