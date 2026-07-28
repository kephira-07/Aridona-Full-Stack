import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Heroimg6 from '../assets/Heroimg6.jpg';

// --- SECTION "À PROPOS" (Aperçu boutique, mobile-first) ---
export default function AboutSection() {
  return (
    <section
      className="w-full bg-[#fffaf5] px-6 py-12 md:py-20"
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-8 md:gap-16">
        
        {/* Image : cachée en premier sur mobile (texte prioritaire), visible en second plan sur desktop */}
        <div className="w-full md:w-1/2 order-2 md:order-1">
          <div className="relative aspect-[4/3] md:aspect-[5/4] overflow-hidden shadow-md">
            <img
              src={Heroimg6}
              alt="Bijoux en acier inoxydable ARIDONA Bijoux, boutique basée à Lomé"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          </div>
        </div>

        {/* Texte : priorité mobile-first */}
        <div className="w-full md:w-1/2 order-1 md:order-2 flex flex-col items-start text-left">
          <span className="text-[10px] uppercase tracking-[0.3em] text-amber-600 font-semibold mb-3">
            Notre boutique
          </span>

          <h2
            id="about-heading"
            className="text-2xl md:text-4xl font-serif font-light text-stone-900 mb-4 leading-tight max-w-md"
          >
            Des bijoux en acier inoxydable, pensés pour durer
          </h2>

          <p className="text-stone-600 font-light text-sm md:text-base leading-relaxed mb-6 max-w-md">
            ARIDONA Bijoux est une boutique en ligne basée à Lomé, spécialisée dans les bijoux en acier inoxydable 316L : bagues, colliers, bracelets et boucles d'oreilles hypoallergéniques et waterproof. Chaque pièce est sélectionnée pour sa qualité et sa résistance au quotidien, avec une livraison rapide sur Lomé.
          </p>

          <Link
            to="/a-propos"
            aria-label="En savoir plus sur ARIDONA Bijoux"
            className="group inline-flex items-center gap-2 text-amber-700 font-medium text-sm md:text-base tracking-wide hover:text-amber-800 transition-colors duration-300"
          >
            En savoir plus sur nous
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

      </div>
    </section>
  );
}
