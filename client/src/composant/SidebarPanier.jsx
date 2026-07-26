import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { X, Trash, ShoppingBag } from 'lucide-react';

const SidebarPanier = () => {
  const { 
    panierOuvert, 
    setPanierOuvert, 
    panierProduits, 
    produits, 
    monnaie, 
    updateQuantity, 
    getPanierMontant 
  } = useContext(ShopContext);
  
  const navigate = useNavigate();

  if (!panierOuvert) return null;

  const allerAuPanier = () => {
    setPanierOuvert(false);
    navigate('/panier');
  };

  const allerACommande = () => {
    setPanierOuvert(false);
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
          {Object.keys(panierProduits).length === 0 || sousTotal === 0 ? (
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
                Explorer nos créations
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(panierProduits).map((produitId) => {
                const produitInfo = produits.find((p) => String(p._id) === String(produitId) || String(p.id) === String(produitId));
                if (!produitInfo) return null;

                return Object.keys(panierProduits[produitId]).map((taille) => {
                  const quantite = panierProduits[produitId][taille];
                  if (quantite <= 0) return null;

                  return (
                    <div 
                      key={`${produitId}-${taille}`} 
                      className="flex gap-4 border-b border-stone-100 pb-5 last:border-none last:pb-0"
                    >
                      <div className="w-20 h-20 bg-stone-50 rounded-md overflow-hidden flex-shrink-0 border border-stone-100">
                        <img 
                          src={Array.isArray(produitInfo.image) ? produitInfo.image[0] : produitInfo.image} 
                          alt={produitInfo.nom || produitInfo.name} 
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-stone-800 text-sm line-clamp-1">
                              {produitInfo.nom || produitInfo.name}
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
                          
                          <p className="text-xs text-stone-400 mt-1">
                            Taille : <span className="font-medium text-stone-700">{taille}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 border border-stone-200 rounded-md px-2 py-0.5">
                            <button 
                              type="button"
                              onClick={() => updateQuantity(produitId, taille, quantite - 1)}
                              className="text-stone-400 hover:text-stone-800 text-sm font-bold"
                            >
                              -
                            </button>
                            <span className="text-xs font-semibold px-1 text-stone-700">{quantite}</span>
                            <button 
                              type="button"
                              onClick={() => updateQuantity(produitId, taille, quantite + 1)}
                              className="text-stone-400 hover:text-stone-800 text-sm font-bold"
                            >
                              +
                            </button>
                          </div>

                          <p className="text-sm font-semibold text-amber-950">
                            {(produitInfo.prix * quantite).toLocaleString()} {monnaie || 'FCFA'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })}
            </div>
          )}
        </div>

        {/* Pied de page */}
        {sousTotal > 0 && (
          <div className="border-t border-stone-200 p-6 bg-stone-50/50 space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold text-stone-800">
              <span>Sous-total</span>
              <span className="text-base text-amber-950 font-bold">
                {sousTotal.toLocaleString()} {monnaie || 'FCFA'}
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <button 
                type="button"
                onClick={allerAuPanier}
                className="w-full bg-white border border-stone-800 text-stone-800 py-3 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-stone-900 hover:text-white transition-all shadow-xs"
              >
                Voir le panier complet
              </button>

              <button 
                type="button"
                onClick={allerACommande}
                className="w-full bg-amber-900 text-white py-3 rounded-lg text-xs font-bold tracking-widest uppercase hover:bg-amber-950 transition-all shadow-xs"
              >
                Passer la commande
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarPanier;