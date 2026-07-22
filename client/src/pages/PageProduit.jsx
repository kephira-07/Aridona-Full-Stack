import { useContext, useEffect, useState } from 'react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { X, ShoppingBag, MessageCircle } from 'lucide-react';
import ApparenteProduit from '../composant/ApparenteProduit';
import BoutonRetour from '../composant/BoutonRetour';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

const PageProduit = () => {
  const { slug } = useParams(); 
  const { produits, categories, monnaie, ajouterPanier } = useContext(ShopContext);
  const [produitData, setProduitData] = useState(null);
  const [image, setImage] = useState('');
  const [nomCategorie, setNomCategorie] = useState('');
 
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [estAjoute, setEstAjoute] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 📱 CONFIGURATION WHATSAPP (Met ton numéro ici sans le "+")
  const NUMERO_WHATSAPP = "22891253109"; // Ex: 228XXXXXXXX pour le Togo

  const handleSizeToggle = (item) => {
    setSelectedSizes((prevSelected) =>
      prevSelected.includes(item)
        ? prevSelected.filter((s) => s !== item) // Décocher
        : [...prevSelected, item]                // Cocher
    );
  };

  // --- RECHERCHE PAR SLUG ---
  const fetchProduitData = async () => {
    const listeProduits = produits || [];
    const produitTrouve = listeProduits.find((item) => item.slug === slug);
    
    if (produitTrouve) {
      setProduitData(produitTrouve);
      
      if (produitTrouve.image && produitTrouve.image.length > 0) {
        setImage(produitTrouve.image[0]);
      }

      // Auto-sélection si une seule taille disponible
      if (produitTrouve.sizes && produitTrouve.sizes.length === 1) {
        setSelectedSizes([produitTrouve.sizes[0]]);
      } else {
        setSelectedSizes([]);
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

  // 📲 FONCTION D'OUVERTURE DE WHATSAPP AVEC MESSAGE PRÉ-REMPLI
  const notifierSurWhatsApp = () => {
    const message = `Bonjour ARIDONA Bijoux ! 💎\n\nJe souhaite être informée lorsque le bijou *"${produitData.nom}"* (${produitData.prix.toLocaleString()} ${monnaie}) sera de nouveau disponible en stock.\n\nLien du produit : ${window.location.href}`;
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Données structurées JSON-LD Schema.org pour Google Rich Snippets
  const schemaData = produitData ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": produitData.nom,
    "image": produitData.image || [],
    "description": produitData.description,
    "sku": produitData._id,
    "offers": {
      "@type": "Offer",
      "priceCurrency": monnaie || "FCFA",
      "price": produitData.prix,
      "availability": produitData.enStock !== false 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  } : null;

  return produitData ? (
    <div className='mt-24 md:mt-32 pt-10 transition-opacity ease-in duration-500 opacity-100 bg-white'>
      
      {/* METADONNÉES SEO & SCHEMA.ORG */}
      <Helmet>
        <title>{`${produitData.nom} - Bijoux en Acier Inoxydable | ARIDONA Bijoux`}</title>
        <meta name="description" content={`Découvrez ${produitData.nom}. Bijou en acier inoxydable, waterproof, résistant à l'eau et hypoallergénique. Commandez dès maintenant.`} />
        
        {/* Open Graph (WhatsApp / Reseaux Sociaux) */}
        <meta property="og:title" content={`${produitData.nom} | ARIDONA Bijoux`} />
        <meta property="og:description" content={`Découvrez ${produitData.nom}. Bijou en acier inoxydable waterproof.`} />
        <meta property="og:image" content={image} />
        <meta property="og:type" content="product" />

        {/* Dynamic Rich Snippets Schema.org */}
        {schemaData && (
          <script type="application/ld+json">
            {JSON.stringify(schemaData)}
          </script>
        )}
      </Helmet>

      <BoutonRetour />
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

          {/* MODAL IMAGE PLEIN ÉCRAN */}
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

          <h1 className='font-ebgaramond text-3xl md:text-4xl text-stone-800 tracking-tight'>{produitData.nom}</h1>

          <div className="flex items-center gap-4 mt-4">
            <p className='text-3xl font-light text-amber-900'>
              {produitData.prix ? produitData.prix.toLocaleString() : 0} {monnaie}
            </p>

            {/* Badge état du stock */}
            {produitData.enStock === false && (
              <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                Rupture de stock
              </span>
            )}
          </div>
          
          <p className='mt-6 text-stone-600 leading-relaxed font-dmsans text-lg md:w-11/12'>
            {produitData.description}
          </p>

          {/* 🌟 ZONE DES TAILLES */}
          {produitData.sizes && produitData.sizes.length > 0 && (
            <div className='flex flex-col gap-4 my-10'>
                <p className='font-medium text-stone-800'>
                  {produitData.sizes.length === 1 ? 'Taille disponible :' : 'Sélectionner vos tailles :'}
                </p>
                <div className='flex flex-wrap gap-3'>
                  {produitData.sizes.map((item, index) => {
                    const isSelected = selectedSizes.includes(item);
                    
                    return (
                      <button 
                        key={index} 
                        type="button"
                        disabled={produitData.enStock === false}
                        onClick={() => handleSizeToggle(item)}
                        className={`min-w-[3rem] h-12 px-4 flex items-center justify-center border-2 transition-all duration-200 font-medium rounded-lg text-sm
                          ${isSelected 
                            ? 'border-black bg-black text-white shadow-md' 
                            : 'border-stone-200 bg-white text-stone-600 hover:border-black'}
                          ${produitData.enStock === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
            </div>
          )}

          {/* BOUTONS D'ACTION DYNAMIQUES */}
          <div className="md:w-11/12 mt-6 flex flex-col gap-3">
            {produitData.enStock !== false ? (
              // BOUTON DE COMMANDE NORMAL
              <button 
                type="button"
                onClick={() => {
                  if (selectedSizes.length === 0 && produitData.sizes && produitData.sizes.length > 0) {
                    toast.error('Veuillez sélectionner une taille', {
                      position: "top-right",
                      autoClose: 3000,
                      hideProgressBar: true,
                      closeOnClick: true,
                      pauseOnHover: false,
                      draggable: true,
                      className: "text-stone-100 border-l-4 border-amber-600 rounded-r-xl shadow-2xl p-4 font-sans",
                      bodyClassName: "bg-amber-500 text-sm font-medium flex items-center gap-3",
                      icon: (
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-800 text-white text-xs font-bold font-serif animate-pulse">
                          !
                        </span>
                      ),
                    });
                    return;
                  }
                  
                  selectedSizes.forEach((sizeSelected) => {
                    ajouterPanier(produitData._id, sizeSelected);
                  });
                  
                  setEstAjoute(true);
                  setTimeout(() => setEstAjoute(false), 2000);
                }} 
                className={`w-full flex items-center justify-center gap-3 text-xs font-semibold tracking-widest py-4 px-4 rounded-xl transition-all duration-300 uppercase ease-in-out shadow-sm active:scale-[0.98]
                  ${estAjoute 
                    ? 'bg-emerald-700 text-white shadow-emerald-100' 
                    : 'bg-amber-900 text-white hover:bg-amber-950'
                  }`}
              >
                <ShoppingBag size={16} strokeWidth={2} className={estAjoute ? 'scale-110 animate-bounce' : ''} />
                <span>{estAjoute ? 'Ajouté au panier !' : 'Ajouter au panier'}</span>
              </button>
            ) : (
              // BOUTON WHATSAPP (MOBILE FIRST DESIGN)
              <button
                type="button"
                onClick={notifierSurWhatsApp}
                className="w-full flex items-center justify-center gap-3 text-xs font-bold tracking-wider py-4 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300 uppercase shadow-md active:scale-[0.98]"
              >
                <MessageCircle size={18} className="fill-white/20" />
                <span>Me prévenir sur WhatsApp</span>
              </button>
            )}
          </div>

          <hr className='mt-10 border-stone-200 md:w-11/12'/>
          
          <div className='text-xs sm:text-lg text-stone-500 mt-6 font-caveat flex flex-col gap-2 font-medium'>
            <div className='flex items-center gap-2 italic'>
              <span className='w-1 h-1 bg-amber-600 rounded-full'></span>
              <p>100% Satisfaction Garantie</p>
            </div>
            <div className='flex items-center gap-2 italic'>
              <span className='w-1 h-1 bg-amber-600 rounded-full'></span>
              <p>Livraison Gratuite à partir de 50 000 FCFA</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <ApparenteProduit categorie={produitData.categorie} matiere={produitData.matiere} actuelId={produitData._id} />
      </div>
    </div> 
  ) : (
    <div className='text-center py-40 text-stone-400 text-sm italic animate-pulse'>
      Recherche de la création exclusive...
    </div>
  );
};

export default PageProduit;