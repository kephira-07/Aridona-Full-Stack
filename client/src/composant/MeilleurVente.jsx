import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config'; 
import Titre from './Titre';
import { default as ProduitItem } from './ProduitItem'; 

const MeilleurVente = () => {
  const [meilleurVente, setMeilleurVente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeilleuresVentes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/produit/list`);
        
        if (response.data.success) {
          const produitsBruts = response.data.produits || response.data.products || [];
          
          // Filtrage côté client pour récupérer les pièces coups de cœur
          const topProduits = produitsBruts.filter(p => 
            p.bestseller === true || 
            p.bestseller === "true" || 
            p.meilleurVente === true || 
            p.meilleurVente === "true"
          );
          
          setMeilleurVente(topProduits.slice(0, 8));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des meilleures ventes:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeilleuresVentes();
  }, []);

  return (
    <section className="bg-white py-10">
        {/* En-tête de section explicite pour Google OAuth */}
        <div className='text-center text-2xl sm:text-3xl pb-6 px-4'>
            <Titre text1='Nos Succès' text2='Meilleures Ventes' />
            
            {/* 🎯 DESCRIPTIF CONCRET & CLAIR */}
            <p className='max-w-2xl mx-auto text-xs sm:text-sm font-dmsans text-stone-600 mt-2 leading-relaxed'>
              Découvrez nos <strong className='font-medium text-stone-800'>bijoux en acier inoxydable 316L</strong> les plus demandés. Sélectionne tes bagues, bracelets et colliers favoris et profite d'une <strong className='font-medium text-amber-700'>livraison express à domicile en moins de 30 minutes</strong>.
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
                />
              ))
            )}
        </div>
    </section>
  );
};

export default MeilleurVente;