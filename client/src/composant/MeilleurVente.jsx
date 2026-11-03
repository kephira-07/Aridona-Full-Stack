import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';
import { default as ProduitItem } from './ProduitItem';

const MeilleurVente = () => {
  const { produits } = useContext(ShopContext);
  const [meilleurVente, setMeilleurVente] = useState([]);

  // Filtre les pièces coups de cœur à partir des produits déjà chargés dans le contexte
  // (évite un second appel réseau vers /api/produit/list en plus de celui du contexte).
  useEffect(() => {
    const topProduits = (produits || []).filter(p =>
      p.bestseller === true ||
      p.bestseller === "true" ||
      p.meilleurVente === true ||
      p.meilleurVente === "true"
    );
    setMeilleurVente(topProduits.slice(0, 8));
  }, [produits]);

  const loading = produits.length === 0;

  return (
    <section className="bg-white py-10">
        {/* En-tête de section explicite pour Google OAuth */}
        <div className='text-center text-2xl sm:text-3xl pb-6 px-4'>
            <Titre text1='Nos Succès' text2='Meilleures Ventes' />
            
            <p className='max-w-2xl mx-auto text-xs sm:text-sm font-dmsans text-stone-600 mt-2 leading-relaxed'>
              Les bijoux que nos clientes recommandent le plus, en <strong className='font-medium text-stone-800'>acier inoxydable 316L</strong>. Faites confiance au choix du plus grand nombre. <strong className='font-medium text-amber-700'>Livraison rapide, à Lomé et partout au Togo.</strong>
            </p>
        </div>
        
        {/* Grille de produits aérée */}
        <div className='max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6'>
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col animate-pulse">
                  <div className="bg-stone-200 aspect-square w-full rounded-md" />
                  <div className="h-4 bg-stone-200 rounded-sm w-3/4 mt-3" />
                  <div className="h-3 bg-stone-200 rounded-sm w-1/4 mt-2" />
                </div>
              ))
            ) : meilleurVente.length === 0 ? (
              <p className="col-span-full text-center text-stone-400 text-xs py-10 border border-dashed border-stone-200 rounded-md italic">
                Aucune création n'est mise en avant pour le moment.
              </p>
            ) : (
              meilleurVente.map((item, index) => (
                <ProduitItem 
                  key={item._id || index} 
                  id={item._id}      
                  slug={item.slug}    
                  image={item.image}
                  nom={item.nom || item.name}
                  prix={item.prix || item.price}
                  enStock={item.enStock}
                  stock={item.stock}
                />
              ))
            )}
        </div>
    </section>
  );
};

export default MeilleurVente;