import React, { useContext, useEffect, useState } from 'react';
import Titre from './Titre';
import { ShopContext } from '../context/ShopContext';
import ProduitItem from './ProduitItem';

// 🛠️ On ajoute "actuelId" pour ne pas suggérer le produit que le client regarde déjà
const ApparenteProduit = ({ categorie, matiere, actuelId }) => {
  const { produits } = useContext(ShopContext);
  const [apparente, setApparente] = useState([]);

  useEffect(() => {
    if (produits && produits.length > 0) {
      
      // 1. On filtre d'abord pour retirer le produit actuellement affiché
      const autresProduits = produits.filter((item) => item._id !== actuelId);

      // 2. Premier niveau : Même catégorie ET Même matière
      let suggestions = autresProduits.filter(
        (item) => item.categorie === categorie && item.matiere === matiere
      );

      // 3. Fallback intelligent : Si on a moins de 5 résultats, on complète avec des bijoux de la même catégorie
      if (suggestions.length < 5) {
        const complémentsCategorie = autresProduits.filter(
          (item) => item.categorie === categorie && !suggestions.find(s => s._id === item._id)
        );
        // On fusionne les deux listes
        suggestions = [...suggestions, ...complémentsCategorie];
      }

      // 4. On garde précisément les 5 meilleures suggestions
      setApparente(suggestions.slice(0, 5));
    }
  }, [produits, categorie, matiere, actuelId]);

  // Si aucun produit similaire n'est trouvé après les filtres, on cache élégamment la section
  if (apparente.length === 0) return null;

  return (
    <div className='my-24 bg-stone-50/40 py-12 border-t border-b border-stone-100/60'>
      <div className='max-w-7xl mx-auto px-4'>
        
        {/* En-tête épuré */}
        <div className='text-center text-3xl pb-10'>
          <Titre text1={'Créations'} text2={'Similaires'} />
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-stone-500 font-light mt-2 italic'>
            Des designs complémentaires façonnés dans le même esprit d'exception pour parfaire votre parure.
          </p>
        </div>
        
        {/* Grille de produits aux espacements professionnels */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-8'>
          {apparente.map((item, index) => (
            <ProduitItem
              key={index}
              id={item._id}
              slug={item.slug}     // 🛠️ Ajout du slug pour les URLs clean
              image={item.image}   // 🛠️ Envoi du tableau entier (sécurité interne)
              nom={item.nom}
              prix={item.prix}     // 🛠️ Correction de price -> prix
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default ApparenteProduit;