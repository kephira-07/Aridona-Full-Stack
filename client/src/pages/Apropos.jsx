import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Mail, MapPin, ShieldCheck, Sparkles, Droplets, Heart } from 'lucide-react';
import BoutonRetour from '../composant/BoutonRetour';

const APropos = () => {
  // CONFIGURATION DES LIENS DE CONTACT
  const NUMERO_WHATSAPP = "22890000000"; // Ton numéro sans le '+'
  const EMAIL_CONTACT = "contact@aridonabijoux.com";
  const ADRESSE = "Lomé, Togo";

  const ouvrirWhatsApp = () => {
    const message = "Bonjour ARIDONA Bijoux ! 💎 Je souhaiterais avoir un renseignement.";
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="mt-24 md:mt-32 pt-6 pb-20 bg-white min-h-screen">
      
      {/* METADONNÉES SEO */}
      <Helmet>
        <title>Notre Histoire & Contact | ARIDONA Bijoux</title>
        <meta name="description" content="Découvrez l'univers d'ARIDONA Bijoux : notre histoire, nos bijoux en acier inoxydable durables et waterproof, ainsi que nos coordonnées pour nous contacter." />
      </Helmet>

      <div className="px-4 md:px-10 lg:px-20 max-w-6xl mx-auto">
        <BoutonRetour />

        {/* --- SECTION 1 : EN-TÊTE & HISTOIRE --- */}
        <section className="text-center my-12 md:my-16 flex flex-col items-center">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700 font-semibold mb-3">
            L'univers ARIDONA
          </p>
          <h1 className="font-ebgaramond text-4xl sm:text-5xl md:text-6xl text-stone-800 tracking-tight leading-tight">
            Éléganter votre quotidien, <br className="hidden sm:inline" /> sans compromis.
          </h1>
          <div className="w-12 h-[2px] bg-amber-600 my-6"></div>
          
          <p className="font-dmsans text-stone-600 text-base md:text-lg max-w-2xl leading-relaxed text-balance">
            Née de la passion pour l'élégance intemporelle et l'accessibilité, <strong className="text-stone-800 font-medium">ARIDONA Bijoux</strong> conçoit et sélectionne des parures en acier inoxydable pensées pour accompagner chaque moment de votre vie.
          </p>
        </section>

        {/* --- SECTION 2 : VOS ENGAGEMENTS & QUALITÉ --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-16">
          <div className="p-8 rounded-2xl bg-stone-50 border border-stone-100/80 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100/60 text-amber-800 flex items-center justify-center mb-4">
              <Droplets size={24} />
            </div>
            <h3 className="font-serif text-xl text-stone-800 mb-2">100% Waterproof</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Nos bijoux résistent à l'eau, au parfum et à la transpiration sans jamais perdre leur éclat ni rouiller.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-stone-50 border border-stone-100/80 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100/60 text-amber-800 flex items-center justify-center mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-serif text-xl text-stone-800 mb-2">Hypoallergénique</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Fabriqués en acier inoxydable de haute qualité, nos créations prennent soin des peaux les plus sensibles.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-stone-50 border border-stone-100/80 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100/60 text-amber-800 flex items-center justify-center mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="font-serif text-xl text-stone-800 mb-2">Finition Éclatante</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Chaque bijou est pensé pour conserver sa brillance dorée ou argentée au fil des saisons.
            </p>
          </div>
        </section>

        {/* --- SECTION 3 : LE MOT DE LA CRÉATRICE / LA MISSION --- */}
        <section className="my-20 bg-stone-900 text-stone-100 rounded-3xl p-8 md:p-14 flex flex-col md:flex-row items-center gap-10 shadow-xl relative overflow-hidden">
          <div className="flex-1 space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold">Notre Vision</p>
            <h2 className="font-ebgaramond text-3xl md:text-4xl leading-tight text-white">
              « Un bijou ne doit pas seulement sublimer une tenue, il doit révéler votre assurance. »
            </h2>
            <p className="text-stone-300 text-sm md:text-base leading-relaxed font-light">
              Chez ARIDONA, nous croyons qu'il n'est pas nécessaire de choisir entre qualité durable et prix accessible. Nos collections sont imaginées pour s'accumuler, se mixer et s'adapter à votre style quotidien.
            </p>
          </div>
        </section>

        {/* --- SECTION 4 : NOUS CONTACTER (MOBILE-FIRST) --- */}
        <section className="my-16">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-700 font-semibold mb-2">Besoin d'aide ?</p>
            <h2 className="font-ebgaramond text-3xl md:text-4xl text-stone-800">Contactez-nous</h2>
            <p className="text-sm text-stone-500 mt-2">Notre équipe vous répond rapidement avec grand plaisir.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* WhatsApp - Action Principale */}
            <button
              onClick={ouvrirWhatsApp}
              className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition-all text-left flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                  <MessageCircle size={22} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/60 text-emerald-800 px-2.5 py-1 rounded-full">
                  Réponse rapide
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 text-base">WhatsApp</h4>
                <p className="text-xs text-stone-500 mt-1">Discuter directement avec notre équipe service client.</p>
              </div>
            </button>

            {/* Email */}
            <a
              href={`mailto:${EMAIL_CONTACT}`}
              className="p-6 rounded-2xl bg-stone-50 border border-stone-100 hover:border-stone-300 transition-all text-left flex flex-col justify-between group"
            >
              <div className="p-3 bg-stone-800 text-white rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                <Mail size={22} />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 text-base">E-mail</h4>
                <p className="text-xs text-stone-500 mt-1">{EMAIL_CONTACT}</p>
              </div>
            </a>

            {/* Localisation */}
            <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100 text-left flex flex-col justify-between">
              <div className="p-3 bg-amber-800 text-white rounded-xl w-fit mb-4">
                <MapPin size={22} />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 text-base">Localisation</h4>
                <p className="text-xs text-stone-500 mt-1">{ADRESSE} (Livraison à domicile disponible)</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default APropos;