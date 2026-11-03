import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';
import PackCard from '../composant/PackCard'; // Assurez-vous que le chemin est correct
import axios from 'axios';

export default function PacksSection() {
  const { backendUrl } = useContext(ShopContext);
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    let active = true;
    axios.get(`${backendUrl}/api/packs`)
      .then(({ data }) => { if (active && data.success) setPacks(data.packs || []); })
      .catch(() => {});
    return () => { active = false; };
  }, [backendUrl]);

  if (!packs.length) return null;

  return (
    <section className="border-y border-stone-200/80  py-8 sm:py-12" aria-labelledby="packs-title">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-4">
        
        {/* En-tête de section */}
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Titre text1="Découvrez" text2="Nos Packs" />
            <p id="packs-title" className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
              Le cadeau tout trouvé, ou la silhouette complète en un seul geste : nos packs assemblent plusieurs pièces à un prix plus doux que si vous les achetiez séparément.
            </p>
          </div>
          <Link 
            to="/packs" 
            className="inline-flex items-center gap-2.5 border border-amber-900 bg-amber-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-xs transition-all mx-5 duration-300 hover:border-amber-900/30 hover:bg-amber-50/80 hover:text-amber-950 hover:shadow-md group"
          >
            <span>Découvrir tous les packs</span>
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grille des 3 packs principaux utilisant le composant PackCard */}
        {/* 2 colonnes seulement à partir de lg (1024px) : à md (tablette, 768-1023px), 2
            colonnes rendaient chaque carte plus étroite que sur mobile et écrasaient son
            contenu — une tablette garde donc 1 carte pleine largeur par ligne, comme le mobile. */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {packs.slice(0, 3).map((pack) => (
            <PackCard key={pack._id} pack={pack} />
          ))}
        </div>

      </div>
    </section>
  );
}