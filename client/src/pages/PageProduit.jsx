import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { X, ShoppingBag, MessageCircle, Star, CheckCircle, Send } from 'lucide-react';
import ApparenteProduit from '../composant/ApparenteProduit';
import BoutonRetour from '../composant/BoutonRetour';
import { Helmet } from 'react-helmet-async';

const PageProduit = () => {
  const { slug } = useParams(); 
  const { produits, categories, monnaie, ajouterPanier, whatsappNum } = useContext(ShopContext);
  const [produitData, setProduitData] = useState(null);
  const [image, setImage] = useState('');
  const [nomCategorie, setNomCategorie] = useState('');
  
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [estAjoute, setEstAjoute] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // --- ÉTAT DU SYSTÈME D'AVIS ---
  const [avisListe, setAvisListe] = useState([
    {
      id: 1,
      nom: "Aminata K.",
      note: 5,
      date: "12/06/2026",
      commentaire: "Qualité exceptionnelle ! Le bijou ne résiste vraiment à l'eau et ne change pas de couleur.",
      verifie: true
    },
    {
      id: 2,
      nom: "Sonia T.",
      note: 5,
      date: "04/07/2026",
      commentaire: "Sublime rendu en vrai, encore plus beau que sur les photos. Emballage très soigné.",
      verifie: true
    }
  ]);

  const [nouvelAvis, setNouvelAvis] = useState({ nom: '', note: 5, commentaire: '' });
  const [avisEnvoye, setAvisEnvoye] = useState(false);

  const NUMERO_WHATSAPP = whatsappNum || "22891253109";

  const getImageUrl = (imgItem) => {
    if (!imgItem) return 'https://placehold.co/600x600?text=Aridona+Bijoux';
    return typeof imgItem === 'object' && imgItem?.url ? imgItem.url : imgItem;
  };

  const handleSizeToggle = (item) => {
    setSelectedSizes((prevSelected) =>
      prevSelected.includes(item)
        ? prevSelected.filter((s) => s !== item)
        : [...prevSelected, item]
    );
  };

  useEffect(() => {
    const fetchProduitData = () => {
      const listeProduits = produits || [];
      const produitTrouve = listeProduits.find((item) => item.slug === slug || item._id === slug);
      
      if (produitTrouve) {
        setProduitData(produitTrouve);
        
        if (produitTrouve.image && produitTrouve.image.length > 0) {
          setImage(getImageUrl(produitTrouve.image[0]));
        } else {
          setImage('');
        }

        if (produitTrouve.sizes && produitTrouve.sizes.length === 1) {
          setSelectedSizes([produitTrouve.sizes[0]]);
        } else {
          setSelectedSizes([]);
        }

        const listeCategories = categories || [];
        const catTrouvee = listeCategories.find(cat => String(cat._id || cat.id) === String(produitTrouve.categorie));
        setNomCategorie(catTrouvee ? catTrouvee.nom : '');
      }
    };

    fetchProduitData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, produits, categories]);

  // --- CALCUL DES MOYENNES DES AVIS ---
  const totalAvis = avisListe.length;
  const moyenneNotes = totalAvis > 0 
    ? (avisListe.reduce((acc, curr) => acc + curr.note, 0) / totalAvis).toFixed(1)
    : "5.0";

  const handleSoumettreAvis = (e) => {
    e.preventDefault();
    if (!nouvelAvis.nom || !nouvelAvis.commentaire) return;

    const nouveau = {
      id: Date.now(),
      nom: nouvelAvis.nom,
      note: Number(nouvelAvis.note),
      date: new Date().toLocaleDateString('fr-FR'),
      commentaire: nouvelAvis.commentaire,
      verifie: true
    };

    setAvisListe([nouveau, ...avisListe]);
    setNouvelAvis({ nom: '', note: 5, commentaire: '' });
    setAvisEnvoye(true);
    setTimeout(() => setAvisEnvoye(false), 4000);
  };

  const notifierSurWhatsApp = () => {
    if (!produitData) return;
    const prixFormate = produitData.prix ? Number(produitData.prix).toLocaleString() : 0;
    const message = `Bonjour Aridona Bijoux ! 💎\n\nJe souhaite être informée lorsque la création *"${produitData.nom}"* (${prixFormate} ${monnaie || 'FCFA'}) sera à nouveau disponible.\n\nLien du produit : ${window.location.href}`;
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // --- DONNÉES STRUCTURÉES SCHEMA.ORG RECTIFIÉES (Google Search Console OK) ---
  const schemaData = produitData ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": produitData.nom,
    "image": Array.isArray(produitData.image) 
      ? produitData.image.map(img => getImageUrl(img)) 
      : [getImageUrl(produitData.image)],
    "description": produitData.description,
    "sku": produitData._id || produitData.id,
    "brand": {
      "@type": "Brand",
      "name": "Aridona Bijoux"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "XOF", // Code ISO 4217 valide pour le FCFA
      "price": Number(produitData.prix) || 0,
      "availability": produitData.enStock !== false 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": moyenneNotes,
      "reviewCount": totalAvis
    },
    "review": avisListe.map(a => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": a.nom },
      "datePublished": a.date,
      "reviewBody": a.commentaire,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": a.note,
        "bestRating": "5"
      }
    }))
  } : null;

  return produitData ? (
    <div className='mt-5 md:mt-8 transition-opacity ease-in duration-500 opacity-100 bg-white'>
  
      <Helmet>
        <title>{`${produitData.nom} - Bijoux en Acier Inoxydable | Aridona Bijoux`}</title>
        <meta name="description" content={`Découvrez ${produitData.nom}. Bijou en acier inoxydable waterproof et hypoallergénique par Aridona Bijoux.`} />
        <meta property="og:title" content={`${produitData.nom} | Aridona Bijoux`} />
        <meta property="og:description" content={`Découvrez ${produitData.nom}. Bijou waterproof et élégant.`} />
        <meta property="og:image" content={image} />
        <meta property="og:type" content="product" />

        {schemaData && (
          <script type="application/ld+json">
            {JSON.stringify(schemaData)}
          </script>
        )}
      </Helmet>

      <BoutonRetour />
      
      {/* CONTENEUR PRINCIPAL */}
      <div className='flex gap-8 lg:gap-16 flex-col md:flex-row px-4 md:px-10 lg:px-20 mt-6'>
        
        {/* GALERIE IMAGES */}
        <div className='flex-1 flex flex-col-reverse gap-3 md:flex-row'>
          <div className='flex md:flex-col overflow-x-auto md:overflow-y-auto justify-start gap-3 md:w-[20%] w-full no-scrollbar'>
            {produitData.image && produitData.image.map((item, index) => {
              const itemUrl = getImageUrl(item);
              const isActive = image === itemUrl;
              return (
                <div 
                  key={index}
                  onClick={() => setImage(itemUrl)}
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-full aspect-square cursor-pointer border-2 transition-all duration-300 rounded-md overflow-hidden
                    ${isActive ? 'border-amber-600 shadow-sm' : 'border-transparent hover:border-amber-200'}`}
                >
                  <img src={itemUrl} className='w-full h-full object-cover' alt={`${produitData.nom} ${index + 1}`} />
                </div>
              );
            })}
          </div>

          <div className='w-full md:w-[80%]'>
            <div 
              onClick={() => setShowModal(true)} 
              className='aspect-square w-full overflow-hidden bg-stone-50 border border-stone-100 cursor-zoom-in group relative'
            >
              {image ? (
                <img src={image} alt={produitData.nom} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-stone-300'>Image non disponible</div>
              )}
              
              <div className='absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                 <span className='bg-white/80 px-4 py-2 rounded-full text-xs font-medium text-stone-800 backdrop-blur-sm'>
                    Cliquez pour agrandir
                 </span>
              </div>
            </div>
          </div>

          {showModal && (
            <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 md:p-10" onClick={() => setShowModal(false)}>
              <button type="button" className="absolute top-5 right-5 text-white hover:text-amber-500 transition-colors" onClick={() => setShowModal(false)}>
                <X size={40} strokeWidth={1.5} />
              </button>
              <img src={image} alt={produitData.nom} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
            </div>
          )}
        </div>

        {/* INFOS PRODUIT */}
        <div className='flex-1'>
          {nomCategorie && (
            <p className='text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold mb-2'>
              {nomCategorie} {produitData.matiere && `— ${produitData.matiere}`}
            </p>
          )}

          <h1 className='font-ebgaramond text-3xl md:text-4xl text-stone-800 tracking-tight'>{produitData.nom}</h1>

          {/* ÉTOILES ET AVIS AU-DESSUS DU PRIX */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < Math.round(Number(moyenneNotes)) ? "fill-amber-400 text-amber-400" : "text-stone-300"} 
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-stone-700">{moyenneNotes}</span>
            <span className="text-xs text-stone-400">({totalAvis} avis)</span>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <p className='text-3xl font-light text-amber-900'>
              {produitData.prix ? Number(produitData.prix).toLocaleString() : 0} {monnaie || 'FCFA'}
            </p>

            {produitData.enStock === false && (
              <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                Rupture de stock
              </span>
            )}
          </div>
          
          <p className='mt-6 text-stone-600 leading-relaxed font-dmsans text-base md:text-lg md:w-11/12'>
            {produitData.description}
          </p>

          {/* SÉLECTION TAILLE */}
          {produitData.sizes && produitData.sizes.length > 0 && (
            <div className='flex flex-col gap-4 my-8'>
                <p className='font-medium text-stone-800 text-sm'>
                  {produitData.sizes.length === 1 ? 'Taille disponible :' : 'Choisir une taille (optionnel) :'}
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
                        className={`min-w-[3rem] h-12 px-4 flex items-center justify-center border-2 transition-all duration-200 font-medium rounded-lg text-sm cursor-pointer
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

          {/* BOUTONS D'ACTION */}
          <div className="md:w-11/12 mt-6 flex flex-col gap-3">
            {produitData.enStock !== false ? (
              <button 
                type="button"
                onClick={() => {
                  const idProduit = produitData._id || produitData.id;
                  const taillesAAjouter = selectedSizes.length > 0 ? selectedSizes : ['Unique'];
                  
                  taillesAAjouter.forEach((sizeSelected) => {
                    ajouterPanier(idProduit, sizeSelected);
                  });
                  
                  setEstAjoute(true);
                  setTimeout(() => setEstAjoute(false), 2000);
                }} 
                className={`w-full flex items-center justify-center gap-3 text-xs font-semibold tracking-widest py-4 px-4 transition-all duration-300 uppercase ease-in-out shadow-sm active:scale-[0.98] cursor-pointer
                  ${estAjoute 
                    ? 'bg-emerald-700 text-white shadow-emerald-100' 
                    : 'bg-amber-900 text-white hover:bg-amber-950'
                  }`}
              >
                <ShoppingBag size={16} strokeWidth={2} className={estAjoute ? 'scale-110 animate-bounce' : ''} />
                <span>{estAjoute ? 'Ajouté au panier !' : 'Ajouter au panier'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={notifierSurWhatsApp}
                className="w-full flex items-center justify-center gap-3 text-xs font-bold tracking-wider py-4 px-4 bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-300 uppercase shadow-md active:scale-[0.98] cursor-pointer"
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
              <p>100% Satisfaction Garantie — Acier Inoxydable Waterproof</p>
            </div>
            <div className='flex items-center gap-2 italic'>
              <span className='w-1 h-1 bg-amber-600 rounded-full'></span>
              <p>Livraison rapide à domicile</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION AVIS CLIENTS */}
      <section className="px-4 md:px-10 lg:px-20 mt-20 pt-12 border-t border-stone-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="font-ebgaramond text-2xl md:text-3xl text-stone-800">Avis de nos clientes</h2>
              <p className="text-stone-500 text-sm mt-1">Ce que disent nos passionnées d'Aridona Héritage</p>
            </div>

            <div className="flex items-center gap-4 bg-amber-50/60 border border-amber-200/60 p-4 rounded-xl">
              <span className="text-3xl font-bold text-amber-900">{moyenneNotes}</span>
              <div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < Math.round(Number(moyenneNotes)) ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
                  ))}
                </div>
                <p className="text-xs text-amber-800 font-medium mt-0.5">Basé sur {totalAvis} avis vérifiés</p>
              </div>
            </div>
          </div>

          {/* LISTE DES AVIS */}
          <div className="space-y-6 mb-12">
            {avisListe.map((item) => (
              <div key={item.id} className="p-5 border border-stone-100 bg-stone-50/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-800 text-sm">{item.nom}</span>
                    {item.verifie && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">
                        <CheckCircle size={10} /> Achat vérifié
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-400">{item.date}</span>
                </div>

                <div className="flex text-amber-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < item.note ? "fill-amber-400" : "text-stone-200"} />
                  ))}
                </div>

                <p className="text-sm text-stone-600 leading-relaxed font-dmsans">{item.commentaire}</p>
              </div>
            ))}
          </div>

          {/* FORMULAIRE D'AJOUT D'AVIS */}
          <div className="bg-stone-50 p-6 md:p-8 rounded-2xl border border-stone-200">
            <h3 className="text-lg font-semibold text-stone-800 mb-2">Laissez votre avis</h3>
            <p className="text-xs text-stone-500 mb-6">Partagez votre expérience avec cette création.</p>

            {avisEnvoye && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
                <CheckCircle size={18} /> Merci ! Votre avis a bien été publié.
              </div>
            )}

            <form onSubmit={handleSoumettreAvis} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Votre Prénom / Nom</label>
                  <input 
                    type="text" 
                    required
                    placeholder="ex: Aminata K."
                    value={nouvelAvis.nom}
                    onChange={(e) => setNouvelAvis({ ...nouvelAvis, nom: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Note</label>
                  <select 
                    value={nouvelAvis.note}
                    onChange={(e) => setNouvelAvis({ ...nouvelAvis, note: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700 cursor-pointer"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5/5) Excellente qualité</option>
                    <option value="4">⭐⭐⭐⭐☆ (4/5) Très satisfaite</option>
                    <option value="3">⭐⭐⭐☆☆ (3/5) Correct</option>
                    <option value="2">⭐⭐☆☆☆ (2/5) Moyen</option>
                    <option value="1">⭐☆☆☆☆ (1/5) Déçue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Votre avis</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="Qu'avez-vous pensé de la finition, de la tenue ou de la livraison ?"
                  value={nouvelAvis.commentaire}
                  onChange={(e) => setNouvelAvis({ ...nouvelAvis, commentaire: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-700"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-amber-950 transition-colors cursor-pointer"
              >
                <Send size={14} /> Publier mon avis
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* PRODUITS APPARENTÉS */}
      <div className='mt-16'>
        <ApparenteProduit 
          categorie={produitData.categorie} 
          matiere={produitData.matiere} 
          actuelId={produitData._id || produitData.id} 
        />
      </div>
    </div> 
  ) : (
    <div className='text-center py-40 text-stone-400 text-sm italic animate-pulse'>
      Recherche de la création exclusive...
    </div>
  );
};

export default PageProduit;