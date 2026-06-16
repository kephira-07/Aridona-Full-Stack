import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config'; 
import Titre from './Titre';
import { default as ProduitItem } from './ProduitItem'; // Changement ici si l'export est par défaut

const MeilleurVente = () => {
  const [meilleurVente, setMeilleurVente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeilleuresVentes = async () => {
      try {
        setLoading(true);
        // 🛰️ On appelle la liste complète des produits
        const response = await axios.get(`${backendUrl}/api/produit/list`);
        
        if (response.data.success) {
          // On s'assure de récupérer le bon tableau (parfois nommé 'produits' ou 'products')
          const produitsBruts = response.data.produits || response.data.products || [];
          
          // 🛠️ LA CORRECTION EST ICI :
          // On teste 'bestseller' ET 'meilleurVente' sous forme de booléen OU de texte "true"
          const topProduits = produitsBruts.filter(p => 
            p.bestseller === true || 
            p.bestseller === "true" || 
            p.meilleurVente === true || 
            p.meilleurVente === "true"
          );
          
          // On ne garde que les 5 premiers bijoux pour le design de la page d'accueil
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

  if (loading) {
    return <div className="text-center py-20 text-stone-400 text-sm italic">Chargement de la sélection exclusive...</div>;
  }

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
            {meilleurVente.length === 0 ? (
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
                  nom={item.nom || item.name} // Sécurité si le nom est en anglais dans la BDD      
                  prix={item.prix || item.price} // Sécurité pour le prix   
                />
              ))
            )}
        </div>
    </div>
  );
};

export default MeilleurVente;