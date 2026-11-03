import React, { useContext, useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { X, ShoppingBag, MessageCircle, Star, CheckCircle, Send, ChevronDown, ChevronUp, ShieldCheck, Truck } from 'lucide-react';
import ApparenteProduit from '../composant/ApparenteProduit';
import { Helmet } from 'react-helmet-async';

const CarteAvis = ({ item }) => (
  <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow h-full">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-ebgaramond font-semibold text-sm shrink-0">
          {item.nom?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-900 truncate">{item.nom}</p>
          <p className="text-[11px] text-stone-400">
            {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="flex text-amber-500 shrink-0">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} className={i < item.note ? "fill-amber-500" : "text-stone-200"} />
        ))}
      </div>
    </div>

    <p className="text-sm text-stone-600 leading-relaxed">{item.commentaire}</p>

    {item.verifie && (
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
        <CheckCircle size={12} /> Achat vérifié
      </div>
    )}
  </div>
);

const PageProduit = () => {
const { slug } = useParams();
  const { produits, categories, monnaie, ajouterPanier, whatsappNum, backendUrl } = useContext(ShopContext);
  const [produitData, setProduitData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [image, setImage] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [nomCategorie, setNomCategorie] = useState('');

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [estAjoute, setEstAjoute] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [descriptionOuverte, setDescriptionOuverte] = useState(false);

  // --- ÉTAT DU FORMULAIRE D'AVIS DÉROULANT ---
  const [showFormAvis, setShowFormAvis] = useState(false);

  // --- ÉTAT DU SYSTÈME D'AVIS (avis réels, approuvés par un admin) ---
  const [avisListe, setAvisListe] = useState([]);
  const [avisLoading, setAvisLoading] = useState(false);

  const [nouvelAvis, setNouvelAvis] = useState({ nom: '', note: 5, commentaire: '' });
  const [avisEnvoye, setAvisEnvoye] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const NUMERO_WHATSAPP = whatsappNum || "22872656485";

  const getImageUrl = (imgItem) => {
    if (!imgItem) return 'https://placehold.co/600x600?text=Aridona+Bijoux';
    return typeof imgItem === 'object' && imgItem?.url ? imgItem.url : imgItem;
  };

  const getOptimizedImageUrl = (url, width = 800) => {
    if (!url || !url.includes('/upload/')) return url;
    if (url.includes('f_auto') || url.includes('q_auto')) return url;
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  };

  const getImageAlt = (imgItem, fallback) => {
    return (typeof imgItem === 'object' && imgItem?.alt) || fallback || 'Aridona Bijoux';
  };

  // Tronque un texte à n caractères sur une limite de mot, pour les fallbacks meta description.
  const truncate = (str, n) => {
    if (!str) return '';
    if (str.length <= n) return str;
    return `${str.slice(0, n - 1).trimEnd()}…`;
  };

  const handleSizeToggle = (item) => {
    setSelectedSizes([item]);
  };

  useEffect(() => {
    let active = true;

    const fetchProduitData = async () => {
      setIsLoading(true);
      setLoadError('');
      setNotFound(false);
      try {
        const response = await axios.get(`${backendUrl}/api/produit/single/slug/${encodeURIComponent(slug)}`);
        if (!active) return;
        const produitTrouve = response.data.produit;
        setProduitData(produitTrouve);
        
        if (produitTrouve.image && produitTrouve.image.length > 0) {
          setImage(getImageUrl(produitTrouve.image[0]));
          setImageAlt(getImageAlt(produitTrouve.image[0], produitTrouve.nom));
        } else {
          setImage('');
          setImageAlt('');
        }

        if (produitTrouve.sizes && produitTrouve.sizes.length === 1) {
          setSelectedSizes([produitTrouve.sizes[0]]);
        } else {
          setSelectedSizes([]);
        }

        const catTrouvee = typeof produitTrouve.categorie === 'object'
          ? produitTrouve.categorie
          : (categories || []).find(cat => String(cat._id || cat.id) === String(produitTrouve.categorie));
        setNomCategorie(catTrouvee?.nom || catTrouvee?.name || '');
      } catch (error) {
        if (!active) return;
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          const fallback = (produits || []).find((item) => item.slug === slug || item._id === slug);
          if (fallback) setProduitData(fallback);
          else setLoadError('La fiche produit est momentanément indisponible.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchProduitData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { active = false; };
  }, [slug, backendUrl, produits, categories]);

  useEffect(() => {
    if (!showModal) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [showModal]);

  // Charge les avis du produit (publiés immédiatement, aucune donnée mock)
  const produitId = produitData?._id || produitData?.id;

  const fetchAvis = useCallback(async () => {
    if (!produitId) {
      setAvisListe([]);
      return;
    }
    try {
      setAvisLoading(true);
      const response = await axios.get(`${backendUrl}/api/avis/produit/${produitId}`);
      if (response.data.success) {
        setAvisListe(response.data.avis);
      }
    } catch (error) {
      console.error("Erreur chargement des avis :", error);
    } finally {
      setAvisLoading(false);
    }
  }, [produitId, backendUrl]);

  useEffect(() => {
    fetchAvis();
  }, [fetchAvis]);

  const totalAvis = avisListe.length;
  const moyenneNotes = totalAvis > 0
    ? (avisListe.reduce((acc, curr) => acc + curr.note, 0) / totalAvis).toFixed(1)
    : null;

  const handleSoumettreAvis = async (e) => {
    e.preventDefault();
    if (!nouvelAvis.nom || !nouvelAvis.commentaire) return;
    if (!produitId) return;

    setEnvoiEnCours(true);
    try {
      const response = await axios.post(`${backendUrl}/api/avis/ajouter`, {
        produitId,
        nom: nouvelAvis.nom,
        note: Number(nouvelAvis.note),
        commentaire: nouvelAvis.commentaire,
      });

      if (response.data.success) {
        // Publié immédiatement : on recharge la liste pour l'afficher tout de suite.
        await fetchAvis();
        setNouvelAvis({ nom: '', note: 5, commentaire: '' });
        setAvisEnvoye(true);
        setTimeout(() => {
          setAvisEnvoye(false);
          setShowFormAvis(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Erreur soumission avis :", error);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const notifierSurWhatsApp = () => {
    if (!produitData) return;
    const prixFormate = produitData.prix ? Number(produitData.prix).toLocaleString() : 0;
    const message = `Bonjour Aridona Bijoux ! 💎\n\nJe souhaite être informée lorsque la création *"${produitData.nom}"* (${prixFormate} ${monnaie || 'FCFA'}) sera à nouveau disponible.\n\nLien du produit : ${window.location.href}`;
    const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const commanderSurWhatsApp = () => {
    if (!produitData) return;
    const taille = selectedSizes[0] || 'Unique';
    const prixFormate = Number(produitData.prix || 0).toLocaleString('fr-FR');
    const message = `Bonjour Aridona Bijoux !\n\nJe souhaite commander : ${produitData.nom}\nTaille : ${taille}\nPrix : ${prixFormate} XOF\nLien : ${window.location.href}\n\nMerci de me confirmer la disponibilité et la livraison.`;
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const schemaData = produitData && produitData.prix ? {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": produitData.nom || "",
  "image": Array.isArray(produitData.image) 
    ? produitData.image.map(img => getImageUrl(img)) 
    : [getImageUrl(produitData.image)],
  "description": produitData.description || "",
  "sku": String(produitData._id || produitData.id || ""),
  "brand": {
    "@type": "Brand",
    "name": "Aridona Bijoux"
  },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "XOF",
    "price": String(produitData.prix),
    "priceValidUntil": "2027-12-31",
    "availability": produitData.enStock !== false 
      ? "https://schema.org/InStock" 
      : "https://schema.org/OutOfStock",
    "itemCondition": "https://schema.org/NewCondition",
    "url": typeof window !== "undefined" ? window.location.href : ""
  },
  ...(totalAvis > 0 ? {
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": String(Number(moyenneNotes).toFixed(1)), // Force un format décimal propre (ex: 4.8)
      "reviewCount": String(totalAvis)
    },
    "review": avisListe.map(a => ({
      "@type": "Review", // Correction : suppression du doublon
      "author": { 
        "@type": "Person", 
        "name": a.nom || "Client anonyme" 
      },
      "datePublished": a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
      "reviewBody": a.commentaire || "",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": String(a.note || 5),
        "bestRating": "5"
      }
    }))
  } : {})
} : null;

  const pageTitle = produitData
    ? (produitData.metaTitle || `${produitData.nom} - Bijoux en Acier Inoxydable | Aridona Bijoux`)
    : '';
  const pageDescription = produitData
    ? (produitData.metaDescription
      || truncate(produitData.description, 160)
      || `${produitData.nom} : bijou en acier inoxydable 316L, waterproof et hypoallergénique. Livraison à Lomé et partout au Togo.`)
    : '';
  const canonicalUrl = produitData && typeof window !== 'undefined'
    ? `https://aridona.store/produit/${produitData.slug || produitData._id || produitData.id}`
    : undefined;

  const categorySlug = typeof produitData?.categorie === 'object' ? produitData.categorie.slug : undefined;
  const breadcrumbData = produitData ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://aridona.store/' },
      ...(categorySlug ? [{ '@type': 'ListItem', position: 2, name: nomCategorie, item: `https://aridona.store/collection/${categorySlug}` }] : []),
      { '@type': 'ListItem', position: categorySlug ? 3 : 2, name: produitData.nom, item: canonicalUrl },
    ],
  } : null;

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-stone-500" role="status">Chargement du produit...</div>;
  }

  if (notFound || loadError || !produitData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
        <Helmet>
          <title>{notFound ? 'Produit introuvable' : 'Produit indisponible'} | Aridona Bijoux</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <h1 className="text-3xl font-ebgaramond text-stone-900">{notFound ? 'Produit introuvable' : 'Produit indisponible'}</h1>
        <p className="mt-3 text-stone-500">{loadError || 'Cette création n’existe plus ou a été déplacée.'}</p>
        <Link to="/collection" className="mt-6 bg-stone-900 text-white px-6 py-3 text-xs uppercase tracking-widest">Voir la collection</Link>
      </div>
    );
  }

  return (
    <div className='mt-5 md:mt-8 transition-opacity ease-in duration-500 opacity-100 bg-white'>

      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Aridona Bijoux" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={getOptimizedImageUrl(image, 1200)} />

        {schemaData && (
          <script type="application/ld+json">
            {JSON.stringify(schemaData)}
          </script>
        )}
        {breadcrumbData && (
          <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
        )}
      </Helmet>

      <nav aria-label="Fil d’Ariane" className="px-4 md:px-10 lg:px-20 text-xs text-stone-500 mt-4">
        <Link to="/" className="hover:text-amber-800">Accueil</Link>
        {nomCategorie && (
          <>
            <span className="mx-2">/</span>
            <Link
              to="/collection"
              state={categorySlug ? { initialCategorySlug: categorySlug } : undefined}
              className="hover:text-amber-800 hover:underline"
            >
              {nomCategorie}
            </Link>
          </>
        )}
        <span className="mx-2">/</span><span aria-current="page">{produitData.nom}</span>
      </nav>
      
      {/* CONTENEUR PRINCIPAL */}
      <div className='flex gap-8 lg:gap-16 flex-col md:flex-row px-4 md:px-10 lg:px-20 mt-6'>
        
        {/* GALERIE IMAGES */}
        <div className='flex-1  flex flex-col-reverse gap-3 md:flex-row'>
          <div className='flex md:flex-col overflow-x-auto md:overflow-y-auto justify-start gap-3 md:w-[20%] w-full no-scrollbar'>
            {produitData.image && produitData.image.map((item, index) => {
              const itemUrl = getImageUrl(item);
              const isActive = image === itemUrl;
              return (
                <button
                  type="button"
                  aria-label={`Afficher ${getImageAlt(item, `${produitData.nom} - vue ${index + 1}`)}`}
                  key={index}
                  onClick={() => { setImage(itemUrl); setImageAlt(getImageAlt(item, `${produitData.nom} - vue ${index + 1}`)); }}
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-full aspect-square cursor-pointer border-2 transition-all duration-300 rounded-md overflow-hidden
                    ${isActive ? 'border-amber-600 shadow-sm' : 'border-transparent hover:border-amber-200'}`}
                >
                  <img src={getOptimizedImageUrl(itemUrl, 240)} className='w-full h-full object-cover' alt={getImageAlt(item, `${produitData.nom} - vue ${index + 1}`)} loading="lazy" width="240" height="240" />
                </button>
              );
            })}
          </div>

          <div className='w-full md:w-[80%]'>
            <div 
              onClick={() => setShowModal(true)} 
              className='aspect-square w-full overflow-hidden bg-stone-50 border border-stone-100 cursor-zoom-in group relative'
            >
              {image ? (
                <img src={getOptimizedImageUrl(image, 1000)} alt={imageAlt} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' fetchPriority="high" width="1000" height="1000" />
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
            <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 md:p-10" role="dialog" aria-modal="true" aria-label={`Agrandissement de ${produitData.nom}`} onClick={() => setShowModal(false)}>
              <button type="button" aria-label="Fermer l’image" className="absolute top-5 right-5 text-white hover:text-amber-500 transition-colors" onClick={() => setShowModal(false)}>
                <X size={40} strokeWidth={1.5} />
              </button>
              <img src={getOptimizedImageUrl(image, 1600)} alt={imageAlt} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
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

          {/* ÉTOILES ET AVIS AU-DESSUS DU PRIX (uniquement s'il existe de vrais avis approuvés) */}
          {totalAvis > 0 && (
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
          )}

          <div className="flex items-center gap-4 mt-4">
            <p className='text-3xl font-light text-amber-900'>
              {produitData.prix ? Number(produitData.prix).toLocaleString() : 0} {monnaie || 'FCFA'}
            </p>

            {produitData.enStock === false ? (
              <span className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                Rupture de stock
              </span>
            ) : produitData.stock !== null && produitData.stock !== undefined && produitData.stock <= 5 ? (
              <span className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider animate-pulse">
                Plus que {produitData.stock} en stock
              </span>
            ) : (
              <span className="text-sm text-emerald-700">En stock</span>
            )}
          </div>
          
          <div className='mt-6 md:w-11/12 border-y border-stone-200'>
            <button
              type='button'
              onClick={() => setDescriptionOuverte((ouverte) => !ouverte)}
              aria-expanded={descriptionOuverte}
              aria-controls='description-produit'
              className='flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-stone-800 cursor-pointer'
            >
              <span>Description du bijou</span>
              {descriptionOuverte ? <ChevronDown size={18} aria-hidden='true' /> : <ChevronUp size={18} aria-hidden='true' />}
            </button>
            {descriptionOuverte && (
              <p id='description-produit' className='pb-5 text-stone-600 leading-relaxed font-dmsans text-base md:text-lg'>
                {produitData.description}
              </p>
            )}
          </div>

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
              <>
              <button 
                type="button"
                onClick={() => {
                  const idProduit = produitData._id || produitData.id;
                  ajouterPanier(idProduit, selectedSizes[0] || 'Unique');
                  
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
              <button
                type="button"
                onClick={commanderSurWhatsApp}
                className="w-full flex items-center justify-center gap-3 text-xs font-bold tracking-wider py-4 px-4 border border-emerald-700 text-emerald-800 hover:bg-emerald-50 transition-all uppercase cursor-pointer"
              >
                <MessageCircle size={18} />
                <span>Commander sur WhatsApp</span>
              </button>
              </>
            ) : null}
            {produitData.enStock === false && (
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
          
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-3 mt-6 w-full lg:w-11/12'>
            <div className='flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-3'>
              <ShieldCheck className='shrink-0 text-amber-700' size={20} strokeWidth={1.6} aria-hidden='true' />
              <div>
                <p className='text-xs font-semibold text-stone-800'>Satisfaction garantie</p>
                <p className='mt-0.5 text-[11px] leading-snug text-stone-500'>Acier inoxydable waterproof</p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-3'>
              <Truck className='shrink-0 text-amber-700' size={20} strokeWidth={1.6} aria-hidden='true' />
              <div>
                <p className='text-xs font-semibold text-stone-800'>Livraison Rapide</p>
                <p className='mt-0.5 text-[11px] leading-snug text-stone-500'>À Lomé et partout au Togo</p>
              </div>
            </div>
            <div className='flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 px-3 py-3'>
              <MessageCircle className='shrink-0 text-emerald-700' size={20} strokeWidth={1.6} aria-hidden='true' />
              <div>
                <p className='text-xs font-semibold text-stone-800'>Commande sur WhatsApp</p>
                <p className='mt-0.5 text-[11px] leading-snug text-stone-500'>Confirmation personnalisée</p>
              </div>
            </div>
          </div>
        </div>
      </div>
<section className="mt-16 md:mt-20 pt-12 border-t border-stone-200 px-4 md:px-10 lg:px-20">
  <div className="max-w-5xl mx-auto">

    {/* EN-TÊTE + RÉSUMÉ DES NOTES */}
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
      <div>
        <span className="text-xs uppercase tracking-[0.3em] text-amber-700 font-semibold">Retours clients</span>
        <h2 className="font-ebgaramond text-3xl md:text-4xl text-stone-900 tracking-wide mt-1.5">
          Avis de nos clientes
        </h2>
        <p className="text-sm text-stone-500 mt-3 max-w-md leading-relaxed">
          {totalAvis > 0
            ? `Basé sur ${totalAvis} retour${totalAvis > 1 ? 's' : ''} d'expérience.`
            : "Soyez la première à partager votre expérience sur ce bijou."}
        </p>

        <button
          type="button"
          onClick={() => setShowFormAvis(!showFormAvis)}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-widest transition-all rounded-full shadow-sm active:scale-[0.98] cursor-pointer"
        >
          <span>{showFormAvis ? "Fermer le formulaire" : "Laisser un avis"}</span>
          {showFormAvis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Carte résumé : note moyenne + répartition par étoile */}
      {totalAvis > 0 && (
        <div className="w-full md:w-80 shrink-0 bg-stone-50/80 border border-stone-200/80 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-5">
            <span className="font-ebgaramond text-4xl text-stone-900">{moyenneNotes}</span>
            <div>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(Number(moyenneNotes)) ? "fill-amber-500" : "text-stone-200"} />
                ))}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">{totalAvis} avis</p>
            </div>
          </div>

          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = avisListe.filter((a) => a.note === n).length;
              const pct = totalAvis > 0 ? Math.round((count / totalAvis) * 100) : 0;
              return (
                <div key={n} className="flex items-center gap-2 text-[11px] text-stone-500">
                  <span className="w-2.5 shrink-0">{n}</span>
                  <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right text-stone-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

    {/* FORMULAIRE ACCORDÉON (DÉROULANT) */}
    {showFormAvis && (
      <div className="mb-12 p-6 sm:p-8 bg-white rounded-2xl border border-stone-200/80 shadow-sm animate-in fade-in duration-300">
        <h3 className="font-ebgaramond text-xl text-stone-900 mb-5">Partagez votre expérience</h3>

        {avisEnvoye && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle size={16} /> Merci ! Votre avis a été publié.
          </div>
        )}

        <form onSubmit={handleSoumettreAvis} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Votre prénom / nom
              </label>
              <input
                type="text"
                required
                placeholder="ex: Aminata K."
                value={nouvelAvis.nom}
                onChange={(e) => setNouvelAvis({ ...nouvelAvis, nom: e.target.value })}
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Votre note
              </label>
              <div className="flex items-center gap-1.5 h-[42px]">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNouvelAvis({ ...nouvelAvis, note: n })}
                    aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      size={22}
                      className={n <= Number(nouvelAvis.note) ? "fill-amber-500 text-amber-500" : "text-stone-300"}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Votre commentaire
            </label>
            <textarea
              required
              rows="3"
              placeholder="Qu'avez-vous pensé de la qualité du bijou, du rendu ou de la livraison ?"
              value={nouvelAvis.commentaire}
              onChange={(e) => setNouvelAvis({ ...nouvelAvis, commentaire: e.target.value })}
              className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={envoiEnCours}
            className="inline-flex items-center gap-2 px-7 py-3 bg-stone-900 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-widest rounded-full shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            <Send size={13} /> {envoiEnCours ? "Envoi..." : "Publier mon avis"}
          </button>
        </form>
      </div>
    )}

    {/* CARROUSEL DES AVIS */}
    {!avisLoading && avisListe.length === 0 && (
      <p className="text-sm text-stone-400 italic text-center py-12 border border-dashed border-stone-200 rounded-2xl">
        Aucun avis publié pour le moment.
      </p>
    )}

    {avisListe.length === 1 && (
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <CarteAvis item={avisListe[0]} />
        </div>
      </div>
    )}

    {avisListe.length > 1 && (
      <div
        className="group relative overflow-hidden mask-[linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
      >
        <div
          className="flex w-max gap-5 animate-avis-marquee group-hover:[animation-play-state:paused]"
          style={{ '--avis-marquee-duration': `${Math.max(avisListe.length * 8, 20)}s` }}
        >
          {[...avisListe, ...avisListe].map((item, index) => (
            <div key={`${item._id}-${index}`} className="w-75 sm:w-90 shrink-0">
              <CarteAvis item={item} />
            </div>
          ))}
        </div>
      </div>
    )}

  </div>
</section>


      {/* PRODUITS APPARENTÉS */}
      <div className=''>
        <ApparenteProduit 
          categorie={produitData.categorie} 
          matiere={produitData.matiere} 
          actuelId={produitData._id || produitData.id} 
        />
      </div>
    </div>
  );
};

export default PageProduit;