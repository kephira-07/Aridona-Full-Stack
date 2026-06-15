import { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';
import ProduitItem from './ProduitItem';

const DerniereCollection = () => {
  const { produits } = useContext(ShopContext);
  const [dernierProduit, setDernierProduit] = useState([]);

  useEffect(() => {
    if (produits && produits.length > 0) {
      // 🛠️ OPTIMISATION : On inverse le tableau pour avoir les nouveautés en premier,
      // puis on limite STRICTEMENT à 8 produits pour l'esthétique de la grille.
      const nouveautes = [...produits].reverse();
      setDernierProduit(nouveautes.slice(0, 8)); 
    }
  }, [produits]); 

  return (
    <div className='bg-white py-12'>
      <div className='text-center text-3xl pb-8'>
        <Titre text1='Découvrez notre' text2='Dernière collection' />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-stone-500 font-light mt-2 italic'>
          Voici nos nouvelles créations exclusives, façonnées avec passion pour sublimer votre élégance.
        </p>
      </div>

      {/* Grille de produits : Changée à grid-cols-4 pour un alignement parfait de 8 articles (2x4) */}
      <div className='max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-8'>
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
    </div>
  );
};

export default DerniereCollection;