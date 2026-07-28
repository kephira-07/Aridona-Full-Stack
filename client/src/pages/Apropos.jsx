import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Mail, MapPin, ShieldCheck, Sparkles, Droplets, Clock, Send, CheckCircle2 } from 'lucide-react';
import BoutonRetour from '../composant/BoutonRetour';

const APropos = () => {
  // CONFIGURATION DES CONTACTS
  const NUMERO_WHATSAPP = "22891253109"; // Ton numéro sans le '+'
  const EMAIL_CONTACT = "contact@aridona.store";
  const ADRESSE = "Lomé, Togo";

  const [formData, setFormData] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const ouvrirWhatsApp = () => {
    const message = "Bonjour Arilona Bijoux ! 💎 Je souhaiterais avoir un renseignement.";
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ nom: '', email: '', sujet: '', message: '' });
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen pt-28 pb-20 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* METADONNÉES SEO */}
      <Helmet>
        <title>Notre Histoire & Contact | Arilona Bijoux</title>
        <meta 
          name="description" 
          content="Découvrez l'univers d'Arilona Bijoux : créations d'exception, bijoux en acier inoxydable durables et waterproof, et nos canaux de contact." 
        />
      </Helmet>

      <div className="px-6 md:px-12 lg:px-20 max-w-6xl mx-auto space-y-20">
        
        <BoutonRetour />

        {/* --- SECTION 1 : HERO & HISTOIRE --- */}
        <section className="text-center flex flex-col items-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-[0.25em] uppercase mb-6">
            <Sparkles size={14} /> L'univers Arilona
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 bg-clip-text text-transparent uppercase tracking-wider leading-tight max-w-4xl">
            Éléganter votre quotidien, <br className="hidden sm:inline" /> sans compromis.
          </h1>

          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent my-8" />

          <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed font-light text-balance">
            Née de la passion pour la haute joaillerie fine et l’accessibilité, <strong className="text-amber-400 font-medium">Arilona Bijoux</strong> façonne des créations durables et intemporelles en acier inoxydable, conçues pour sublimer chaque instant de votre vie.
          </p>
        </section>

        {/* --- SECTION 2 : VOS ENGAGEMENTS & QUALITÉ --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400 mb-5 group-hover:scale-110 transition-transform duration-300">
              <Droplets size={26} />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">100% Waterproof</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Nos bijoux résistent parfaitement à l'eau, aux parfums et à la transpiration sans jamais perdre leur éclat d'origine.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400 mb-5 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={26} />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">Hypoallergénique</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Sélectionnés dans un acier inoxydable de grade supérieur pour respecter la sensibilité de toutes les peaux.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400 mb-5 group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={26} />
            </div>
            <h3 className="font-serif text-lg font-bold text-slate-100 mb-2">Finition Éclatante</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Un polissage minutieux assurant une brillance dorée ou argentée inaltérable au fil des saisons.
            </p>
          </div>
        </section>

        {/* --- SECTION 3 : MANIFESTE / VISION --- */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-amber-500/20 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 bottom-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">Notre Manifeste</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight text-slate-100">
              « Un bijou ne doit pas seulement compléter une tenue, il doit révéler votre assurance. »
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-light">
              Chez Arilona, nous refusons les compromis entre raffinement et durabilité. Nos parures sont pensées pour être superposées, portées sans contrainte et traverser le temps avec vous.
            </p>
          </div>
        </section>

        {/* --- SECTION 4 : SERVICE CLIENT & FORMULAIRE --- */}
        <section className="space-y-10">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">Conciergerie & Support</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-slate-100">Contactez la Maison</h2>
            <p className="text-xs text-slate-400">Une question sur une création ou le suivi d'une commande ? Nous sommes à votre écoute.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* Canaux de contact rapides (2 colonnes) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* WhatsApp */}
              <button
                onClick={ouvrirWhatsApp}
                className="w-full p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 hover:border-emerald-500/60 transition-all text-left flex items-start justify-between group cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">WhatsApp Direct</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">Réponse immédiate</span>
                  </div>
                  <p className="text-xs text-slate-400">Échangez instantanément avec notre conseiller client.</p>
                </div>
                <div className="p-3 bg-emerald-600 text-white rounded-xl group-hover:scale-105 transition-transform">
                  <MessageCircle size={20} />
                </div>
              </button>

              {/* Email */}
              <a
                href={`mailto:${EMAIL_CONTACT}`}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left flex items-start justify-between group block"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Adresse Email</span>
                  <p className="text-xs text-amber-400 font-medium">{EMAIL_CONTACT}</p>
                </div>
                <div className="p-3 bg-slate-800 text-slate-300 rounded-xl group-hover:scale-105 transition-transform">
                  <Mail size={20} />
                </div>
              </a>

              {/* Localisation & Horaires */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3 text-slate-300">
                  <MapPin size={18} className="text-amber-400" />
                  <span className="text-xs font-medium">{ADRESSE}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-xs">
                  <Clock size={18} className="text-amber-400" />
                  <span>Du Lundi au Samedi : 09h00 – 19h00</span>
                </div>
              </div>

            </div>

            {/* Formulaire de message (3 colonnes) */}
            <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
              <h3 className="text-lg font-serif font-bold text-slate-100 mb-6">Envoyez-nous un message</h3>

              {submitted && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-3">
                  <CheckCircle2 size={18} />
                  <span>Votre message a été transmis avec succès. Nous vous répondrons sous peu.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-400">Nom complet *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Votre nom"
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/70 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-slate-400">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/70 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-400">Sujet</label>
                  <input
                    type="text"
                    value={formData.sujet}
                    onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                    placeholder="Suivi de commande, renseignement..."
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/70 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-slate-400">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Détaillez votre demande..."
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/70 transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
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