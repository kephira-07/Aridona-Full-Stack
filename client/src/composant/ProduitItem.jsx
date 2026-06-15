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
            className='text-gray-700 cursor-pointer group flex flex-col h-full bg-white rounded-2xl p-2 border border-transparent hover:border-stone-100 hover:shadow-xl transition-all duration-500' 
            to={`/produit/${slug || id}`}
        >
            <div className='relative overflow-hidden rounded-xl aspect-square bg-stone-50 border border-stone-100/60'> 
                <img 
                    className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105' 
                    src={Array.isArray(image) ? image[0] : image} 
                    alt={nom} 
                />
                
                {/* Bouton Favoris connecté au contexte */}
                <button 
                    onClick={handleFavoriteClick} 
                    className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 shadow-sm border focus:outline-none backdrop-blur-md
                        ${isFavorite 
                            ? 'bg-red-50/90 border-red-200 text-red-500 scale-110' 
                            : 'bg-white/80 border-stone-100 text-stone-400 hover:text-red-500 hover:bg-white md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0'
                        }`}
                >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500' : ''}`} />
                </button>

                {/* Bouton d'ajout dynamique */}
                <div className="absolute inset-x-0 bottom-0 p-4 md:opacity-0 md:group-hover:opacity-100 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-300 ease-out">
                    <button 
                        onClick={handleAddToCart} 
                        disabled={isAdded}
                        className={`w-full py-3 text-xs font-semibold rounded-xl transition-all duration-300 uppercase tracking-widest shadow-md flex items-center justify-center gap-2
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
                    <p className='text-sm font-medium text-stone-800 font-serif tracking-tight line-clamp-1 group-hover:text-stone-600 transition-colors duration-300'>
                        {nom || "Création unique"}
                    </p>
                    <p className='text-xs text-stone-400 mt-0.5 font-light italic'>Arilona Luxury</p>
                </div>
                <p className='text-sm font-semibold text-stone-900 mt-2 font-mono'>
                    {prix?.toLocaleString()} {monnaie}
                </p>
            </div>
        </Link>
    );
};

export default ProduitItem;