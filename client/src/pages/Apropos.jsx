import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Mail, MapPin, ShieldCheck, Droplets, Clock, Send, CheckCircle2, Award, HeartHandshake } from 'lucide-react';
import BoutonRetour from '../composant/BoutonRetour';

const APropos = () => {
  // CONFIGURATION DES CONTACTS
  const NUMERO_WHATSAPP = "22872656485";
  const EMAIL_CONTACT = "aridonabijoux@gmail.com";
  const ADRESSE = "Lomé, Togo";

  const [formData, setFormData] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const ouvrirWhatsApp = () => {
    const message = "Bonjour Aridona Bijoux ! 💎 Je souhaiterais avoir un renseignement sur vos bijoux en acier inoxydable.";
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ nom: '', email: '', sujet: '', message: '' });
  };

  return (
    <div className="bg-stone-50/50 text-stone-800 min-h-screen pt-10 pb-24 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      {/* 🎯 BALISES SEO OPTIMISÉES */}
      <Helmet>
        <title>À Propos & Contact | Aridona Bijoux - Haute Joaillerie Fine à Lomé</title>
        <meta 
          name="description" 
          content="Découvrez l'univers Aridona Bijoux à Lomé : bijoux en acier inoxydable 316L résistant à l'eau, hypoallergéniques et dorés à l'or fin. Contactez notre conciergerie." 
        />
        <meta name="keywords" content="bijoux acier inoxydable Lomé, bijoux waterproof Togo, collier inoxydable, bague dorée, Aridona Bijoux contact" />
      </Helmet>

      <div className="px-4 sm:px-8 md:px-12 lg:px-20 max-w-6xl mx-auto space-y-20">
        
        <BoutonRetour />

        {/* --- SECTION 1 : HERO & STORYTELLING SEO --- */}
        <section className="text-center flex flex-col items-center relative animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Halo lumineux discret pour le thème clair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-200/60 text-amber-900 text-xs font-semibold tracking-[0.25em] uppercase mb-6 shadow-sm">
             La Maison Aridona
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-stone-900 font-bold tracking-tight leading-tight max-w-4xl">
            L'Élégance Fine & Durable <br className="hidden sm:inline" />
            <span className="text-amber-800 italic font-serif">Conçue Pour Traverser Le Temps</span>
          </h1>

          <div className="w-16 h-[2px] bg-amber-700/40 my-8" />

          <p className="text-stone-600 text-sm md:text-base max-w-2xl leading-relaxed font-light text-balance">
            Basée à <strong className="text-stone-900 font-medium">Lomé</strong>, la Maison <strong className="text-amber-900 font-medium">Aridona Bijoux</strong> sélectionne et façonne des parures d'exception en <strong className="text-stone-900 font-medium">acier inoxydable de qualité supérieure</strong>. Pensées pour les femmes modernes, nos créations allient le raffinement de la haute joaillerie à la liberté du quotidien.
          </p>
        </section>

        {/* --- SECTION 2 : ENGAGEMENTS QUALITÉ --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md hover:border-amber-700/30 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="p-4 rounded-xl bg-amber-50 text-amber-800 mb-5 group-hover:scale-110 group-hover:bg-amber-100 transition-transform duration-300">
              <Droplets size={26} />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">100% Waterproof</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Résistance garantie sous l'eau, à la mer et aux cosmétiques. Vos bijoux conservent leur éclat d'origine sans jamais ternir.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md hover:border-amber-700/30 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="p-4 rounded-xl bg-amber-50 text-amber-800 mb-5 group-hover:scale-110 group-hover:bg-amber-100 transition-transform duration-300">
              <ShieldCheck size={26} />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">Acier Hypoallergénique</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Sélection rigoureuse d'acier 316L certifié, formulé spécifiquement pour préserver la sensibilité des peaux les plus délicates.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:shadow-md hover:border-amber-700/30 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="p-4 rounded-xl bg-amber-50 text-amber-800 mb-5 group-hover:scale-110 group-hover:bg-amber-100 transition-transform duration-300">
              <Award size={26} />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">Dorure Haute Tenue</h3>
            <p className="text-xs text-stone-600 leading-relaxed font-light">
              Un plaquage minutieux à l'or fin offrant une brillance chaude et durable au fil des saisons, sans altération.
            </p>
          </div>
        </section>

        {/* --- SECTION 3 : LE MANIFESTE / VALEURS --- */}
        <section className="bg-amber-900 text-stone-100 rounded-3xl p-8 md:p-14 relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500">
          {/* Texture d'arrière-plan discrète */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-amber-800/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-300 font-medium flex items-center gap-2">
              <HeartHandshake size={15} /> Notre Philosophie
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-normal leading-relaxed text-amber-50">
              « Un bijou ne doit pas seulement sublimer votre allure, il doit être le complice fidèle de vos plus beaux souvenirs. »
            </h2>
            <p className="text-amber-100/80 text-xs md:text-sm leading-relaxed font-light pt-2">
              Chaque bague, collier ou bracelet de notre collection est pensé pour être superposé à l'infini, porté en toute liberté sans crainte d'usure, et transmis au fil des émotions.
            </p>
          </div>
        </section>

        {/* --- SECTION 4 : CONCIERGERIE & CONTACT --- */}
        <section className="space-y-12">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-800 font-semibold">Service Client & Conciergerie</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">Contactez la Maison</h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto">Une question sur nos créations, une demande de conseils ou le suivi d'une commande ? Nous sommes à votre écoute.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* CANAUX RAPIDES (2 COLONNES) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* WhatsApp Direct */}
              <button
                onClick={ouvrirWhatsApp}
                className="w-full p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 hover:border-emerald-400 hover:bg-emerald-50 hover:-translate-y-0.5 transition-all duration-300 text-left flex items-start justify-between group cursor-pointer shadow-sm"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">WhatsApp Direct</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Réponse rapide</span>
                  </div>
                  <p className="text-xs text-emerald-900/70">Conseil personnalisé et commande instantanée.</p>
                </div>
                <div className="p-3 bg-emerald-700 text-white rounded-xl group-hover:scale-105 transition-transform shadow-sm">
                  <MessageCircle size={20} />
                </div>
              </button>

              {/* Email */}
              <a
                href={`mailto:${EMAIL_CONTACT}`}
                className="p-6 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-800/40 hover:-translate-y-0.5 transition-all duration-300 text-left flex items-start justify-between group block shadow-sm"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Service Courrier</span>
                  <p className="text-xs text-amber-900 font-medium">{EMAIL_CONTACT}</p>
                </div>
                <div className="p-3 bg-stone-100 text-stone-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Mail size={20} />
                </div>
              </a>

              {/* Infos Clés */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200/80 space-y-3.5 shadow-sm">
                <div className="flex items-center gap-3 text-stone-700">
                  <MapPin size={18} className="text-amber-800 shrink-0" />
                  <span className="text-xs font-medium">{ADRESSE}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600 text-xs">
                  <Clock size={18} className="text-amber-800 shrink-0" />
                  <span>Du Lundi au Samedi : 09h00 – 19h00</span>
                </div>
              </div>

            </div>

            {/* FORMULAIRE DE MESSAGE (3 COLONNES) */}
            <div className="lg:col-span-3 bg-white border border-stone-200/80 p-8 rounded-2xl shadow-sm">
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-6">Transmettre un message</h3>

              {submitted && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-3 animate-in fade-in duration-300">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>Votre demande a été transmise avec succès. Notre équipe vous répondra sous 24h.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-wider text-stone-500">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Votre nom"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-wider text-stone-500">Adresse Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-stone-500">Sujet de la demande</label>
                  <input
                    type="text"
                    value={formData.sujet}
                    onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                    placeholder="Conseil bijou, suivi de livraison..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-stone-500">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Détaillez votre demande..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-800 hover:bg-amber-900 active:scale-[0.99] text-white font-semibold py-3.5 px-6 rounded-xl text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={15} /> Envoyer la demande
                </button>
              </form>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default APropos;