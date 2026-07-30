import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext'; 
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from "lucide-react"; 

const ProduitItem = ({ id, slug, image, nom, prix, enStock }) => {
    const { monnaie, ajouterPanier, favoris, toggleFavori } = useContext(ShopContext);
    const [isAdded, setIsAdded] = useState(false);

    const isFavorite = favoris ? favoris.includes(id) : false;

    // --- SÉCURISATION DU FORMAT IMAGE (Gère Strings & Objets MongoDB) ---
    const getFirstImage = (imgData) => {
        const first = Array.isArray(imgData) ? imgData[0] : imgData;
        if (!first) return { url: 'https://placehold.co/600x600?text=Aridona+Bijoux', alt: '' };
        return typeof first === 'object' && first?.url
            ? { url: first.url, alt: first.alt || '' }
            : { url: first, alt: '' };
    };

    const { url: imageUrl, alt: imageAlt } = getFirstImage(image);
    const itemSlug = slug || id;

    const handleFavoriteClick = (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        if (toggleFavori) toggleFavori(id);
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (ajouterPanier && !isAdded) {
            ajouterPanier(id, "Unique"); 
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
        }
    };

    // --- JSON-LD OPTIMISÉ POUR GOOGLE ---
    const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": nom || "Création Aridona Bijoux",
        "image": imageUrl,
        "sku": String(id || ''),
        "brand": {
            "@type": "Brand",
            "name": "Aridona Bijoux"
        },
        "offers": {
            "@type": "Offer",
            "url": typeof window !== 'undefined' ? `${window.location.origin}/produit/${itemSlug}` : undefined,
            "priceCurrency": monnaie === "FCFA" ? "XOF" : "EUR",
            "price": Number(prix) || 0,
            "availability": enStock === false
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock"
        }
    };

    return (
        <article className="h-full">
            <script type="application/ld+json">
                {JSON.stringify(productSchema)}
            </script>

            <Link 
                className="text-stone-800 cursor-pointer group flex flex-col h-full bg-white hover:shadow-lg transition-all duration-300 overflow-hidden border border-stone-100" 
                to={`/produit/${itemSlug}`}
            >
                <div className="relative overflow-hidden aspect-square bg-stone-50"> 
                    <img 
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                        src={imageUrl}
                        alt={imageAlt || `${nom || 'Bijou'} - Aridona Bijoux`}
                        loading="lazy"
                        width="300"
                        height="300"
                    />
                    
                    {/* Bouton Favoris */}
                    <button 
                        type="button"
                        aria-label="Ajouter aux favoris"
                        onClick={handleFavoriteClick} 
                        className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 shadow-xs border backdrop-blur-md z-10 ${
                            isFavorite 
                                ? 'bg-rose-50/90 border-rose-200 text-rose-600 scale-105' 
                                : 'bg-white/80 border-stone-100 text-stone-500 hover:text-amber-900 hover:bg-white md:opacity-0 md:group-hover:opacity-100'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>

                    {/* Bouton Ajout Rapide Mobile */}
                    <button
                        type="button"
                        aria-label="Ajouter au panier"
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={`md:hidden absolute bottom-2 right-2 p-2.5 rounded-full shadow-md z-10 transition-all active:scale-95 ${
                            isAdded ? 'bg-emerald-700 text-white' : 'bg-amber-900/90 text-white backdrop-blur-xs'
                        }`}
                    >
                        {isAdded ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    </button>

                    {/* Bouton Ajout Rapide Desktop */}
                    <div className="hidden md:block absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 ease-out z-10">
                        <button 
                            type="button"
                            onClick={handleAddToCart} 
                            disabled={isAdded}
                            className={`w-full py-2.5 text-xs font-semibold uppercase tracking-widest shadow-md flex items-center justify-center transition-colors ${
                                isAdded 
                                    ? 'bg-emerald-700 text-white' 
                                    : 'bg-white/95 backdrop-blur-md text-stone-900 hover:bg-amber-900 hover:text-white'
                            }`}
                        >
                            <span className="flex items-center gap-2 pointer-events-none">
                                {isAdded ? (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Ajouté</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        <span>Ajouter</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
                
                {/* Informations Produit */}
                <div className="flex flex-col flex-1 p-3 justify-between">
                    <div>
                        <h3 className="text-xs sm:text-sm font-medium text-stone-900 line-clamp-1 group-hover:text-amber-900 transition-colors">
                            {nom || "Création unique"}
                        </h3>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-amber-950 mt-1.5">
                        {Number(prix || 0).toLocaleString()} {monnaie || 'FCFA'}
                    </p>
                </div>
            </Link>
        </article>
    );
};

export default ProduitItem;