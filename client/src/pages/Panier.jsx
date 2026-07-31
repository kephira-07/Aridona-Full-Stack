import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Titre from '../composant/Titre';
import { Trash, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PanierTotal from '../composant/PanierTotal';
import { toast } from 'react-toastify';
import BoutonRetour from '../composant/BoutonRetour';

const Panier = () => {
  // 1. Tous les contextes doivent être extraits en haut du composant
  const { produits, monnaie, panierProduits, updateQuantity, modifierTaillePanier, supprimerDuPanier } = useContext(ShopContext);
  
  const [panierData, setPanierData] = useState([]);
  const navigate = useNavigate();

  // Helper de sécurisation d'URL image pour MongoDB/Cloudinary
  const getImageUrl = (imgData) => {
    if (!imgData) return '';
    if (Array.isArray(imgData) && imgData.length > 0) {
      const first = imgData[0];
      return typeof first === 'object' && first?.url ? first.url : first;
    }
    return typeof imgData === 'object' && imgData?.url ? imgData.url : imgData;
  };

  // Analyse et structure les données du panier
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

  // Changement de taille en direct via le ShopContext
  const handleSizeChange = async (itemId, oldSize, newSize) => {
    if (oldSize === newSize) return;

    if (typeof modifierTaillePanier === 'function') {
      await modifierTaillePanier(itemId, oldSize, newSize);
      toast.info("Taille mise à jour avec succès.", { theme: "dark", autoClose: 2000 });
    } else {
      console.error("modifierTaillePanier n'est pas définie dans ShopContext");
    }
  };

  // Contrôle avant passage à la caisse
  const verifierTaillesEtProceder = () => {
    let erreurTaille = false;
    let nomDuBijouErreur = "";
    let produitRupture = false;

    for (const item of panierData) {
      const produitInfo = (produits || []).find((p) => String(p._id || p.id) === String(item._id));

      if (produitInfo) {
        if (produitInfo.enStock === false) {
          produitRupture = true;
          nomDuBijouErreur = produitInfo.nom || produitInfo.name || "Création Aridona";
          break;
        }

        const declinaisons = produitInfo.sizes || produitInfo.tailles || [];
        // La taille enregistrée doit être une vraie déclinaison du produit — pas juste
        // "non vide" (sinon le repli "Unique" posé par la fiche produit passerait à travers).
        const tailleInvalide = declinaisons.length > 0 && !declinaisons.includes(item.sizes);

        if (tailleInvalide) {
          erreurTaille = true;
          nomDuBijouErreur = produitInfo.nom || produitInfo.name || "Création Aridona";
          break;
        }
      }
    }

    if (produitRupture) {
      toast.error(`Le produit "${nomDuBijouErreur}" est en rupture de stock.`, {
        position: "top-right",
        autoClose: 4000,
        theme: "dark"
      });
      return;
    }

    if (erreurTaille) {
      toast.error(`Veuillez sélectionner une taille pour "${nomDuBijouErreur}".`, {
        position: "top-right",
        autoClose: 4000,
        theme: "dark"
      });
    } else {
      navigate('/commander');
    }
  };

  return (
    <div className='max-w-7xl mx-auto pb-10 min-h-[70vh] px-4 sm:px-6 lg:px-8'>
      <BoutonRetour />

      <div className='text-3xl mb-10 text-center sm:text-left font-light tracking-wide'>
        <Titre text1='' text2='Votre Panier' />
      </div>

      {panierData.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-24 border border-dashed bg-stone-50/50 max-w-2xl mx-auto px-6 text-center shadow-sm'>
          <div className='p-5 bg-stone-100 rounded-full mb-5 text-stone-400'>
            <ShoppingBag size={45} strokeWidth={1.2} />
          </div>
          <p className='text-xl font-medium text-stone-800'>Votre écrin est vide</p>
          <p className='text-sm text-stone-500 mt-2 max-w-sm font-light'>
            Laissez-vous tenter par nos créations exclusives et commencez votre sélection de bijoux.
          </p>
          <button
            type="button"
            onClick={() => navigate('/collection')}
            className='mt-8 bg-amber-900 text-white text-xs tracking-widest uppercase px-8 py-3.5 hover:bg-amber-950 transition-all shadow-md font-medium cursor-pointer'
          >
            Découvrir nos créations
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-12 items-start'>
          <div className='lg:col-span-2 divide-y divide-stone-100 border-b border-stone-100'>
            {panierData.map((item, index) => {
              const produitsData = (produits || []).find((produit) => String(produit._id || produit.id) === String(item._id));
              if (!produitsData) return null;

              const nomBijou = produitsData.nom || produitsData.name || "Création Aridona";
              const prixBijou = Number(produitsData.prix || produitsData.price || 0);
              const imageBijou = getImageUrl(produitsData.image);
              const taillesDisponibles = produitsData.sizes || produitsData.tailles || [];
              const estEnStock = produitsData.enStock !== false;

              const valeurTailleActuelle = item.sizes ? item.sizes.trim().replace(/"/g, '') : "";
              // Même règle que verifierTaillesEtProceder : une taille n'est valable que si
              // elle fait réellement partie des déclinaisons du produit.
              const estTailleManquante = taillesDisponibles.length > 0 && !taillesDisponibles.includes(valeurTailleActuelle);

              return (
                <div
                  key={index}
                  className='py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-stone-50/30 px-2'
                >
                  <div className='flex items-center gap-5 w-full sm:w-auto'>
                    <div className='w-20 h-24 bg-stone-50 border border-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 shadow-sm relative'>
                      {imageBijou ? (
                        <img
                          src={imageBijou}
                          className='w-full h-full object-cover object-center'
                          alt={nomBijou}
                        />
                      ) : (
                        <ShoppingBag className='text-stone-300' size={24} />
                      )}
                    </div>

                    <div className='space-y-2 w-full sm:w-auto'>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm sm:text-base font-medium text-stone-800 tracking-wide'>{nomBijou}</p>
                        {!estEnStock && (
                          <span className='inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded'>
                            <AlertCircle size={10} /> Rupture
                          </span>
                        )}
                      </div>

                      <p className='text-sm font-semibold text-stone-900'>{prixBijou.toLocaleString()} {monnaie || 'FCFA'}</p>

                      <div className='flex items-center gap-2 pt-1'>
                        <span className='text-xs text-stone-500 font-light'>Taille :</span>
                        {taillesDisponibles.length > 0 ? (
                          <select
                            value={estTailleManquante ? "Choisir" : item.sizes}
                            onChange={(e) => handleSizeChange(item._id, item.sizes, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border outline-none bg-white font-medium cursor-pointer transition-all ${
                              estTailleManquante
                                ? 'border-red-500 bg-red-50 text-red-600 font-bold animate-pulse'
                                : 'border-stone-200 text-stone-700 focus:border-stone-900'
                            }`}
                          >
                            {estTailleManquante && <option value="Choisir">⚠️ Choisir une taille</option>}
                            {taillesDisponibles.map((t, idx) => (
                              <option key={idx} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className='text-xs font-medium text-stone-400 px-2 py-0.5 bg-stone-100'>Unique</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-none border-stone-100'>
                    <div className='flex items-center border border-stone-300 bg-white shadow-inner'>
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(item._id, item.sizes, item.quantity - 1)}
                        className='px-2.5 py-1 text-stone-500 hover:text-stone-800 disabled:opacity-30 transition-colors text-base font-light cursor-pointer'
                      >
                        -
                      </button>
                      <span className='px-3 py-1 text-xs font-medium text-stone-800 font-mono w-8 text-center'>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.sizes, item.quantity + 1)}
                        className='px-2.5 py-1 text-stone-500 hover:text-stone-800 transition-colors text-base font-light cursor-pointer'
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => supprimerDuPanier(item._id, item.sizes)}
                      className='p-2 group text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300 cursor-pointer'
                      title="Retirer du panier"
                    >
                      <Trash size={18} className='transform group-hover:scale-105 transition-transform' />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className='lg:col-span-1 bg-stone-50/50 p-6 sm:p-8 border border-stone-100 lg:sticky lg:top-28 shadow-sm'>
            <PanierTotal />
            <div className='mt-8'>
              <button
                type="button"
                onClick={verifierTaillesEtProceder}
                className='w-full bg-amber-900 text-white text-xs font-semibold tracking-widest uppercase py-4 hover:bg-amber-950 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group shadow-md cursor-pointer'
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