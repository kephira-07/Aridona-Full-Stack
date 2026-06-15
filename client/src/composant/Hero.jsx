import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import im1 from '../assets/im1.jpg'; 
import img2 from '../assets/img2.jpg';
import img3 from '../assets/img3.jpg';
import img5 from '../assets/img5.jpg';
import img6 from '../assets/img6.jpg';
import img7 from '../assets/img7.jpg';
import img8 from '../assets/img8.jpg'; 
import Boutton from './Boutton';

// --- COMPOSANT CARROUSSEL (Version Mobile) ---

const Caroussel = ({ children, autoSlide = true, autoSlideInterval = 3000 }) => {
  const [curr, setCurr] = useState(0);
  
  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  const prev = useCallback(() => {
    setCurr((curr) => (curr === 0 ? totalSlides - 1 : curr - 1));
  }, [totalSlides]);

  const next = useCallback(() => {
    setCurr((curr) => (curr === totalSlides - 1 ? 0 : curr + 1));
  }, [totalSlides]);

  useEffect(() => {
    if (!autoSlide || totalSlides <= 1) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval, next, totalSlides]); 

  if (totalSlides === 0) return null;

  return (
    // On s'assure que la racine est un bloc bien isolé
    <div className="overflow-hidden relative w-full h-full block">
      
      {/* Conteneur de défilement : w-full est crucial ici */}
      <div 
        className="flex transition-transform ease-out duration-500 h-full w-full" 
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {slides.map((slide, index) => (
          // La div ci-dessous DOIT faire exactement 100% de la largeur du parent, sans déborder
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            {slide}
          </div>
        ))}
      </div>
      
      {/* Contrôles */}
      {totalSlides > 1 && (
        <div className="absolute inset-0 flex items-center justify-between p-3 pointer-events-none z-20">
          <button 
            className="p-1 rounded-full bg-white/80 text-amber-950 pointer-events-auto shadow-sm hover:bg-white" 
            onClick={prev}
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            className="p-1 rounded-full bg-white/80 text-amber-950 pointer-events-auto shadow-sm hover:bg-white" 
            onClick={next}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};



// --- COMPOSANT HERO PRINCIPAL ---
export default function Hero() {
  const images = [
    { id: 1, src: img2, title: 'Bague Éclat Éternel' },
    { id: 2, src: img3, title: 'Alliance Or Pur' },
    { id: 3, src: img5, title: 'Collier Signature Arilona' },
    { id: 4, src: img6, title: 'Bracelet Jonc Fin' },
    { id: 5, src: img7, title: 'Boucles d\'Oreilles Élégance' },
    { id: 6, src: img8, title: 'Parure Prestige' },
    {id: 7, src: im1, title: 'Bague Éclat Éternel' },
  ];

  return (  
    <main className="w-full bg-[#fffaf5] pt-16 md:pt-26 ">
      <div className="max-w-10xl mx-auto ">
        
        {/* --- RETOUR DE LA GRILLE PC (Fluide et adaptative) --- */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-1 w-full md:aspect-18/5">
  
  {/* 1. GRANDE IMAGE GAUCHE (Prend 2 colonnes de large et 2 lignes de haut -> 50% de la grille) */}
            <div className="col-span-2 row-span-2 relative  overflow-hidden group shadow-sm">
              <img 
                src={images[0].src} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103" 
                alt={images[0].title} 
              />
              
              {/* Dégradé immersif du bas vers le haut */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
              
              {/* Contenu et Bouton posés SUR l'image */}
              <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center text-center z-10">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-2">
                  Nouvelle Collection
                </span>
                <h2 className="text-2xl lg:text-3xl font-serif font-light text-white mb-5">
                  {images[0].title}
                </h2>
                <Link to="/collection" className="transition-transform duration-300 hover:scale-105">
                  <Boutton textb="Visiter la boutique" />
                </Link>
              </div>
            </div>

            {/* 2. IMAGE HAUTE MILIEU (Prend 1 colonne de large, 1 ligne de haut) */}
            <div className="col-span-1 row-span-1 relative  overflow-hidden group shadow-sm">
              <img src={images[1].src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={images[1].title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* 3. GRANDE IMAGE DROITE (Prend 1 colonne de large, mais s'étire sur les 2 lignes de haut pour équilibrer le côté droit) */}
            <div className="col-span-1 row-span-2 relative  overflow-hidden group shadow-sm">
              <img src={images[2].src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={images[2].title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* 4. IMAGE BASSE MILIEU (Prend 1 colonne de large, 1 ligne de haut. Elle glisse automatiquement sous l'image 2) */}
            <div className="col-span-1 row-span-1 relative  overflow-hidden group shadow-sm">
              <img src={images[3].src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={images[3].title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

          </div>

        {/* --- APPAREILS MOBILES (Reste inchangé et sécurisé) --- */}
        <div className="md:hidden w-full relative  overflow-hidden shadow-md aspect-[4/5] mt-4">
       <Caroussel autoSlide={true} autoSlideInterval={3500}>
            {images.map((image) => (
              <img 
                key={image.id} 
                src={image.src} 
                alt={image.title} 
                // min-w-full est indispensable pour forcer l'image à occuper tout l'écran du carrousel
                className="min-w-full h-full object-cover flex-shrink-0" 
              />
            ))}
          </Caroussel>

         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>

          <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center z-10">
            <h2 className="text-xl font-serif text-white mb-4 tracking-wide">
              {images[0].title}
            </h2>
            <Link to="/collection" className="w-full max-w-xs">
              <Boutton textb="Visiter la boutique" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}