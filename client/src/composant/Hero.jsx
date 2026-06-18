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

// --- SUB COMPOSANT : EFFET ÉCRITURE MACHINE (PC Pop-Box) ---
const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => text.substring(0, prev.length + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 45); // Vitesse d'écriture fluide

    return () => clearInterval(interval);
  }, [text]);

  return <span className="after:content-['|'] after:animate-ping after:ml-0.5">{displayedText}</span>;
};

// --- COMPOSANT CARROUSSEL (Version Mobile) ---
const Caroussel = ({ children, autoSlide = true, autoSlideInterval = 3500, onChange }) => {
  const [curr, setCurr] = useState(0);
  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  const prev = useCallback(() => {
    const nextIndex = curr === 0 ? totalSlides - 1 : curr - 1;
    setCurr(nextIndex);
    if (onChange) onChange(nextIndex);
  }, [curr, totalSlides, onChange]);

  const next = useCallback(() => {
    const nextIndex = curr === totalSlides - 1 ? 0 : curr + 1;
    setCurr(nextIndex);
    if (onChange) onChange(nextIndex);
  }, [curr, totalSlides, onChange]);

  useEffect(() => {
    if (!autoSlide || totalSlides <= 1) return;
    const slideInterval = setInterval(next, autoSlideInterval);
    return () => clearInterval(slideInterval);
  }, [autoSlide, autoSlideInterval, next, totalSlides]); 

  if (totalSlides === 0) return null;

  return (
    <div className="overflow-hidden relative w-full h-full block">
      <div 
        className="flex transition-transform ease-out duration-700 h-full w-full" 
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            {slide}
          </div>
        ))}
      </div>
      
      {totalSlides > 1 && (
        <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none z-20">
          <button 
            className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white pointer-events-auto shadow-lg hover:bg-amber-600 transition-all duration-300" 
            onClick={prev}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white pointer-events-auto shadow-lg hover:bg-amber-600 transition-all duration-300" 
            onClick={next}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- COMPOSANT HERO PRINCIPAL ---
export default function Hero() {
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [currentPcSlide, setCurrentPcSlide] = useState(0);

  const images = [
    { id: 1, src: img2, title: 'Bague Éclat Éternel' },
    { id: 2, src: img3, title: 'Alliance Or Pur' },
    { id: 3, src: img5, title: 'Bijoux en acier inoxydable' }, // Image focus fixe (index 2)
    { id: 4, src: img6, title: 'Bracelet Jonc Fin' },
    { id: 5, src: img7, title: "Boucles d'Oreilles Élégance" },
    { id: 6, src: img8, title: 'Parure Prestige' },
    { id: 7, src: im1, title: 'Bague Éclat Éternel' },
  ];

  // Images qui défilent à droite sur PC (on retire l'image principale index 2 pour éviter les doublons)
  const slidingPcImages = [
    images[0],
    images[1],
    images[3],
    images[4],
    images[5],
    images[6]
  ];

  // Gestion du défilement automatique de la Pop-Box sur PC
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPcSlide((prev) => (prev === slidingPcImages.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [slidingPcImages.length]);

  return (  
    <main className="w-full bg-[#fffaf5] pt-16 md:pt-24 overflow-hidden ">
      <div className="max-w-10xl mx-auto">
    
        {/* ================= DESIGN PC ÉPURÉ & PRESTIGE ================= */}
        <div className="hidden md:grid grid-cols-2 w-full md:aspect-[18/5.5] lg:aspect-[18/8.5]">
                        
              <div className="relative overflow-hidden group shadow-md border border-stone-200/40 bg-stone-900 flex items-center justify-center"> {/* AJOUT : flex, items-center, justify-center */}
                <img 
                  src={images[2].src} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103" 
                  alt={images[2].title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"></div>
                
                {/* MODIFICATION : Changement de bottom-90 à flex flex-col items-center */}
                <div className="absolute inset-x-0 p-5 flex flex-col items-center text-center z-10"> {/* SUPPRESSION : bottom-90 */}
                  <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-semibold mb-2 animate-pulse">
                    Nouvelle Collection
                  </span>
                  <h2 className="text-2xl lg:text-5xl font-serif font-light text-white mb-8 md:mb-12 tracking-wide max-w-md leading-tight"> {/* AJOUT : mb-8 md:mb-12 pour espacer sur mobile */}
                    {images[2].title}
                  </h2>
                  
                  <Link to="/collection" className="relative group/btn inline-block transform transition-all duration-300 hover:scale-102 active:scale-98">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl blur opacity-40 group-hover/btn:opacity-70 transition duration-500"></div>
                    <div className="relative shadow-xl rounded-xl overflow-hidden">
                      <Boutton textb="Visiter la boutique" />
                    </div>
                  </Link>
                </div>
                </div>

          {/* 2. LA POP-BOX DYNAMIQUE (DROITE) */}
          <div className="relative overflow-hidden shadow-md border border-stone-200/40 bg-stone-950 group">
            
            {/* Diapositives en fondu croisé */}
            {slidingPcImages.map((img, index) => (
              <div
                key={img.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentPcSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img 
                  src={img.src} 
                  className="w-full h-full object-cover transition-transform duration-[4500ms] ease-out scale-100 group-hover:scale-105" 
                  alt={img.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              </div>
            ))}

            {/* Contenu textuel avec effet machine à écrire */}
           <div className="absolute inset-x-0 p-10 flex flex-col items-start text-left z-20 pointer-events-none"> {/* SUPPRESSION : bottom-150 */}
                <span className="text-[9px] uppercase tracking-[0.25em] text-amber-400 font-medium mb-2">
                  Focus Création
                </span>
                
                <h3 className="text-xl lg:text-5xl font-serif font-light text-stone-100 tracking-wide min-h-[3.5rem] leading-snug">
                  {slidingPcImages.map((img, index) => 
                    index === currentPcSlide && (
                      <TypewriterText key={img.id} text={img.title} />
                    )
                  )}
                </h3>
                
                <span className="text-[11px] font-sans font-light text-stone-400 tracking-widest uppercase mt-1">
                  Découvrir la pièce →
                </span>
              </div>

                        {/* Indicateurs de lignes discrets en haut à droite */}
            <div className="absolute top-6 right-6 flex gap-1.5 z-20">
              {slidingPcImages.map((_, index) => (
                <span 
                  key={index} 
                  className={`h-[2px] rounded-full transition-all duration-500 ${
                    index === currentPcSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

        {/* ================= APPAREILS MOBILES (Conservé) ================= */}
        <div className="md:hidden w-full relative  overflow-hidden shadow-xl aspect-[4/5] mt-4 border border-stone-200/50">
          <Caroussel autoSlide={true} autoSlideInterval={4000} onChange={setActiveMobileIndex}>
            {images.map((image) => (
              <img 
                key={image.id} 
                src={image.src} 
                alt={image.title} 
                className="min-w-full h-full object-cover flex-shrink-0" 
              />
            ))}
          </Caroussel>

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none"></div>

          <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center text-center z-10">
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-bold mb-2">
              Aura Héritage
            </span>
            
            <h2 
              key={activeMobileIndex} 
              className="text-2xl font-serif text-white mb-6 tracking-wide leading-tight min-h-[3rem] animate-[fadeInUp_0.5s_ease-out]"
            >
              {images[activeMobileIndex].title}
            </h2>
            
            <Link 
              to="/collection" 
              className="relative w-full max-w-xs group active:scale-95 transform transition-transform"
            >
              <div className="absolute -inset-0.5 bg-amber-500 rounded-xl blur opacity-60"></div>
              <div className="relative shadow-[0_0_15px_rgba(217,119,6,0.5)] rounded-xl overflow-hidden">
                <Boutton textb="Visiter la boutique" />
              </div>
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}