import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';
import ProduitItem from './ProduitItem';
import ProduitSkeleton from './ProduitSkeleton';

const DerniereCollection = () => {
  const { produits, isProductsLoading } = useContext(ShopContext);
  const [dernierProduit, setDernierProduit] = useState([]);

  useEffect(() => {
    if (produits && produits.length > 0) {
      // Inversion pour afficher les nouveautés en premier et sélection des 8 derniers articles
      const nouveautes = [...produits].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setDernierProduit(nouveautes.slice(0, 8)); 
    }
  }, [produits]); 

  return (
    <section className='bg-white py-8'>
      <div className='text-center text-2xl sm:text-3xl pb-6 px-4'>
        <Titre text1='Nouveautés' text2='Dernière collection' />
        
        <p className='max-w-2xl mx-auto text-xs sm:text-sm font-dmsans text-stone-600 mt-2 leading-relaxed'>
          Les toutes dernières pièces arrivées en boutique, en <strong className='font-medium text-stone-800'>acier inoxydable 316L</strong> — à découvrir avant qu'elles ne partent. <strong className='font-medium text-amber-700'>Livraison rapide, à Lomé et partout au Togo.</strong>
        </p>
      </div>

      {/* Grille de produits responsive (2 colonnes sur mobile, 3 sur tablette, 4 sur desktop) */}
      <div className='max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6'>
        {isProductsLoading && dernierProduit.length === 0
          ? Array.from({ length: 8 }).map((_, idx) => (
              <ProduitSkeleton key={'dernier-skel-' + idx} />
            ))
          : dernierProduit.map((item, index) => (
              <ProduitItem 
                key={item._id || index} 
                id={item._id} 
                slug={item.slug}    
                image={item.image}
                nom={item.nom}
                prix={item.prix}
                stock={item.stock}
                enStock={item.enStock}
              />
            ))
        }
      </div>

      <div className='mt-8 flex justify-center px-4'>
        <Link
          to='/collection'
          className='group inline-flex items-center gap-3 rounded-full bg-amber-900 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition-all duration-300 hover:bg-amber-950 hover:shadow-md active:scale-95'
        >
          <span>Voir toute la collection</span>
          <ArrowRight size={15} className='transition-transform duration-300 group-hover:translate-x-1.5' />
        </Link>
      </div>
    </section>
  );
};

export default DerniereCollection;
