import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext'; 
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from "lucide-react"; 

const ProduitItem = ({ id, slug, image, nom, prix, enStock }) => {
    const { monnaie, ajouterPanier, favoris, toggleFavori } = useContext(ShopContext);
    const [isAdded, setIsAdded] = useState(false);

    const isFavorite = favoris ? favoris.includes(id) : false;
    const badgeText = enStock === false ? 'Épuisé' : 'Collection';

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
                className="text-stone-800 cursor-pointer group flex flex-col h-full bg-[#fcfaf7] hover:bg-white transition-all duration-300 overflow-hidden border border-stone-200/80 rounded-[24px] shadow-[0_10px_30px_rgba(60,43,32,0.04)] hover:shadow-[0_18px_40px_rgba(60,43,32,0.08)]" 
                to={`/produit/${itemSlug}`}
            >
                <div className="relative overflow-hidden aspect-[4/5] bg-stone-100 rounded-t-[24px]"> 
                    <img 
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" 
                        src={imageUrl}
                        alt={imageAlt || `${nom || 'Bijou'} - Aridona Bijoux`}
                        loading="lazy"
                        width="300"
                        height="300"
                    />

                    <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-700 backdrop-blur-sm">
                            {badgeText}
                        </span>
                        <button 
                            type="button"
                            aria-label="Ajouter aux favoris"
                            onClick={handleFavoriteClick} 
                            className={`p-2 rounded-full transition-all duration-300 border backdrop-blur-md z-10 ${
                                isFavorite 
                                    ? 'bg-rose-50/90 border-rose-200 text-rose-600 scale-105' 
                                    : 'bg-white/80 border-white/80 text-stone-600 hover:text-amber-900 hover:bg-white'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1e1a17]/65 via-[#1e1a17]/10 to-transparent p-3">
                        <div className="flex items-center justify-between gap-2 text-white/90">
                            <span className="text-[9px] uppercase tracking-[0.18em] font-medium">Paiement à la livraison</span>
                            <button
                                type="button"
                                aria-label="Ajouter au panier"
                                onClick={handleAddToCart}
                                disabled={isAdded || enStock === false}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all ${
                                    isAdded ? 'bg-emerald-600 text-white' : 'bg-white/95 text-stone-900 hover:bg-amber-100'
                                } ${enStock === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                                {isAdded ? 'Ajouté' : 'Ajouter'}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col flex-1 p-4 justify-between gap-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500 mb-1.5">Aridona</p>
                        <h3 className="text-sm sm:text-[15px] font-medium text-stone-900 line-clamp-2 leading-relaxed group-hover:text-amber-900 transition-colors">
                            {nom || "Création unique"}
                        </h3>
                    </div>
                    <div className="flex items-end justify-between gap-3 border-t border-stone-200/80 pt-3">
                        <div>
                            <span className="block text-[10px] uppercase tracking-[0.18em] text-stone-400">Prix</span>
                            <p className="text-sm sm:text-base font-semibold text-amber-950">
                                {Number(prix || 0).toLocaleString()} {monnaie || 'FCFA'}
                            </p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Voir</span>
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default ProduitItem;