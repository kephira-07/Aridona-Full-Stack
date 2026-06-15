import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingBag, Heart } from 'lucide-react'
import BoutonRetour from '../composant/BoutonRetour'

const PageFavoris = () => {
  const { produits, monnaie, favoris, toggleFavori } = useContext(ShopContext);

  // Filtrer les produits pour ne garder que ceux qui sont dans les favoris
  const produitsFavoris = produits.filter((item) => favoris.includes(item._id));

  return (
    <div className='mt-24 md:mt-32 px-4 md:px-10 lg:px-20 min-h-[60vh] bg-white transition-opacity ease-in duration-500 opacity-100'>
      <BoutonRetour/>
      
      {/* --- En-tête de la page --- */}
      <div className='text-center my-10'>
        <h1 className='font-serif text-3xl md:text-4xl text-stone-800 tracking-tight flex items-center justify-center gap-3'>
          <Heart className='text-amber-700 fill-amber-700' size={28} />
          Mes Favoris
        </h1>
        <p className='text-stone-500 font-light text-sm mt-2'>
          {produitsFavoris.length} {produitsFavoris.length > 1 ? 'articles sauvegardés' : 'article sauvegardé'}
        </p>
      </div>

      <hr className='border-stone-200 mb-10' />

      {/* --- Contenu Principal --- */}
      {produitsFavoris.length === 0 ? (
        // État vide si aucun favori
        <div className='flex flex-col items-center justify-center py-20 text-center gap-4 animate-in fade-in duration-500'>
          <div className='w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-300'>
            <Heart size={32} strokeWidth={1} />
          </div>
          <p className='text-stone-500 font-alice text-lg italic'>Votre liste de favoris est encore vide.</p>
          <Link 
            to='/collection' 
            className='mt-2 bg-stone-950 text-white text-xs font-semibold tracking-widest py-3 px-8 rounded-xl hover:bg-stone-900 transition-colors uppercase'
          >
            Découvrir nos bijoux
          </Link>
        </div>
      ) : (
        // Grille des Favoris
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-10'>
          {produitsFavoris.map((item) => (
            <div 
              key={item._id} 
              className='group relative border border-stone-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col bg-stone-50/30'
            >
              {/* Bouton pour supprimer des favoris */}
              <button 
                onClick={() => toggleFavori(item._id)}
                className='absolute top-3 right-3 z-10 bg-white/80 p-2 rounded-full text-stone-400 hover:text-red-500 backdrop-blur-sm shadow-sm transition-colors duration-200'
                title="Retirer des favoris"
              >
                <Trash2 size={16} />
              </button>

              {/* Image du produit avec lien vers sa page */}
              <Link to={`/produit/${item.slug}`} className='aspect-square overflow-hidden bg-stone-50 block'>
                <img 
                  src={item.image[0]} 
                  alt={item.name} 
                  className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                />
              </Link>

              {/* Infos Produit */}
              <div className='p-4 flex flex-col flex-grow bg-white'>
                <Link to={`/produit/${item.slug}`}>
                  <h3 className='font-serif text-stone-800 text-base md:text-lg truncate tracking-tight hover:text-amber-800 transition-colors'>
                    {item.name}
                  </h3>
                </Link>
                
                <p className='mt-1 text-sm font-medium text-amber-900'>
                  {item.prix.toLocaleString()} {monnaie}
                </p>

                {/* Bouton pour voir le produit directement sur mobile */}
                <Link 
                  to={`/produit/${item.slug}`}
                  className='mt-4 w-full flex items-center justify-center gap-2 text-[11px] font-semibold tracking-wider bg-stone-950 text-white py-3 rounded-lg hover:bg-stone-900 active:scale-[0.98] transition-all uppercase duration-200'
                >
                  <ShoppingBag size={14} />
                  Voir l'article
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className='my-20' />
    </div>
  )
}

export default PageFavoris