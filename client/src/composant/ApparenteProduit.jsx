import React, { useContext, useEffect, useState } from 'react';
import Titre from './Titre';
import { ShopContext } from '../context/ShopContext';
import ProduitItem from './ProduitItem';

const ApparenteProduit = ({ categorie, matiere, actuelId }) => {
  const { produits } = useContext(ShopContext);
  const [apparente, setApparente] = useState([]);

  useEffect(() => {
    if (produits && produits.length > 0) {
      const actuelIdStr = String(actuelId || '');

      // Helper pour extraire la chaîne d'ID de catégorie (compatible objet ou ID direct)
      const getCategoryId = (cat) => {
        if (!cat) return '';
        return String(cat._id || cat.id || cat);
      };

      const targetCategorieId = getCategoryId(categorie);

      // 1. Filtrer pour exclure la création actuellement affichée
      const autresProduits = produits.filter(
        (item) => String(item._id || item.id) !== actuelIdStr
      );

      // 2. Niveau 1 : Même catégorie ET même matière
      let suggestions = autresProduits.filter((item) => {
        const itemCatId = getCategoryId(item.categorie);
        const memeCategorie = targetCategorieId && itemCatId === targetCategorieId;
        const memeMatiere = matiere && item.matiere === matiere;
        return memeCategorie && memeMatiere;
      });

      // 3. Niveau 2 (Fallback) : Compléter avec les bijoux de la même catégorie
      if (suggestions.length < 5 && targetCategorieId) {
        const complementsCategorie = autresProduits.filter((item) => {
          const itemCatId = getCategoryId(item.categorie);
          const estMemeCategorie = itemCatId === targetCategorieId;
          const dejaPresent = suggestions.some(
            (s) => String(s._id || s.id) === String(item._id || item.id)
          );
          return estMemeCategorie && !dejaPresent;
        });

        suggestions = [...suggestions, ...complementsCategorie];
      }

      // 4. Niveau 3 (Fallback Global) : Compléter avec les autres créations du catalogue si < 5
      if (suggestions.length < 5) {
        const complementsGeneraux = autresProduits.filter((item) => {
          return !suggestions.some(
            (s) => String(s._id || s.id) === String(item._id || item.id)
          );
        });

        suggestions = [...suggestions, ...complementsGeneraux];
      }

      // 5. Retenir exactement les 5 meilleures créations
      setApparente(suggestions.slice(0, 5));
    }
  }, [produits, categorie, matiere, actuelId]);

  // Si aucune suggestion n'est disponible, on n'affiche rien
  if (apparente.length === 0) return null;

  return (
    <section className='my-10 bg-stone-50/40 py-8 border-t border-b border-stone-100/60'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        
        {/* En-tête épuré */}
        <div className='text-center pb-8'>
          <div className='text-2xl sm:text-3xl tracking-wide'>
            <Titre text1={'Créations'} text2={'Similaires'} />
          </div>
          <p className='w-full sm:w-3/4 md:w-1/2 mx-auto text-xs sm:text-sm text-stone-500 font-light mt-2 italic leading-relaxed'>
            Des designs complémentaires façonnés dans le même esprit d'exception pour parfaire votre parure.
          </p>
        </div>
        
        {/* Grille des produits associés */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'>
          {apparente.map((item) => {
            const produitId = item._id || item.id;
            return (
              <ProduitItem
                key={produitId}
                id={produitId}
                slug={item.slug}
                image={item.image}
                nom={item.nom || item.name}
                prix={item.prix || item.price}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default ApparenteProduit;