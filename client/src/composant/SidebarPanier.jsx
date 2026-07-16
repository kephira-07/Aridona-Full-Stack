import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom'; // 👈 Importe le hook de navigation
import { X } from 'lucide-react';

const SidebarPanier = () => {
  const { panierOuvert, setPanierOuvert, panierProduits ,produits, monnaie , updateQuantity} = useContext(ShopContext);
  const navigate = useNavigate(); // 👈 Initialise la navigation

  if (!panierOuvert) return null;

  const allerAuPanier = () => {
    setPanierOuvert(false); // 1. On ferme d'abord la sidebar
    navigate('/panier');    // 2. On redirige vers ta page panier existante
  };
    // 🔄 GÉRER LE CHANGEMENT DE TAILLE EN DIRECT ET FUSIONNER LES QUANTITÉS SI BESOIN
    const handleSizeChange = (itemId, oldSize, newSize, quantity) => {
      if (oldSize === newSize) return;
  
      // 1. On retire l'article associé à l'ancienne taille
      updateQuantity(itemId, oldSize, 0);
  
      // 2. On injecte la quantité vers la nouvelle taille choisie
      const quantiteExistante = panierProduits[itemId]?.[newSize] || 0;
      updateQuantity(itemId, newSize, quantiteExistante + quantity);
      
      toast.info("Taille mise à jour avec succès.", { theme: "dark", autoClose: 2000 });
    };

  return (
    <div className="fixed inset-0 z-[2000]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPanierOuvert(false)} />

      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-dmsans">Votre Panier</h2>
          <button onClick={() => setPanierOuvert(false)}><X size={24} /></button>
        </div>

        {/* Liste des produits au milieu */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ... Ton code actuel pour lister les produits ... */}
           <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
  {Object.keys(panierProduits).length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <p className="text-stone-400 italic">Votre panier est encore vide.</p>
    </div>
  ) : (
    <div className="space-y-6">
      {Object.keys(panierProduits).map((produitId) => {
        // Retrouver les détails du produit dans la liste globale
        const produitInfo = produits.find((p) => p._id === produitId);
        
        if (!produitInfo) return null;

        // On boucle sur chaque taille ajoutée pour ce produit
        return Object.keys(panierProduits[produitId]).map((taille) => {
          const quantite = panierProduits[produitId][taille];

          if (quantite <= 0) return null;

          return (
            <div key={`${produitId}-${taille}`} className="flex gap-4 border-b border-stone-100  pb-4 last:border-none">
              {/* Image du produit */}
              <div className="w-20 h-20 bg-stone-50 rounded-lg overflow-hidden  flex-shrink-0 border border-stone-100">
                <img 
                  src={produitInfo.image && produitInfo.image[0]} 
                  alt={produitInfo.nom} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Détails du produit */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-medium font-ebgaramond text-stone-800 text-sm line-clamp-1">{produitInfo.nom}</h4>
                  <p className="text-xs text-stone-400 mt-1">Taille : <span className="font-semibold text-stone-600">{taille}</span></p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  {/* Quantité */}
                    <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          disabled={quantite <= 1}
                          onClick={() => updateQuantity(produitId, taille, quantite - 1)}
                          className="w-6 h-6 flex items-center justify-center bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            -
                        </button>
                        <span className="text-sm font-medium">{quantite}</span>
                        <button 
                          type="button"
                            onClick={() => updateQuantity(produitId, taille, quantite + 1)}
                            className="w-6 h-6 flex items-center justify-center bg-stone-100 rounded-full text-stone-600 hover:bg-stone-200"
                        >
                            +
                        </button>
                    </div>

                  {/* Prix */}
                  <p className="text-sm font-semibold text-amber-900">
                    {(produitInfo.prix * quantite).toLocaleString()} {monnaie}
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
        </div>

        {/* FOOTER : LA CONNEXION ENTRE LES DEUX PANIER */}
        <div className="border-t p-6 bg-white space-y-3">
          
          {/* BOUTON 1 : Lien vers ta page panier complète */}
          <button 
            onClick={allerAuPanier}
            className="w-full bg-transparent border-2 border-amber-700 text-amber-700 py-3 rounded-lg text-sm font-semibold hover:bg-stone-100 transition-colors"
          >
            Voir le panier complet
          </button>

          {/* BOUTON 2 : Lien direct vers le paiement */}
          <button 
            onClick={() => {
              setPanierOuvert(false);
              navigate('/passercommande'); // Ou ta route de paiement
            }}
            className="w-full bg-amber-700 text-white py-3 rounded-lg text-sm font-semibold hover:text-amber-700 hover:border-2 border-amber-700 hover:bg-gray-100 transition-colors"
          >
            Passer la commande
          </button>
          
          
        </div>
      </div>
    </div>
  );
};

export default SidebarPanier;