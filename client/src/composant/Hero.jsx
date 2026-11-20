import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Heroimg1 from '../assets/Heroimg1.jpg';
import Heroimg2 from '../assets/Heroimg2.jpg';
import Heroimg3 from '../assets/Heroimg3.jpg';
import Heroimg4 from '../assets/Heroimg4.jpg';
import Heroimg5 from '../assets/Heroimg5.jpg';
import Heroimg6 from '../assets/Heroimg6.jpg';
import Heroimg7 from '../assets/Heroimg7.jpg';
import Heroimg8 from '../assets/Heroimg8.jpg';
import Heroimg9 from '../assets/Heroimg9.jpg';
import Heroimg10 from '../assets/Heroimg10.jpg';
import Heroimg12 from '../assets/Heroimg12.jpg';

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
    }, 45);

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
            aria-label="Image précédente"
            className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white pointer-events-auto shadow-lg hover:bg-amber-600 transition-all duration-300 cursor-pointer" 
            onClick={prev}
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            aria-label="Image suivante"
            className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white pointer-events-auto shadow-lg hover:bg-amber-600 transition-all duration-300 cursor-pointer" 
            onClick={next}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- DONNÉES STRUCTURÉES SCHEMA.ORG (aide Google à comprendre l'activité du site) ---
const StructuredData = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["JewelryStore", "OnlineStore"],
    "name": "ARIDONA Bijoux",
    "alternateName": "Aridona Bijoux Togo - Site de vente de bijoux en ligne à Lomé",
    "url": "https://aridona.store/",
    "telephone": "+22872656485",
    "currenciesAccepted": "XOF",
    "paymentAccepted": "Cash, Mobile Money (Flooz, Mixx by Yas)",
    "description": "Site de vente de bijoux en ligne à Lomé et au Togo : acheter bagues, colliers, bracelets, boucles d'oreilles et parures en acier inoxydable 316L waterproof et hypoallergéniques. Livraison rapide à Lomé et partout au Togo.",
    "image": [Heroimg1],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lomé",
      "addressCountry": "TG"
    },
    "areaServed": [
      { "@type": "City", "name": "Lomé" },
      { "@type": "Country", "name": "Togo" }
    ],
    "sameAs": [
      "https://www.instagram.com/aridonabijoux/",
      "https://www.facebook.com/profile.php?id=61593227000931",
      "https://www.tiktok.com/@aridonabijoux",
      "https://x.com/AridonaBijoux"
    ],
    "priceRange": "$$"
    // Pas de "makesOffer" ici : Google traitait son "itemOffered" (Product générique sans
    // prix ni avis) comme un élément Product à part entière, ce qui le faisait échouer à la
    // validation des résultats enrichis ("il faut indiquer offers, review, ou aggregateRating").
    // Les vraies fiches produit (PageProduit.jsx) déclarent déjà leur propre Product complet.
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

