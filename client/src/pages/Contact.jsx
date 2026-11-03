import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, MapPin, Send, MessageCircle, Clock, Loader2 } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import { IconInstagram, IconFacebook, IconTikTok } from '../composant/SocialIcons';
import Titre from '../composant/Titre';

const Contact = () => {
  const { backendUrl, whatsappNum } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setEnvoiEnCours(true);
      const response = await axios.post(`${backendUrl}/api/contact/envoyer`, formData);
      if (response.data.success) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
        setFormData({ nom: '', email: '', sujet: '', message: '' });
      } else {
        toast.error(response.data.message || "Impossible d'envoyer le message.", { theme: "dark" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi du message.", { theme: "dark" });
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 md:px-12 font-sans">
      <Helmet>
        <title>Contact | ARIDONA Bijoux</title>
        <meta name="description" content="Contactez Aridona Bijoux pour toute question sur une pièce, une commande ou le suivi de votre livraison à Lomé et partout au Togo." />
        <link rel="canonical" href="https://aridona.store/contact" />
      </Helmet>
      <div className="max-w-6xl mx-auto space-y-12">

        {/* En-tête de la page */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Titre text1="Service Client" text2="Contactez-nous" />
          <p className="text-sm text-stone-500 leading-relaxed font-light">
            Une question sur une pièce, une commande ou le suivi de votre livraison ? Notre équipe est à votre entière disposition pour vous accompagner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* Colonne Gauche : Coordonnées & Conciergerie (2 cols) */}
          <div className="lg:col-span-2 space-y-8 bg-stone-50/50 border border-stone-200 p-8">

            <h2 className="text-xl font-serif font-medium text-stone-900 tracking-wide border-b border-stone-200 pb-4">
              Aridona Bijoux
            </h2>

            <div className="space-y-6 text-sm">

              {/* Adresse */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white border border-stone-200 text-amber-800">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-stone-800 text-xs uppercase tracking-wider">Basée à</h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                    Lomé, Togo — vente en ligne uniquement
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white border border-stone-200 text-amber-800">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-stone-800 text-xs uppercase tracking-wider">Email</h3>
                  <a href="mailto:aridonabijoux@gmail.com" className="text-stone-500 text-xs mt-1 block hover:text-amber-800 transition-colors">
                    aridonabijoux@gmail.com
                  </a>
                </div>
              </div>

              {/* Horaires */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white border border-stone-200 text-amber-800">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-stone-800 text-xs uppercase tracking-wider">Horaires de réponse</h3>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                    Lundi – Samedi : 09h00 – 19h00
                  </p>
                </div>
              </div>

            </div>

            {/* CTA WhatsApp Direct */}
            <div className="pt-6 border-t border-stone-200 space-y-3">
              <p className="text-xs text-stone-500">Pour une assistance instantanée :</p>
              <a
                href={`https://wa.me/${whatsappNum || '22872656485'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 px-4 text-xs font-semibold tracking-wider uppercase transition-all duration-300 shadow-sm active:scale-[0.99]"
              >
                <MessageCircle size={18} />
                Discuter sur WhatsApp
              </a>
            </div>

            {/* Réseaux sociaux */}
            <div className="pt-6 border-t border-stone-200 space-y-3">
              <p className="text-xs text-stone-500">Suivez-nous :</p>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/aridonabijoux/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Aridona Bijoux sur Instagram"
                  className="p-3 bg-white border border-stone-200 text-amber-800 hover:bg-amber-900 hover:text-white hover:border-amber-900 transition-all duration-300"
                >
                  <IconInstagram size={18} />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61593227000931"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Aridona Bijoux sur Facebook"
                  className="p-3 bg-white border border-stone-200 text-amber-800 hover:bg-amber-900 hover:text-white hover:border-amber-900 transition-all duration-300"
                >
                  <IconFacebook size={18} />
                </a>
                <a
                  href="https://www.tiktok.com/@aridonabijoux"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Aridona Bijoux sur TikTok"
                  className="p-3 bg-white border border-stone-200 text-amber-800 hover:bg-amber-900 hover:text-white hover:border-amber-900 transition-all duration-300"
                >
                  <IconTikTok size={18} />
                </a>
              </div>
            </div>

          </div>

          {/* Colonne Droite : Formulaire de contact (3 cols) */}
          <div className="lg:col-span-3 bg-stone-50/50 border border-stone-200 p-6 sm:p-8 md:p-10">

            <h2 className="text-xl font-serif font-medium text-stone-900 mb-6 tracking-wide">
              Envoyez-nous un message
            </h2>

            {submitted && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
                Merci ! Votre message a été envoyé avec succès. Notre équipe vous répondra dans les plus brefs délais.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-stone-600">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="w-full border border-stone-200 bg-white py-3 px-4 outline-none focus:border-stone-900 transition-all text-sm"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-stone-600">
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className="w-full border border-stone-200 bg-white py-3 px-4 outline-none focus:border-stone-900 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Sujet */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-stone-600">
                  Sujet de votre demande
                </label>
                <input
                  type="text"
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  placeholder="Ex: Suivi de commande, question sur un produit..."
                  className="w-full border border-stone-200 bg-white py-3 px-4 outline-none focus:border-stone-900 transition-all text-sm"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-stone-600">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="w-full border border-stone-200 bg-white py-3 px-4 outline-none focus:border-stone-900 transition-all text-sm resize-none"
                />
              </div>

              {/* Bouton Soumettre */}
              <button
                type="submit"
                disabled={envoiEnCours}
                className="w-full bg-amber-900 hover:bg-amber-950 disabled:bg-stone-400 text-white font-medium py-4 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-md active:scale-[0.99]"
              >
                {envoiEnCours ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {envoiEnCours ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
