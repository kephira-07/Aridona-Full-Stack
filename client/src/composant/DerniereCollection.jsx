import { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';
import ProduitItem from './ProduitItem';

const DerniereCollection = () => {
  const { produits } = useContext(ShopContext);
  const [dernierProduit, setDernierProduit] = useState([]);

  useEffect(() => {
    if (produits && produits.length > 0) {
      // Inversion pour afficher les nouveautés en premier et sélection des 8 derniers articles
      const nouveautes = [...produits].reverse();
      setDernierProduit(nouveautes.slice(0, 8)); 
    }
  }, [produits]); 

  return (
    <section className='bg-white py-8'>
      <div className='text-center text-2xl sm:text-3xl pb-6 px-4'>
        <Titre text1='Nouveautés' text2='Dernière collection' />
        
        {/* 🎯 PARAGRAPHE CLÉ OPTIMISÉ POUR LA CONFORMITÉ GOOGLE OAUTH */}
        <p className='max-w-2xl mx-auto text-xs sm:text-sm font-dmsans text-stone-600 mt-2 leading-relaxed'>
          Explorez nos derniers <strong className='font-medium text-stone-800'>bijoux en acier inoxydable 316L</strong>. 
          Commandez vos bagues, colliers et bracelets directement en ligne et bénéficiez de notre <strong className='font-medium text-amber-700'>livraison express en moins de 30 minutes</strong>.
        </p>
      </div>

      {/* Grille de produits responsive (2 colonnes sur mobile, 3 sur tablette, 4 sur desktop) */}
      <div className='max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6'>
        {
          dernierProduit.map((item, index) => (
            <ProduitItem 
              key={item._id || index} 
              id={item._id} 
              slug={item.slug}    
              image={item.image}  
              nom={item.nom} 
              prix={item.prix} 
            />
          ))
        }
      </div>
    </section>
  );
};

export default DerniereCollection;