import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import { X, ShoppingBag, MessageCircle, Star, CheckCircle, Send ,ChevronDown,ChevronUp} from 'lucide-react';
import ApparenteProduit from '../composant/ApparenteProduit';
import BoutonRetour from '../composant/BoutonRetour';
import { Helmet } from 'react-helmet-async';

const PageProduit = () => {
const { slug } = useParams();
  const { produits, categories, monnaie, ajouterPanier, whatsappNum, backendUrl } = useContext(ShopContext);
  const [produitData, setProduitData] = useState(null);
  const [image, setImage] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [nomCategorie, setNomCategorie] = useState('');

  const [selectedSizes, setSelectedSizes] = useState([]);
  const [estAjoute, setEstAjoute] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

        const listeCategories = categories || [];
        const catTrouvee = listeCategories.find(cat => String(cat._id || cat.id) === String(produitTrouve.categorie));
        setNomCategorie(catTrouvee ? catTrouvee.nom : '');
      }
    };

    fetchProduitData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, produits, categories]);

  // Charge les avis réellement approuvés pour ce produit (aucune donnée mock)
  useEffect(() => {
    const produitId = produitData?._id || produitData?.id;
    if (!produitId) {
      setAvisListe([]);
      return;
    }

    const fetchAvis = async () => {
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
    };

    fetchAvis();
  }, [produitData, backendUrl]);

  const totalAvis = avisListe.length;
  const moyenneNotes = totalAvis > 0
    ? (avisListe.reduce((acc, curr) => acc + curr.note, 0) / totalAvis).toFixed(1)
    : null;

  const handleSoumettreAvis = async (e) => {
    e.preventDefault();
    if (!nouvelAvis.nom || !nouvelAvis.commentaire) return;

    const produitId = produitData?._id || produitData?.id;
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
        // L'avis reste invisible tant qu'un admin ne l'a pas approuvé — pas d'ajout local optimiste.
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

  const schemaData = produitData ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": produitData.nom,
    "image": Array.isArray(produitData.image) 
      ? produitData.image.map(img => getImageUrl(img)) 
      : [getImageUrl(produitData.image)],
    "description": produitData.description,
    "sku": String(produitData._id || produitData.id),
    "brand": {
      "@type": "Brand",
      "name": "Aridona Bijoux"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "XOF",
      "price": Number(produitData.prix) || 0,
      "priceValidUntil": "2027-12-31",
      "availability": produitData.enStock !== false 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    },
    // aggregateRating/review ne sont envoyés à Google que s'il existe de vrais avis approuvés,
    // pour ne jamais déclarer de données structurées fabriquées (règles Google sur les faux avis).
    ...(totalAvis > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": moyenneNotes,
        "reviewCount": totalAvis
      },
      "review": avisListe.map(a => ({
        "@type": "Review",
        "author": { "@type": "Person", "name": a.nom },
        "datePublished": a.createdAt,
        "reviewBody": a.commentaire,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": a.note,
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
      || `Découvrez ${produitData.nom}. Bijou en acier inoxydable waterproof et hypoallergénique par Aridona Bijoux.`)
    : '';
  const canonicalUrl = produitData && typeof window !== 'undefined'
    ? `${window.location.origin}/produit/${produitData.slug || produitData._id || produitData.id}`
    : undefined;

  return produitData ? (
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
        <div className='flex-1  flex flex-col-reverse gap-3 md:flex-row'>
          <div className='flex md:flex-col overflow-x-auto md:overflow-y-auto justify-start gap-3 md:w-[20%] w-full no-scrollbar'>
            {produitData.image && produitData.image.map((item, index) => {
              const itemUrl = getImageUrl(item);
              const isActive = image === itemUrl;
              return (
                <div
                  key={index}
                  onClick={() => { setImage(itemUrl); setImageAlt(getImageAlt(item, `${produitData.nom} - vue ${index + 1}`)); }}
                  className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-full aspect-square cursor-pointer border-2 transition-all duration-300 rounded-md overflow-hidden
                    ${isActive ? 'border-amber-600 shadow-sm' : 'border-transparent hover:border-amber-200'}`}
                >
                  <img src={itemUrl} className='w-full h-full object-cover' alt={getImageAlt(item, `${produitData.nom} - vue ${index + 1}`)} />
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
                <img src={image} alt={imageAlt} className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />
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
              <img src={image} alt={imageAlt} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
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
<section className="p-8 mt-12 border-t border-stone-200 bg-gradient-to-b from-white to-stone-50">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
    <div>
      <h2 className="font-serif text-3xl text-amber-900 tracking-tight border-b border-amber-200 pb-2">
        Avis de nos clientes
      </h2>
      <p className="text-sm text-stone-600 mt-2">
        {totalAvis > 0
          ? <>Note moyenne de <span className="font-semibold text-stone-900">{moyenneNotes}/5</span> basée sur {totalAvis} retour{totalAvis > 1 ? 's' : ''} d'expérience.</>
          : "Soyez la première à partager votre expérience sur ce bijou."}
      </p>
    </div>

    {/* Bouton pour dérouler le formulaire */}
    <button
      type="button"
      onClick={() => setShowFormAvis(!showFormAvis)}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-700 text-white text-xs font-semibold uppercase tracking-wide rounded-md shadow-sm transition-all"
    >
      <span>{showFormAvis ? "Fermer le formulaire" : "Laisser un avis"}</span>
      {showFormAvis ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  </div>

  {/* FORMULAIRE ACCORDÉON (DÉROULANT) */}
  {showFormAvis && (
    <div className="mb-10 p-6 bg-white rounded-lg border border-stone-200 shadow-sm animate-in fade-in duration-300">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-800 mb-4">Votre avis nous intéresse</h3>

      {avisEnvoye && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2 shadow-sm">
          <CheckCircle size={16} /> Merci ! Votre avis a été envoyé et sera visible après vérification.
        </div>
      )}

      <form onSubmit={handleSoumettreAvis} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-medium text-stone-700 mb-1">Votre Prénom / Nom</label>
          <input 
            type="text" 
            required
            placeholder="ex: Aminata K."
            value={nouvelAvis.nom}
            onChange={(e) => setNouvelAvis({ ...nouvelAvis, nom: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-stone-700 mb-1">Votre Note</label>
          <select 
            value={nouvelAvis.note}
            onChange={(e) => setNouvelAvis({ ...nouvelAvis, note: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="5">⭐⭐⭐⭐⭐ (5/5) Excellent</option>
            <option value="4">⭐⭐⭐⭐☆ (4/5) Très bien</option>
            <option value="3">⭐⭐⭐☆☆ (3/5) Moyen</option>
            <option value="2">⭐⭐☆☆☆ (2/5) Décevant</option>
            <option value="1">⭐☆☆☆☆ (1/5) Mauvais</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-stone-700 mb-1">Votre commentaire</label>
          <textarea 
            required
            rows="3"
            placeholder="Qu'avez-vous pensé de la qualité du bijou, du rendu ou de la livraison ?"
            value={nouvelAvis.commentaire}
            onChange={(e) => setNouvelAvis({ ...nouvelAvis, commentaire: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          ></textarea>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={envoiEnCours}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-800 text-white text-xs font-semibold uppercase tracking-wide rounded-md hover:bg-amber-700 shadow-sm transition-all disabled:opacity-60"
          >
            <Send size={12} /> {envoiEnCours ? "Envoi..." : "Publier mon avis"}
          </button>
        </div>
      </form>
    </div>
  )}

  {/* CARROUSEL DES AVIS EXISTANTS (uniquement les avis réels approuvés) */}
  {!avisLoading && avisListe.length === 0 && (
    <p className="text-sm text-stone-400 italic">Aucun avis publié pour le moment.</p>
  )}
  <div className="flex gap-5 overflow-x-auto  pt-1 no-scrollbar snap-x snap-mandatory">
    {avisListe.map((item) => (
      <div
        key={item._id}
        className="w-80 shrink-0 snap-start bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-stone-900 text-xs">{item.nom}</span>
            <span className="text-[10px] text-stone-400">{new Date(item.createdAt).toLocaleDateString('fr-FR')}</span>
          </div>

          <div className="flex text-amber-500 mb-3 drop-shadow-sm">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} className={i < item.note ? "fill-amber-500" : "text-stone-200"} />
            ))}
          </div>

          <p className="text-xs text-stone-600 leading-relaxed italic">
            "{item.commentaire}"
          </p>
        </div>

        {item.verifie && (
          <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
            <CheckCircle size={10} /> Achat vérifié
          </div>
        )}
      </div>
    ))}
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
  ) : (
    <div className='text-center py-40 text-stone-400 text-sm italic animate-pulse'>
      Recherche de la création exclusive...
    </div>
  );
};

export default PageProduit;