// --- COMPOSANT HERO PRINCIPAL ---
export default function Hero() {
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const [currentPcSlide, setCurrentPcSlide] = useState(0);

  const images = [
    { id: 1, src: Heroimg1, title: 'Des Bijoux Inoxydables Qui Ne Vous Quittent Jamais', alt: 'Bannière collection de bijoux en acier inoxydable 316L - ARIDONA Bijoux Lomé Togo' },
    { id: 2, src: Heroimg2, title: 'Acier Inoxydable 316L Haute Qualité', alt: "Bijoux hypoallergéniques et résistants à l'eau - ARIDONA Bijoux" },
    { id: 3, src: Heroimg3, title: "100% Waterproof & Résistant à l'Eau", alt: "Bijoux waterproof résistant à la douche et à la mer - ARIDONA Bijoux" },
    { id: 4, src: Heroimg4, title: 'Hypoallergénique & Doux pour la Peau', alt: "Bijoux sans nickel adaptés aux peaux sensibles - ARIDONA Bijoux" },
    { id: 5, src: Heroimg5, title: 'Élégance & Éclat Longue Durée', alt: "Créations raffinées en acier inoxydable doré et argenté - ARIDONA Bijoux" },
    { id: 6, src: Heroimg6, title: 'Parures & Ensembles Raffinés', alt: "Parures assorties en acier inoxydable haute qualité - ARIDONA Bijoux" },
    { id: 7, src: Heroimg7, title: 'Bagues, Colliers, Bracelets & Boucles', alt: "Gamme complète de bijoux intemporels - ARIDONA Bijoux" },
    { id: 8, src: Heroimg8, title: 'Finitions Précieuses & Tendance', alt: "Détails raffinés et finitions soignées - ARIDONA Bijoux" },
    { id: 9, src: Heroimg9, title: 'Livraison Rapide à Lomé & au Togo', alt: "Service de livraison express à Lomé et partout au Togo - ARIDONA Bijoux" },
    { id: 10, src: Heroimg10, title: 'Des Créations Qui Ne Ternissent Jamais', alt: "Bijoux durables qui conservent tout leur éclat - ARIDONA Bijoux" },
    { id: 11, src: Heroimg12, title: "L'Élégance Qui Vous Accompagne Partout", alt: "Bijoux indispensables conçus pour le quotidien - ARIDONA Bijoux" }
  ];

  const slidingPcImages = [
    images[1],
    images[2],
    images[3],
    images[4],
    images[5],
    images[6],
    images[7],
    images[8]
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPcSlide((prev) => (prev === slidingPcImages.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => clearInterval(interval);
  }, [slidingPcImages.length]);

  return (  
    <main className="w-full bg-[#fffaf5] overflow-hidden">
      <StructuredData />
      <div className="max-w-10xl mx-auto">
    
        {/* ================= DESIGN PC ================= */}
        {/* Sur tablette (md, 768-1023px), l'aspect-ratio très large "18/8" écrasait la hauteur
            au point de couper le titre/description/bouton (contenu centré en absolute, clippé
            par overflow-hidden). On lui donne une hauteur minimale confortable sur tablette et
            on ne réactive le ratio ultra-large qu'à partir de lg, où l'espace horizontal le permet. */}
        <div className="hidden md:grid grid-cols-2 w-full md:min-h-115 lg:min-h-0 lg:aspect-18/8">
                    
          <div className="relative overflow-hidden group shadow-md flex items-center justify-center">
            <img 
              src={images[0].src} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-103" 
              alt={images[0].alt} fetchPriority="high" decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>
            
            <div className="absolute inset-x-0 p-5 lg:p-8 flex flex-col items-center text-center z-10">
             
              
              <h1 className="text-2xl lg:text-5xl font-serif font-light text-white mb-3 tracking-wide max-w-md leading-tight">
                {images[0].title}
              </h1>

            {/* Description enrichie : activité claire pour Google + argumentaire marketing */}
                    <p className="text-stone-200 font-light text-xs lg:text-sm max-w-lg mb-6 leading-relaxed">
                      Douche, mer, piscine, transpiration : la vie ne s'arrête pas pour un bijou. Nos bijoux en <strong className="text-amber-300 font-medium">acier inoxydable 316L</strong> — bagues, colliers, bracelets, boucles d'oreilles et parures — sont <strong className="text-amber-300 font-medium">waterproof et sans nickel</strong>, et gardent leur éclat des années sans jamais noircir votre peau. Commandez en quelques clics : <strong className="text-amber-300 font-medium">livraison rapide, à Lomé et partout au Togo</strong>.
                    </p>
              
              <Link 
                to="/collection" 
                aria-label="Visiter la boutique de bijoux en acier inoxydable ARIDONA à Lomé"
                title="Découvrir la collection de bijoux ARIDONA"
                className="relative group/btn inline-block transform transition-all duration-300 hover:scale-102 active:scale-98"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 blur opacity-40 group-hover/btn:opacity-70 transition duration-500"></div>
                <div className="relative shadow-xl overflow-hidden">
                  <Boutton textb="Visitez la boutique" />
                </div>
              </Link>
            </div>
          </div>

          {/* 2. POP-BOX DYNAMIQUE (DROITE) */}
          <div className="relative overflow-hidden shadow-md bg-stone-950 group">
            
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
                  alt={img.alt}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
              </div>
            ))}

            <div className="absolute inset-x-0 bottom-6 p-8 lg:p-10 flex flex-col items-start text-left z-20">
              <span className="text-[9px] uppercase tracking-[0.25em] text-amber-400 font-medium mb-2">
                Qualité Inoxydable & Waterproof
              </span>
              
              <h2 className="text-xl lg:text-4xl font-serif font-light text-stone-100 tracking-wide min-h-[3.5rem] leading-snug">
                {slidingPcImages.map((img, index) => 
                  index === currentPcSlide && (
                    <TypewriterText key={img.id} text={img.title} />
                  )
                )}
              </h2>
            </div>

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

        {/* ================= APPAREILS MOBILES ================= */}
        <div className="md:hidden w-full relative overflow-hidden shadow-xl aspect-[4/5.5] border border-stone-200/50">
          <Caroussel autoSlide={true} autoSlideInterval={4000} onChange={setActiveMobileIndex}>
            {images.map((image, idx) => (
              <img 
                key={image.id} 
                src={image.src} 
                alt={image.alt} loading={idx === 0 ? "eager" : "lazy"} fetchPriority={idx === 0 ? "high" : "low"} decoding="async" 
                className="min-w-full h-full object-cover flex-shrink-0"
              />
            ))}
          </Caroussel>

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none"></div>

          <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-center text-center z-10">
            {/* h2, pas h1 : le titre desktop statique plus haut porte déjà le seul h1 de la page —
                celui-ci change à chaque slide du carrousel, ce n'est pas le titre principal du site. */}
            <h2
              key={activeMobileIndex}
              className="text-xl font-serif text-white mb-2 tracking-wide leading-tight animate-[fadeInUp_0.5s_ease-out]"
            >
              {images[activeMobileIndex].title}
            </h2>

            {/* Description enrichie mobile : activité claire pour Google + argumentaire marketing */}
            <p className="text-stone-200 font-light text-[11px] max-w-xs mb-4 leading-relaxed">
              Waterproof, sans nickel, un éclat qui dure : nos bijoux en <strong>acier inoxydable 316L</strong> vous suivent partout, sans jamais noircir. <strong>Livraison rapide, à Lomé et partout au Togo.</strong>
            </p>
            
            <Link 
              to="/collection" 
              aria-label="Visiter la boutique de bijoux en acier inoxydable ARIDONA à Lomé"
              title="Découvrir la collection de bijoux ARIDONA"
              className="relative w-full max-w-xs group active:scale-95 transform transition-transform"
            >
              <div className="absolute -inset-0.5 bg-amber-500 blur opacity-60"></div>
              <div className="relative shadow-[0_0_15px_rgba(217,119,6,0.5)] overflow-hidden">
                <Boutton textb="Visitez la boutique" />
              </div>
            </Link>
          </div>
        </div>
       </div>
    
    </main>
  );
}