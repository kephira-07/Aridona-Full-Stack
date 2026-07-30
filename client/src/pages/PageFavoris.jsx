import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Trash2, ShoppingBag, Heart, ArrowRight, Plus } from 'lucide-react'
import BoutonRetour from '../composant/BoutonRetour'
import Titre from '../composant/Titre'

const PageFavoris = () => {
  const { produits, monnaie, favoris, toggleFavori,  ajouterTousLesFavorisAuPanier } = useContext(ShopContext);
  const navigate = useNavigate();

  // Filtrer les produits favoris
  const produitsFavoris = produits.filter((item) => favoris.includes(item._id || item.id));

  // --- SÉCURISATION DU FORMAT IMAGE (Gère Strings & Objets {url, publicId, alt}) ---
  const getFirstImage = (imgData) => {
    const first = Array.isArray(imgData) ? imgData[0] : imgData;
    if (!first) return { url: 'https://placehold.co/600x600?text=Aridona+Bijoux', alt: '' };
    return typeof first === 'object' && first?.url
      ? { url: first.url, alt: first.alt || '' }
      : { url: first, alt: '' };
  };

  // 🚀 ACTION GLOBALE : Ajoute tous les favoris en un seul bloc puis redirige
  const commanderTousLesFavoris = async () => {
    await ajouterTousLesFavorisAuPanier(produitsFavoris);
    navigate('/panier');
  };

  return (
    <div className='px-4 md:px-10 lg:px-20 min-h-[60vh] bg-white transition-opacity ease-in duration-500 opacity-100'>
      {/* Contenu personnalisé par visiteur (localStorage) — aucun intérêt à indexer, comme /panier */}
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <BoutonRetour />
      
      {/* --- En-tête --- */}
      <div className='flex flex-col items-center space-y-4'>
        <div className='text-center'>
          <h1 className='font-serif text-3xl md:text-4xl text-stone-800 tracking-tight flex items-center justify-center gap-3'>
            <Heart className='text-amber-700 fill-amber-700' size={28} />
            <Titre text1='' text2='Mes Favoris' />
          </h1>
          <p className='text-stone-500 font-light text-sm mt-2'>
            {produitsFavoris.length} {produitsFavoris.length > 1 ? 'articles sauvegardés' : 'article sauvegardé'}
          </p>
        </div>

        {/* 🌟 BOUTON UNIQUE GLOBAL */}
        {produitsFavoris.length > 0 && (
          <button 
            onClick={commanderTousLesFavoris}
            className='mt-4 flex items-center justify-center gap-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs md:text-sm tracking-widest py-3.5 px-8 shadow-lg hover:shadow-amber-700/20 active:scale-[0.98] transition-all uppercase cursor-pointer'
          >
            <ShoppingBag size={18} />
            Tout ajouter au panier et commander
            <ArrowRight size={18} />
          </button>
        )}
      </div>

      <hr className='border-stone-200 mb-10 mt-6' />

      {/* --- Grille des Favoris --- */}
      {produitsFavoris.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 text-center gap-4 animate-in fade-in duration-500'>
          <div className='w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-300'>
            <Heart size={32} strokeWidth={1} />
          </div>
          <p className='text-stone-500 font-alice text-lg italic'>Votre liste de favoris est encore vide.</p>
          <Link 
            to='/collection' 
            className='mt-2 bg-amber-800 text-white text-xs font-semibold tracking-widest py-3 px-8 hover:bg-amber-900 transition-colors uppercase'
          >
            Découvrir nos bijoux
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10'>
          {produitsFavoris.map((item) => {
            const idProduit = item._id || item.id;
            const { url: imageUrl, alt: imageAlt } = getFirstImage(item.image);

            return (
              <div 
                key={idProduit} 
                className='group relative border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col bg-stone-50/30'
              >
                {/* Bouton supprimer des favoris */}
                <button 
                  onClick={() => toggleFavori(idProduit)}
                  className='absolute top-3 right-3 z-10 bg-white/80 p-2 rounded-full text-stone-400 hover:text-red-500 backdrop-blur-sm shadow-sm transition-colors duration-200 cursor-pointer'
                  title="Retirer des favoris"
                >
                  <Trash2 size={16} />
                </button>

                {/* Image */}
                <Link to={`/produit/${item.slug || idProduit}`} className='aspect-square overflow-hidden bg-stone-50 block'>
                  <img
                    src={imageUrl}
                    alt={imageAlt || item.name || item.nom}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                </Link>

                {/* Info & Actions */}
                <div className='p-4 flex flex-col flex-grow bg-white justify-between space-y-3'>
                  <div>
                    <Link to={`/produit/${item.slug || idProduit}`}>
                      <h3 className='font-serif text-stone-800 text-base md:text-lg truncate tracking-tight hover:text-amber-800 transition-colors'>
                        {item.name || item.nom}
                      </h3>
                    </Link>
                    
                    <p className='mt-1 text-sm font-medium text-amber-900'>
                      {(item.prix || 0).toLocaleString()} {monnaie}
                    </p>
                  </div>

                  <div className='space-y-2 pt-2'>
                   

                    <Link 
                      to={`/produit/${item.slug || idProduit}`}
                      className='text-[11px] font-semibold text-stone-500 hover:text-stone-900 transition-colors underline block text-center'
                    >
                      Voir la fiche du bijou
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className='my-20' />
    </div>
  )
}

export default PageFavoris;