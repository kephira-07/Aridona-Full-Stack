import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Titre from '../composant/Titre';
import { Trash, ShoppingBag, ArrowRight } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import PanierTotal from '../composant/PanierTotal';
import { toast } from 'react-toastify'; 
import BoutonRetour from '../composant/BoutonRetour';

const Panier = () => {
  const { produits, monnaie, panierProduits, updateQuantity } = useContext(ShopContext);
  const [panierData, setPanierData] = useState([]);
  const navigate = useNavigate();

  // Analyse et structure les données du panier à chaque modification
  useEffect(() => {
    const tempData = [];
    for (const items in panierProduits) {
      for (const item in panierProduits[items]) {
        if (panierProduits[items][item] > 0) {
          tempData.push({
            _id: items,
            sizes: item,
            quantity: panierProduits[items][item]
          });
        }
      }
    }
    setPanierData(tempData);
  }, [panierProduits]);

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

  // 🌟 CONTRÔLE DE SÉCURITÉ STRICT AVANT PASSAGE À LA CAISSE
  const verifierTaillesEtProceder = () => {
    let erreurTaille = false;
    let nomDuBijouErreur = "";

    for (const item of panierData) {
      const produitInfo = produits.find((p) => p._id === item._id || p.id === item._id);
      
      if (produitInfo) {
        const aPlusieursTailles = produitInfo.sizes && produitInfo.sizes.length > 0;
        
        // Validation : La taille est jugée invalide si non définie ou restée sur "Choisir"
        const tailleInvalide = 
          !item.sizes || 
          item.sizes.trim() === "" || 
          item.sizes === '""' || 
          item.sizes === 'undefined' ||
          item.sizes === 'Choisir';

        if (aPlusieursTailles && tailleInvalide) {
          erreurTaille = true;
          nomDuBijouErreur = produitInfo.nom || "Création Arilona";
          break; 
        }
      }
    }

    if (erreurTaille) {
      toast.error(`Veuillez sélectionner une taille pour le produit "${nomDuBijouErreur}" avant de valider votre commande.`, {
        position: "top-right",
        autoClose: 4000,
        theme: "dark"
      });
    } else {
      navigate('/passercommande');
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 min-h-[70vh]'> 
        <BoutonRetour/>
      {/* En-tête de page */}
      <div className='text-3xl mb-10 text-center sm:text-left font-light tracking-wide'>
        <Titre text1={'VOTRE'} text2={'PANIER'} />
      </div>

      {/* Zone principale */}
      {panierData.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24 border border-dashed rounded-xl bg-stone-50/50 max-w-2xl mx-auto px-6 text-center shadow-sm'>
          <div className='p-5 bg-stone-100 rounded-full mb-5 text-stone-400'>
            <ShoppingBag size={45} strokeWidth={1.2} />
          </div>
          <p className='text-xl font-medium text-stone-800'>Votre écrin est vide</p>
          <p className='text-sm text-stone-500 mt-2 max-w-sm font-light'>
            Laissez-vous tenter par nos créations exclusives et commencez votre sélection de bijoux.
          </p>
          <button 
            onClick={() => navigate('/collection')}
            className='mt-8 bg-stone-900 text-white text-xs tracking-widest uppercase px-8 py-3.5 rounded-none hover:bg-stone-800 transition-all shadow-md font-medium'
          >
            Découvrir nos créations
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-12 items-start'>
          
          {/* Liste des articles */}
          <div className='lg:col-span-2 divide-y divide-stone-100 border-b border-stone-100'>
            {panierData.map((item, index) => {
              const produitsData = produits.find((produit) => (produit._id === item._id || produit.id === item._id));

              if (!produitsData) return null;

              const nomBijou = produitsData.nom || produitsData.name || "Création Arilona";
              const prixBijou = produitsData.prix || produitsData.price || 0;
              const imageBijou = (produitsData.image && produitsData.image[0]) ? produitsData.image[0] : "";
              const taillesDisponibles = produitsData.sizes || [];

              // Évaluation de l'état de la taille actuelle
              const valeurTailleActuelle = item.sizes ? item.sizes.trim().replace(/"/g, '') : "";
              const estTailleManquante = (!valeurTailleActuelle || valeurTailleActuelle === "" || valeurTailleActuelle === "Choisir") && taillesDisponibles.length > 0;

              return (
                <div 
                  key={index} 
                  className='py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-stone-50/30 px-2'
                >
                  {/* Image & Détails du bijou */}
                  <div className='flex items-center gap-5 w-full sm:w-auto'>
                    <div className='w-20 h-24 bg-stone-50 border border-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 rounded-sm shadow-sm'>
                      <img 
                        src={imageBijou} 
                        className='w-full h-full object-cover object-center' 
                        alt={nomBijou} 
                      />
                    </div>
                    
                    <div className='space-y-2 w-full sm:w-auto'>
                      <p className='text-sm sm:text-base font-medium text-stone-800 tracking-wide'>{nomBijou}</p>
                      <p className='text-sm font-semibold text-stone-900'>{prixBijou.toLocaleString()} {monnaie}</p>
                      
                      {/* 🛠️ SÉLECTEUR DE TAILLE EN DIRECT FORCE AVEC INTERCEPTOR */}
                      <div className='flex items-center gap-2 pt-1'>
                        <span className='text-xs text-stone-500 font-light'>Taille :</span>
                        {taillesDisponibles.length > 0 ? (
                          <select
                            value={estTailleManquante ? "Choisir" : item.sizes}
                            onChange={(e) => handleSizeChange(item._id, item.sizes, e.target.value, item.quantity)}
                            className={`text-xs px-2 py-1 rounded border outline-none bg-white font-medium cursor-pointer transition-all ${
                              estTailleManquante 
                                ? 'border-red-500 bg-red-50 text-red-600 font-bold animate-pulse' 
                                : 'border-stone-200 text-stone-700 focus:border-stone-900'
                            }`}
                          >
                            {/* Option neutre injectée si l'utilisateur n'a pas arrêté son choix */}
                            {estTailleManquante && <option value="Choisir">⚠️ Choisir une taille</option>}
                            
                            {taillesDisponibles.map((t, idx) => (
                              <option key={idx} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className='text-xs font-medium text-stone-400 px-2 py-0.5 bg-stone-100 rounded-sm'>Unique</span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Quantité & Action de suppression */}
                  <div className='flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-none border-stone-100'>
                    <div className='flex items-center border border-stone-300 bg-white rounded-sm shadow-inner'>
                      <button 
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item._id, item.sizes, item.quantity - 1)}
                        className='px-2.5 py-1 text-stone-500 hover:text-stone-800 disabled:opacity-30 transition-colors text-base font-light'
                      >
                        -
                      </button>
                      <span className='px-3 py-1 text-xs font-medium text-stone-800 font-mono w-8 text-center'>
                        {item.quantity}
                      </span>
                      <button 
                        type="button"
                        onClick={() => updateQuantity(item._id, item.sizes, item.quantity + 1)}
                        className='px-2.5 py-1 text-stone-500 hover:text-stone-800 transition-colors text-base font-light'
                      >
                        +
                      </button>
                    </div>

                    <button 
                      type="button"
                      onClick={() => updateQuantity(item._id, item.sizes, 0)} 
                      className='p-2 group text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300'
                    >
                      <Trash size={18} className='transform group-hover:scale-105 transition-transform' />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Résumé & Caisse */}
          <div className='lg:col-span-1 bg-stone-50/50 p-6 sm:p-8 border border-stone-100 rounded-lg lg:sticky lg:top-28 shadow-sm'>
            <PanierTotal />
            <div className='mt-8'>
               <button 
                 type="button"
                 onClick={verifierTaillesEtProceder} 
                 className='w-full bg-stone-900 text-white text-xs font-medium tracking-widest uppercase py-4 rounded-none hover:bg-stone-800 active:bg-stone-950 transition-all flex items-center justify-center gap-3 group shadow-md'
               >
                 Passer à la caisse
                 <ArrowRight size={14} className='transform group-hover:translate-x-1 transition-transform' />
               </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Panier;