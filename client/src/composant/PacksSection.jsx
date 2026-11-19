import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';
import PackCard from '../composant/PackCard';
import axios from 'axios';

export default function PacksSection() {
  const { backendUrl } = useContext(ShopContext);
  const [packs, setPacks] = useState([]);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let active = true;
    axios.get(`${backendUrl}/api/packs`)
      .then(({ data }) => { if (active && data.success) setPacks(data.packs || []); })
      .catch((error) => console.error('Erreur lors du chargement des packs:', error.message));
    return () => { active = false; };
  }, [backendUrl]);

  const updateScrollButtons = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [packs]);

  const scrollByAmount = (direction) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.clientWidth || 320;
    const offset = direction === 'left' ? -(cardWidth + 24) : cardWidth + 24;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!packs.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#FBF9F5] py-14 sm:py-20 border-y border-amber-900/10" aria-labelledby="packs-title">
      {/* Éléments de fond décoratifs luxueux et discrets */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-stone-200/40 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* En-tête de section + Flèches de navigation du carrousel */}
        <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/5 px-3.5 py-1 text-xs font-medium tracking-wider text-amber-900 border border-amber-900/10">
              <span>Offres Exclusives</span>
            </div>
            
            <Titre text1="Découvrez" text2="Nos Packs" />
            
            <p id="packs-title" className="max-w-xl text-sm leading-relaxed text-stone-600 font-light">
              Des parures de bijoux harmonieuses réunies dans une seule offre à prix d'exception. Le raffinement à porter ou à offrir à Lomé et partout au Togo.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            {/* Boutons flèches précédent / suivant (visibles sur mobile et PC) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByAmount('left')}
                disabled={!canScrollLeft}
                aria-label="Pack précédent"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-800 shadow-xs transition-all hover:border-amber-900 hover:bg-amber-900 hover:text-white disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount('right')}
                disabled={!canScrollRight}
                aria-label="Pack suivant"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-800 shadow-xs transition-all hover:border-amber-900 hover:bg-amber-900 hover:text-white disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <Link 
              to="/packs" 
              className="hidden sm:inline-flex group items-center gap-2.5 rounded-full bg-amber-900 px-6 py-3 text-xs font-medium uppercase tracking-widest text-white shadow-sm transition-all duration-300 hover:bg-amber-950 hover:shadow-md"
            >
              <span>Voir plus</span>
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Carrousel horizontal (Mobile & PC) avec snap fluide */}
        <div
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 pt-1 no-scrollbar"
        >
          {packs.map((pack) => (
            <div
              key={pack._id}
              className="w-[85%] sm:w-[46%] lg:w-[31.5%] shrink-0 snap-start transition-all duration-300"
            >
              <PackCard pack={pack} />
            </div>
          ))}

          {/* Carte finale "Voir tous les packs" intégrée à la fin du carrousel */}
          <Link
            to="/packs"
            className="w-[75%] sm:w-[40%] lg:w-[26%] shrink-0 snap-start flex flex-col items-center justify-center gap-4 border border-dashed border-amber-900/30 bg-white/70 hover:bg-white hover:border-amber-900 p-8 text-center transition-all duration-300 group min-h-[340px]"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-900/10 text-amber-900 transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-900 group-hover:text-white">
              <ArrowRight size={22} />
            </div>
            <div className="space-y-1.5">
              <p className="font-ebgaramond text-2xl font-medium text-stone-900">
                Voir tous nos packs
              </p>
              <p className="text-xs text-stone-500 font-light max-w-[200px]">
                Découvrez l'ensemble de nos coffrets et parures à prix réduit
              </p>
            </div>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-900 group-hover:underline">
              Voir plus ({packs.length})
            </span>
          </Link>
        </div>

        {/* Bouton "Voir plus" centré en bas (toujours bien visible sur Mobile & PC) */}
        <div className="mt-8 flex justify-center">
          <Link 
            to="/packs" 
            className="group inline-flex items-center gap-3 rounded-full bg-amber-900 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white shadow-sm transition-all duration-300 hover:bg-amber-950 hover:shadow-md active:scale-95"
          >
            <span>Voir plus — Tous les packs disponibles</span>
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
