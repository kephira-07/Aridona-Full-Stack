import React from 'react';

const ProduitSkeleton = () => {
  return (
    <article className="h-full select-none" aria-hidden="true">
      <div className="flex flex-col h-full bg-white overflow-hidden border border-stone-100/90 shadow-2xs">
        {/* Carré image avec effet de brillance shimmer */}
        <div className="relative aspect-square bg-gradient-to-br from-stone-100 via-stone-200/60 to-stone-100 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>

        {/* Détails du produit */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between bg-white space-y-3">
          <div className="space-y-2">
            {/* Ligne Titre */}
            <div className="h-3 sm:h-3.5 bg-stone-200/80 rounded-sm w-4/5 animate-pulse" />
            {/* Ligne sous-titre / matière */}
            <div className="h-2.5 bg-stone-100 rounded-sm w-2/5 animate-pulse" />
          </div>

          {/* Prix & disponibilité */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="h-3.5 sm:h-4 bg-amber-100/70 rounded-sm w-1/3 animate-pulse" />
            <div className="h-2.5 bg-stone-100 rounded-sm w-1/4 animate-pulse hidden sm:block" />
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProduitSkeleton;
