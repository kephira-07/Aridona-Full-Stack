import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';
import PackCard from '../composant/PackCard';
import axios from 'axios';

export default function PacksSection() {
  const { backendUrl } = useContext(ShopContext);
  const [packs, setPacks] = useState([]);

  useEffect(() => {
    let active = true;
    axios.get(`${backendUrl}/api/packs`)
      .then(({ data }) => { if (active && data.success) setPacks(data.packs || []); })
      .catch((error) => console.error('Erreur lors du chargement des packs:', error.message));
    return () => { active = false; };
  }, [backendUrl]);

  if (!packs.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#FBF9F5] py-16 sm:py-24 border-y border-amber-900/10" aria-labelledby="packs-title">
      {/* Éléments de fond décoratifs luxueux et discrets */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-stone-200/40 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* En-tête de section raffiné */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/5 px-3.5 py-1 text-xs font-medium tracking-wider text-amber-900 border border-amber-900/10">
              <span>Offres Exclusives</span>
            </div>
            
            <Titre text1="Découvrez" text2="Nos Packs" />
            
            <p id="packs-title" className="max-w-xl text-sm leading-relaxed text-stone-600 font-light">
              Des parures de bijoux harmonieuses réunies dans une seule offre à prix d'exception. Le raffinement à porter ou à offrir à Lomé et partout au Togo.
            </p>
          </div>

          <Link 
            to="/packs" 
            className="group inline-flex items-center gap-3 rounded-full bg-amber-900 px-6 py-3 text-xs font-medium uppercase tracking-widest text-white shadow-sm transition-all duration-300 hover:bg-amber-950 hover:shadow-md"
          >
            <span>Découvrir tous les packs</span>
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>

        {/* Grille des packs */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
          {packs.slice(0, 3).map((pack) => (
            <div key={pack._id} className="transition-all duration-300 hover:-translate-y-1">
              <PackCard pack={pack} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}