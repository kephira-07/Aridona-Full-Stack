import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Trash, ShoppingBag, ArrowRight } from 'lucide-react';

const SidebarPanier = () => {
  const {
    panierOuvert,
    setPanierOuvert,
    panierProduits,
    produits,
    monnaie,
    updateQuantity,
    getPanierMontant,
    panierNecessiteChoixTaille,
    panierPacks,
    updateQuantityPack,
    packs
  } = useContext(ShopContext);

  const navigate = useNavigate();

  if (!panierOuvert) return null;

  const getImageUrl = (imgData) => {
    if (!imgData) return '';
    if (Array.isArray(imgData) && imgData.length > 0) {
      const first = imgData[0];
      return typeof first === 'object' && first?.url ? first.url : String(first);
    }
    return typeof imgData === 'object' && imgData?.url ? imgData.url : String(imgData);
  };

  const allerAuPanier = () => {
    setPanierOuvert(false);
    navigate('/panier');
  };

  const allerACommande = () => {
    setPanierOuvert(false);
    if (panierNecessiteChoixTaille && panierNecessiteChoixTaille()) {
      toast.error("Veuillez d'abord choisir une taille pour chaque bijou concerné.");
      navigate('/panier');
      return;
    }
    navigate('/commander');
  };

  const sousTotal = getPanierMontant ? getPanierMontant() : 0;

  return (
    <div className="fixed inset-0 z-[2000]">
      {/* Overlay sombre */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setPanierOuvert(false)}
      />

      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white flex flex-col shadow-2xl">
        {/* En-tête */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-amber-900" />
            <h2 className="text-lg font-semibold text-stone-800">Votre Panier</h2>
          </div>
          <button
            type="button"
            onClick={() => setPanierOuvert(false)}
            className="p-1 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Liste des articles */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          {(Object.keys(panierProduits).length === 0 && Object.keys(panierPacks).length === 0) || sousTotal === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-4 bg-stone-50 rounded-full text-stone-300 mb-4">
                <ShoppingBag size={40} strokeWidth={1.5} />
              </div>
              <p className="text-stone-500 font-medium text-sm">Votre panier est vide pour le moment.</p>
              <button
                type="button"
                onClick={() => {
                  setPanierOuvert(false);
                  navigate('/collection');
                }}
                className="mt-6 text-xs uppercase tracking-widest text-amber-900 font-semibold hover:underline"
              >
                Explorer nos bijoux
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(panierProduits).map((produitId) => {
                const produitInfo = (produits || []).find(
                  (p) => String(p._id || p.id) === String(produitId)
                );
                if (!produitInfo) return null;

                return Object.keys(panierProduits[produitId]).map((taille) => {
                  const quantite = panierProduits[produitId][taille];
                  if (quantite <= 0) return null;

                  const nom = produitInfo.nom || produitInfo.name || "Bijou Aridona";
                  const prix = Number(produitInfo.prix || produitInfo.price || 0);
                  const img = getImageUrl(produitInfo.image);

                  return (
                    <div
                      key={`${produitId}-${taille}`}
                      className="flex gap-4 border-b border-stone-100 pb-5 last:border-none last:pb-0"
                    >
                      <div className="w-20 h-20 bg-stone-50 rounded-md overflow-hidden flex-shrink-0 border border-stone-100">
                        <img
                          src={img}
                          alt={nom}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-stone-800 text-sm line-clamp-1">
                              {nom}
                            </h3>
                            <button
                              type="button"
                              onClick={() => updateQuantity(produitId, taille, 0)}
                              className="text-stone-300 hover:text-red-500 transition-colors p-1"
                              aria-label="Supprimer l'article"
                            >
                              <Trash size={15} />
                            </button>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">Taille: {taille}</p>
                          <p className="text-xs font-semibold text-stone-900 mt-1">
                            {prix.toLocaleString()} {monnaie || 'FCFA'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(produitId, taille, quantite - 1)}
                            className="w-6 h-6 border border-stone-200 text-stone-600 flex items-center justify-center text-xs hover:bg-stone-50"
                          >
                            -
                          </button>
                          <span className="text-xs font-medium text-stone-800 font-mono">
                            {quantite}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(produitId, taille, quantite + 1)}
                            className="w-6 h-6 border border-stone-200 text-stone-600 flex items-center justify-center text-xs hover:bg-stone-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })}

              {Object.keys(panierPacks).map((packId) => {
                const quantite = panierPacks[packId];
                if (quantite <= 0) return null;
                const packInfo = (packs || []).find((p) => String(p._id) === String(packId));
                if (!packInfo) return null;
                const imgPack = packInfo.produits?.find((c) => c.produit?.image?.[0])?.produit?.image?.[0];
                const imgUrl = typeof imgPack === 'object' ? imgPack?.url : imgPack;

                return (
                  <div
                    key={`pack-${packId}`}
                    className="flex gap-4 border-b border-stone-100 pb-5 last:border-none last:pb-0"
                  >
                    <div className="w-20 h-20 bg-stone-50 rounded-md overflow-hidden flex-shrink-0 border border-stone-100">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={packInfo.nom}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <ShoppingBag size={22} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-stone-800 text-sm line-clamp-1">
                            {packInfo.nom}
                          </h3>
                          <button
                            type="button"
                            onClick={() => updateQuantityPack(packId, 0)}
                            className="text-stone-300 hover:text-red-500 transition-colors p-1"
                            aria-label="Supprimer le pack"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                        <p className="text-xs text-amber-800 font-semibold mt-0.5">Pack</p>
                        <p className="text-xs font-semibold text-stone-900 mt-1">
                          {Number(packInfo.prix).toLocaleString()} {monnaie || 'FCFA'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => updateQuantityPack(packId, quantite - 1)}
                          className="w-6 h-6 border border-stone-200 text-stone-600 flex items-center justify-center text-xs hover:bg-stone-50"
                        >
                          -
                        </button>
                        <span className="text-xs font-medium text-stone-800 font-mono">
                          {quantite}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantityPack(packId, quantite + 1)}
                          className="w-6 h-6 border border-stone-200 text-stone-600 flex items-center justify-center text-xs hover:bg-stone-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pied de page Sidebar */}
        {sousTotal > 0 && (
          <div className="p-6 border-t border-stone-100 bg-stone-50/50 space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold text-stone-800">
              <span>Sous-total</span>
              <span>{sousTotal.toLocaleString()} {monnaie || 'FCFA'}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={allerAuPanier}
                className="w-full border border-stone-900 text-stone-900 text-xs font-semibold uppercase tracking-wider py-3 hover:bg-stone-900 hover:text-white transition-all text-center"
              >
                Voir Panier
              </button>
              <button
                type="button"
                onClick={allerACommande}
                className="w-full bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider py-3 hover:bg-amber-950 transition-all flex items-center justify-center gap-1 text-center"
              >
                Commander <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarPanier;