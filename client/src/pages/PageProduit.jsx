import { useContext, useEffect, useState } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { X, ShoppingBag } from 'lucide-react';
import ApparenteProduit from '../composant/ApparenteProduit';
import BoutonRetour from '../composant/BoutonRetour';
import { toast } from 'react-toastify';

const PageProduit = () => {
 
  const { slug } = useParams(); 
  const { produits, categories, monnaie, ajouterPanier } = useContext(ShopContext);
  const [produitData, setProduitData] = useState(false);
  const [image, setImage] = useState('');
  const [nomCategorie, setNomCategorie] = useState('');
 
  const [size, setSize] = useState('');
  const [estAjoute, setEstAjoute] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // --- RECHERCHE PAR SLUG ---
  const fetchProduitData = async () => {
    const listeProduits = produits || [];
    const produitTrouve = listeProduits.find((item) => item.slug === slug);
    
    if (produitTrouve) {
      setProduitData(produitTrouve);
      
      if (produitTrouve.image && produitTrouve.image.length > 0) {
        setImage(produitTrouve.image[0]);
      }

      // 🎯 LOGIQUE D'AUTO-SÉLECTION :
      // Si le tableau contient EXACTEMENT une seule taille (ex: ["Unique"])
      // On la sélectionne automatiquement d'office !
      if (produitTrouve.sizes && produitTrouve.sizes.length === 1) {
        setSize(produitTrouve.sizes[0]);
      } else {
        setSize(''); // S'il y en a plusieurs, on laisse vide pour forcer le choix conscient
      }

      // Trouver le nom de la catégorie
      const listeCategories = categories || [];
      const catTrouvee = listeCategories.find(cat => cat._id === produitTrouve.categorie);
      if (catTrouvee) {
        setNomCategorie(catTrouvee.nom);
      } else {
        setNomCategorie(''); 
      }
    }
  };

  useEffect(() => {
    fetchProduitData();
  }, [slug, produits, categories]);

  return produitData ? (
    <div className='mt-24 md:mt-32 pt-10 transition-opacity ease-in duration-500 opacity-100 bg-white'>
      <BoutonRetour/>
      <br />
      <br />
      
      {/* --- Conteneur Principal --- */}
      <div className='flex gap-8 lg:gap-16 flex-col md:flex-row px-4 md:px-10 lg:px-20'>
        
        {/* --- SECTION IMAGES --- */}
        <div className='flex-1 flex flex-col-reverse gap-3 md:flex-row'>
          
          {/* Liste des miniatures */}
          <div className='flex md:flex-col overflow-x-auto md:overflow-y-auto justify-start gap-3 md:w-[20%] w-full no-scrollbar'>
            {produitData.image && produitData.image.map((item, index) => (
              <div 
                key={index}
                onClick={() => setImage(item)}
                className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-full aspect-square cursor-pointer border-2 transition-all duration-300 rounded-md overflow-hidden
                  ${image === item ? 'border-amber-600 shadow-sm' : 'border-transparent hover:border-amber-200'}`}
              >
                <img src={item} className='w-full h-full object-cover' alt={`Miniature ${index}`} />
              </div>
            ))}
          </div>

          {/* Image Principale */}
          <div className='w-full md:w-[80%]'>
            <div 
              onClick={() => setShowModal(true)} 
              className='aspect-square w-full overflow-hidden rounded-xl bg-stone-50 border border-stone-100 cursor-zoom-in group relative'
            >
              <img src={image} alt={produitData.nom} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
              <div className='absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                 <span className='bg-white/80 px-4 py-2 rounded-full text-xs font-medium text-stone-800 backdrop-blur-sm'>
                   Cliquez pour agrandir
                 </span>
              </div>
            </div>
          </div>

          {/* MODAL PLEIN ÉCRAN */}
          {showModal && (
            <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 md:p-10" onClick={() => setShowModal(false)}>
              <button className="absolute top-5 right-5 text-white hover:text-amber-500" onClick={() => setShowModal(false)}>
                <X size={40} strokeWidth={1.5} />
              </button>
              <img src={image} alt="Plein écran" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
            </div>
          )}

        </div>

        {/* --- INFOS PRODUIT --- */}
        <div className='flex-1'>
          
          {nomCategorie && (
            <p className='text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold mb-2'>
              {nomCategorie} {produitData.matiere && `— ${produitData.matiere}`}
            </p>
          )}

          <h1 className='font-serif text-3xl md:text-4xl text-stone-800 tracking-tight'>{produitData.nom}</h1>

          <p className='mt-4 text-3xl font-light text-amber-900'>
            {produitData.prix ? produitData.prix.toLocaleString() : 0} {monnaie}
          </p>
          
          <p className='mt-6 text-stone-600 leading-relaxed font-alice text-lg md:w-11/12'>
            {produitData.description}
          </p>

          {/* 🌟 ZONE DES TAILLES (S'affiche TOUJOURS si le tableau contient au moins une taille) */}
          {produitData.sizes && produitData.sizes.length > 0 && (
            <div className='flex flex-col gap-4 my-10'>
                <p className='font-medium text-stone-800'>
                  {produitData.sizes.length === 1 ? 'Taille disponible :' : 'Sélectionner une taille :'}
                </p>
                <div className='flex flex-wrap gap-3'>
                  {produitData.sizes.map((item, index) => (
                    <button 
                      key={index} 
                      type="button"
                      onClick={() => setSize(item)}
                      className={`min-w-[3rem] h-12 px-4 flex items-center justify-center border-2 transition-all duration-200 font-medium rounded-lg text-sm
                        ${item === size 
                          ? 'border-amber-800 bg-amber-900 text-white shadow-md' 
                          : 'border-stone-200 bg-white text-stone-600 hover:border-amber-400'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
            </div>
          )}

          {/* Bouton d'action */}
          <div className="md:w-11/12 mt-6">
            <button 
              type="button"
              onClick={() => {
                // 🛑 SÉCURITÉ : Bloque strictement s'il y a des tailles et qu'aucune n'est cliquée
                if (!size && produitData.sizes && produitData.sizes.length > 0) {
                  toast.error(`Veuillez sélectionner une taille pour le produit "${produitData.nom}" avant de l'ajouter au panier.`, {
                    position: "top-right",
                    autoClose: 4000,
                    theme: "dark"
                  });
                  return; // 👈 ICI : Empêche radicalement l'exécution de la suite
                }
                
                // Si la taille est bien choisie ou s'il n'y a pas de déclinaisons nécessaires, on continue
                ajouterPanier(produitData._id, size);
                setEstAjoute(true);
                setTimeout(() => setEstAjoute(false), 2000);
              }} 
              className={`w-full flex items-center justify-center gap-3 text-xs font-semibold tracking-widest py-4 px-6 rounded-xl transition-all duration-300 uppercase ease-in-out active:scale-[0.98] shadow-sm
                ${estAjoute 
                  ? 'bg-emerald-700 text-white shadow-emerald-100' 
                  : 'bg-stone-950 text-white hover:bg-stone-900'
                }`}
            >
              <ShoppingBag size={16} strokeWidth={2} className={estAjoute ? 'scale-110 animate-bounce' : ''} />
              <span>
                {estAjoute ? 'Ajouté au panier !' : 'Ajouter au panier'}
              </span>
            </button>
          </div>

          <hr className='mt-10 border-stone-200 md:w-11/12'/>
          
          <div className='text-xs sm:text-sm text-stone-500 mt-6 flex flex-col gap-2 font-medium'>
            <div className='flex items-center gap-2 italic'>
              <span className='w-1 h-1 bg-amber-600 rounded-full'></span>
              <p>100% Satisfaction Garantie</p>
            </div>
            <div className='flex items-center gap-2 italic'>
              <span className='w-1 h-1 bg-amber-600 rounded-full'></span>
              <p>Livraison Gratuite à partir de 150 000 FCFA</p>
            </div>
            <div className='flex items-center gap-2 italic'>
              <span className='w-1 h-1 bg-amber-600 rounded-full'></span>
              <p>Échange et retour sous 30 jours</p>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-1'>
        <ApparenteProduit categorie={produitData.categorie} matiere={produitData.matiere} actuelId={produitData._id} />
      </div>
    </div> 
  ) : <div className='text-center py-40 text-stone-400 text-sm italic animate-pulse'>Recherche de la création exclusive...</div>
}

export default PageProduit;