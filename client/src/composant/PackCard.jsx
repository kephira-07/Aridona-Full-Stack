import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const getImageUrl = (image) => {
  const first = Array.isArray(image) ? image[0] : image;
  return typeof first === 'object' ? first?.url : first;
};

// Styles de décalage pour la disposition en "Collage"
const SHIFT_CLASSES = [
  'top-1 left-1 rotate-[-3deg] z-10 group-hover:-translate-y-1.5 group-hover:-translate-x-1.5',
  'top-3 right-1 rotate-[4deg] z-20 group-hover:translate-y-1 group-hover:translate-x-1.5',
  'bottom-1 left-3 rotate-[2deg] z-20 group-hover:translate-y-1.5 group-hover:-translate-x-1',
  'bottom-2 right-2 rotate-[-4deg] z-10 group-hover:-translate-y-1 group-hover:translate-x-1',
];

export default function PackCard({ pack }) {
  const { ajouterPackAuPanier } = useContext(ShopContext);
  if (!pack) return null;

  const totalItems = pack.produits?.length || 0;
  const remainingCount = totalItems - 3;

  const handleAjouterPanier = (e) => {
    e.preventDefault();
    e.stopPropagation();
    ajouterPackAuPanier(pack);
  };

  return (
    <Link 
      to={`/pack/${pack.slug}`} 
      className="group block flex flex-col justify-between overflow-hidden border border-stone-200/80 bg-white p-2 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:border-amber-200"
    >
      <article className="flex h-full flex-col justify-between">
        <div>
          {/* Zone d'exposition décalée des produits (Collage) */}
          <div className="relative aspect-square w-full bg-stone-100/70 p-0 mb-6 overflow-hidden flex items-center justify-center">
            <div className="relative h-full w-full max-w-90 max-h-90">
              {pack.produits?.slice(0, 4).map(({ produit }, index) => {
                if (!produit) return null;
                const isFourthAndHasMore = index === 3 && totalItems > 4;
                const shiftStyle = SHIFT_CLASSES[index % SHIFT_CLASSES.length];

                return (
                  <div 
                    key={produit._id || index} 
                    className={`absolute w-[52%] aspect-square overflow-hidden border-2 border-white shadow-md transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg ${shiftStyle}`}
                  >
                    <img 
                      src={getImageUrl(produit.image)} 
                      alt={produit.nom} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy" 
                    />
                    {/* Badge +N bijoux si plus de 4 produits */}
                    {isFourthAndHasMore && (
                      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-white font-semibold transition-opacity group-hover:bg-amber-900/70">
                        <span className="text-sm font-bold">+{remainingCount}</span>
                        <span className="text-[9px] uppercase tracking-wider font-light">bijoux</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Titre du pack */}
          <h3 className="font-ebgaramond text-2xl font-medium text-stone-900 transition-colors group-hover:text-amber-800 line-clamp-1">
            {pack.nom}
          </h3>
          
          {/* Nombre de pièces */}
          <span className="inline-block mt-1 text-[11px] font-medium text-amber-800/90 bg-white/10 px-2.5 py-0.5 border border-amber-700">
            Ensemble de {totalItems} pièce{totalItems > 1 ? 's' : ''}
          </span>

          {/* Description courte */}
          <p className="mt-2 text-xs leading-relaxed text-stone-500 line-clamp-2">
            {pack.description}
          </p>
        </div>

        {/* Pied de la carte (Prix & Bouton Ajouter au panier) */}
        {/* flex-wrap : évite que le bouton se compresse/déborde quand la carte est étroite
            (ex: grille à 2 colonnes sur tablette) — il passe proprement à la ligne plutôt
            que d'écraser son texte. */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400">Total Pack</span>
            <span className="text-lg font-semibold text-stone-900">
              {Number(pack.prix).toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          <button
            type="button"
            onClick={handleAjouterPanier}
            aria-label={`Ajouter ${pack.nom} au panier`}
            className="inline-flex items-center gap-2 bg-amber-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-amber-950 hover:shadow-md active:scale-95 z-10 w-full sm:w-auto justify-center"
          >
            <ShoppingBag size={15} /> Ajouter au panier
          </button>
        </div>
      </article>
    </Link>
  );
}