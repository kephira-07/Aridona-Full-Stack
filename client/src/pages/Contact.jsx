import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique d'envoi d'email ou API backend à ajouter ici
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ nom: '', email: '', sujet: '', message: '' });
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16 px-6 md:px-12 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* En-tête de la page */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
            Service Client & Conciergerie
          </p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent uppercase tracking-wider">
            Contactez la Maison
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed font-light">
            Une question sur une pièce, une commande sur-mesure ou le suivi de votre livraison ? Notre équipe est à votre entière disposition pour vous accompagner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          
          {/* Colonne Gauche : Coordonnées & Conciergerie (2 cols) */}
          <div className="lg:col-span-2 space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <h2 className="text-xl font-serif font-bold text-amber-400 tracking-wide border-b border-slate-800 pb-4">
              Arilona Bijoux
            </h2>

            <div className="space-y-6 text-sm">
              
              {/* Adresse */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-amber-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Showroom & Atelier</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Lomé, Togo
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-amber-400">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Email</h3>
                  <a href="mailto:contact@aridona.store" className="text-slate-400 text-xs mt-1 block hover:text-amber-400 transition-colors">
                    contact@aridona.store
                  </a>
                </div>
              </div>

              {/* Horaires */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-amber-400">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200 text-xs uppercase tracking-wider">Horaires de réponse</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Lundi – Samedi : 09h00 – 19h00
                  </p>
                </div>
              </div>

            </div>

            {/* CTA WhatsApp Direct */}
            <div className="pt-6 border-t border-slate-800 space-y-3">
              <p className="text-xs text-slate-400">Pour une assistance instantanée :</p>
              <a
                href="https://wa.me/22800000000" // Remplace avec ton numéro WhatsApp officiel
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600 hover:text-white py-3 px-4 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-lg"
              >
                <MessageCircle size={18} />
                Discuter sur WhatsApp
              </a>
            </div>

          </div>

          {/* Colonne Droite : Formulaire de contact (3 cols) */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-2xl shadow-xl relative">
            
            <h2 className="text-xl font-serif font-bold text-slate-100 mb-6 tracking-wide">
              Envoyez-nous un message
            </h2>

            {submitted && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs leading-relaxed">
                Merci ! Votre message a été envoyé avec succès. Notre équipe vous répondra dans les plus brefs délais.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/70 transition-all"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/70 transition-all"
                  />
                </div>
              </div>

              {/* Sujet */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Sujet de votre demande
                </label>
                <input
                  type="text"
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  placeholder="Ex: Suivi de commande, création sur-mesure..."
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/70 transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/70 transition-all resize-none"
                />
              </div>

              {/* Bouton Soumettre */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <Send size={16} />
                Envoyer le message
              </button>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;