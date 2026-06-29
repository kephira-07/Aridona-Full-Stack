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
        
        // 🛰️ IDÉAL : Remplacer par '${backendUrl}/api/produit/bestsellers' si tu modifies ton backend (voir étape 2)
        const response = await axios.get(`${backendUrl}/api/produit/list`);
        
        if (response.data.success) {
          const produitsBruts = response.data.produits || response.data.products || [];
          
          // Filtrage côté client (temporaire en attendant l'étape 2)
          const topProduits = produitsBruts.filter(p => 
            p.bestseller === true || 
            p.bestseller === "true" || 
            p.meilleurVente === true || 
            p.meilleurVente === "true"
          );
          
          // On garde les 8 premiers produits
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
    <div className="bg-white py-12">
        {/* En-tête de section luxueux */}
        <div className='text-center text-3xl pb-8'>
            <Titre text1='Découvrez notre' text2='Meilleure vente' />
            <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-stone-500 font-light mt-2 italic'>
                L'excellence signée Arilona : les créations les plus plébiscitées et convoitées de notre collection.
            </p>
        </div>
        
        {/* Grille de produits */}
        <div className='max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-8'>
            {loading ? (
              // 🌟 SQUELETTES DE CHARGEMENT ANIMÉS : S'affichent instantanément pendant l'appel API
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col animate-pulse">
                  <div className="bg-stone-200 aspect-square w-full rounded-md" />
                  <div className="h-4 bg-stone-200 rounded-sm w-3/4 mt-3" />
                  <div className="h-3 bg-stone-200 rounded-sm w-1/4 mt-2" />
                </div>
              ))
            ) : meilleurVente.length === 0 ? (
              <p className="col-span-full text-center text-stone-400 text-xs py-10 border border-dashed border-stone-100 italic">
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
    </div>
  );
};

export default MeilleurVente;