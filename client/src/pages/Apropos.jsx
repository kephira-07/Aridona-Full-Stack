import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  MessageCircle, Mail, MapPin, ShieldCheck, Droplets, Clock, Send, 
  CheckCircle2, Award, HeartHandshake, Loader2, Gem, 
  Truck, RefreshCw, ChevronDown, HelpCircle, Compass
} from 'lucide-react';
import BoutonRetour from '../composant/BoutonRetour';
import { IconInstagram, IconFacebook, IconTikTok, IconX } from '../composant/SocialIcons';
import { ShopContext } from '../context/ShopContext';

export default function APropos() {
  const { backendUrl, whatsappNum } = useContext(ShopContext);

  const NUMERO_WHATSAPP = whatsappNum || "22872656485";
  const EMAIL_CONTACT = "aridonabijoux@gmail.com";
  const ADRESSE = "Lomé, Togo (livraison à Lomé et partout au Togo)";

  const [formData, setFormData] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const ouvrirWhatsApp = () => {
    const message = "Bonjour Aridona Bijoux ! 💎 Je souhaite échanger avec votre service conciergerie.";
    window.open(`https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
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

  const faqs = [
    {
      q: "Vos bijoux résistent-ils vraiment à l'eau et aux douches ?",
      r: "Absolument. Nos pièces sont en acier inoxydable 316L de grade médical, plaquées sous vide (PVD) à l'or fin. Elles ne rouillent pas, ne verdissent pas la peau et résistent à l'eau douce, à l'eau de mer, ainsi qu'aux parfums."
    },
    {
      q: "Quels sont les délais de livraison à Lomé et dans le reste du Togo ?",
      r: "À Lomé, comptez entre 24h et 48h selon votre quartier. Dans les autres villes du Togo, la livraison prend généralement entre 2 et 5 jours ouvrés. Vous êtes tenue informée à chaque étape directement sur WhatsApp."
    },
    {
      q: "Comment se passe le paiement de ma commande ?",
      r: "Aridona ne prend aucun paiement en ligne. Vous composez votre sélection sur le site, puis confirmez votre commande sur WhatsApp : le règlement se fait à la livraison, en espèces ou par Mobile Money."
    },
    {
      q: "Proposez-vous un emballage cadeau ?",
      r: "Chaque commande Aridona est expédiée dans une pochette écrin protectrice signée, prête à être offerte ou à conserver vos parures à l'abri."
    }
  ];

  return (
    <div className="bg-[#FAF8F5] text-stone-800 min-h-screen pt-8 pb-28 font-sans selection:bg-amber-100 selection:text-amber-900">
      
      <Helmet>
        <title>Aridona Bijoux | Notre Histoire & Nos Engagements à Lomé</title>
        <meta
          name="description"
          content="Aridona Bijoux sélectionne pour vous des bijoux en acier inoxydable 316L waterproof, hypoallergéniques et durables. Découvrez notre histoire et nos engagements qualité. Livraison rapide à Lomé et partout au Togo."
        />
      </Helmet>

      <div className="px-4 sm:px-8 md:px-12 lg:px-20 max-w-7xl mx-auto space-y-24">
        
        <BoutonRetour />

        {/* SECTION 1: HERO ÉDITORIAL */}
        <section className="text-center flex flex-col items-center relative">
      
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-stone-900 font-normal tracking-tight leading-[1.1] max-w-4xl">
            L'éclat qui ne vous quitte jamais, <br className="hidden sm:inline" />
            <span className="italic text-amber-900 font-serif">à Lomé comme partout au Togo.</span>
          </h1>

          <p className="mt-8 text-stone-600 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed font-light">
            Vous ne devriez jamais avoir à choisir entre la beauté et la tranquillité. Nos bijoux en acier inoxydable 316L traversent votre douche, votre sport, la mer et vos journées les plus chargées — sans jamais ternir, sans jamais irriter votre peau.
          </p>

          {/* Grille de statistiques / Chiffres clés */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl pt-10 border-t border-stone-200/80">
            <div>
              <span className="block font-serif text-3xl md:text-4xl font-light text-amber-900">316L</span>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Acier Chirurgical</span>
            </div>
            <div>
              <span className="block font-serif text-3xl md:text-4xl font-light text-amber-900">100%</span>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Waterproof</span>
            </div>
            <div>
              <span className="block font-serif text-3xl md:text-4xl font-light text-amber-900">0%</span>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Risque d'Allergie</span>
            </div>
            <div>
              <span className="block font-serif text-3xl md:text-4xl font-light text-amber-900">Rapide</span>
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">Livraison au Togo</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: NOTRE HISTOIRE & SAVOIR-FAIRE */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-8 sm:p-14 border border-stone-200/80 shadow-xs">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-amber-800 text-xs font-semibold tracking-widest uppercase">
              <Compass size={16} /> L'Origine du Projet
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium leading-snug">
              L'alliance parfaite entre luxe accessible et durabilité.
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
              Née à Lomé de la volonté de simplifier la bijouterie du quotidien, <strong className="text-stone-900 font-normal">Aridona Bijoux</strong> sélectionne et vous propose des pièces qui durent. Nous en avions assez des bijoux fantaisie qui ternissent en quelques jours, ou de l'or massif trop précieux pour un usage de tous les jours.
            </p>
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed font-light">
              Nous choisissons avec exigence des pièces en acier inoxydable de haute qualité, plaquées à l'or fin par un procédé PVD reconnu pour sa résistance et son respect de l'environnement — pour une brillance inaltérable, même au quotidien.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200/60 space-y-2">
                <Gem className="text-amber-800" size={24} />
                <h4 className="font-serif text-base font-semibold text-stone-900">Design Intemporel</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">Des pièces pensées pour être empilées et associées au gré de vos envies.</p>
              </div>
              <div className="p-6 rounded-2xl bg-amber-950 text-stone-100 space-y-2">
                <Award className="text-amber-400" size={24} />
                <h4 className="font-serif text-base font-semibold text-amber-50">Finition Or Fin</h4>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">Plaquage PVD haute résistance pour un éclat miroir chaleureux.</p>
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200/60 space-y-2">
                <Droplets className="text-amber-900" size={24} />
                <h4 className="font-serif text-base font-semibold text-amber-950">Usage Aquatique</h4>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">Plage, piscine ou sport : vos parures ne vous quittent plus.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: NOS ENGAGEMENTS QUALITÉ */}
        <section className="space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-800 font-semibold">Excellence & Confiance</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900">Pourquoi choisir Aridona ?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all duration-300 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 text-amber-800 w-fit">
                <Droplets size={22} />
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900">Résistance Eau & Vapeur</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-light">
                Ne retirez plus vos bijoux. Ils conservent leur brillance sous l'eau douce, salée et lors du repassage ou de la douche.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all duration-300 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 text-amber-800 w-fit">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900">Tolérance Cutanée</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-light">
                Garanti 100% sans nickel, sans plomb et sans cadmium. Adapté aux peaux les plus réactives ou allergiques.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all duration-300 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 text-amber-800 w-fit">
                <Truck size={22} />
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900">Expédition Rapide</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-light">
                Livraison rapide à domicile ou au bureau, à Lomé et partout au Togo, avec un suivi personnalisé sur WhatsApp.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-amber-300 transition-all duration-300 space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 text-amber-800 w-fit">
                <RefreshCw size={22} />
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900">Service Attentionné</h3>
              <p className="text-xs text-stone-500 leading-relaxed font-light">
                Un accompagnement personnalisé par WhatsApp pour vous guider dans vos choix de tailles et d'associations.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: FOIRE AUX QUESTIONS (FAQ) */}
        <section className="bg-stone-100/70 rounded-3xl p-8 sm:p-12 border border-stone-200/60 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="text-amber-800" size={20} />
            <h2 className="font-serif text-2xl font-medium text-stone-900">Questions Fréquentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl border border-stone-200/80 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-5 text-left font-medium text-xs sm:text-sm text-stone-800 flex justify-between items-center gap-4 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`text-stone-400 transition-transform duration-300 shrink-0 ${openFaq === index ? 'rotate-180 text-amber-800' : ''}`} />
                </button>

                {openFaq === index && (
                  <div className="px-5 pb-5 text-xs text-stone-500 leading-relaxed border-t border-stone-100 pt-3">
                    {faq.r}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: CONCIERGERIE & FORMULAIRE */}
        <section className="space-y-12 pt-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-800 font-semibold">Conciergerie & Support</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900">Entrer en Contact</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            
            {/* INFOS DIRECTES */}
            <div className="lg:col-span-2 space-y-4">
              <button
                type="button"
                onClick={ouvrirWhatsApp}
                className="w-full p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300 text-left flex items-start justify-between group cursor-pointer shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">WhatsApp Direct</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Réponse immédiate</span>
                  </div>
                  <p className="text-xs text-emerald-900/70">Conseils d'associations, commandes express et photos réelles sur demande.</p>
                </div>
                <div className="p-3 bg-emerald-700 text-white rounded-xl group-hover:scale-105 transition-transform">
                  <MessageCircle size={20} />
                </div>
              </button>

              <a
                href={`mailto:${EMAIL_CONTACT}`}
                className="p-6 rounded-2xl bg-white border border-stone-200/80 hover:border-amber-800/40 transition-all duration-300 text-left flex items-start justify-between group block shadow-xs"
              >
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">Courrier Électronique</span>
                  <p className="text-xs text-amber-900 font-medium">{EMAIL_CONTACT}</p>
                </div>
                <div className="p-3 bg-stone-100 text-stone-700 rounded-xl group-hover:scale-105 transition-transform">
                  <Mail size={20} />
                </div>
              </a>

              <div className="p-6 rounded-2xl bg-white border border-stone-200/80 space-y-4 shadow-xs">
                <div className="flex items-center gap-3 text-stone-700">
                  <MapPin size={18} className="text-amber-800 shrink-0" />
                  <span className="text-xs font-medium">{ADRESSE}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600 text-xs">
                  <Clock size={18} className="text-amber-800 shrink-0" />
                  <span>Du Lundi au Samedi : 08h30 – 19h30</span>
                </div>
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Nos réseaux</span>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://www.instagram.com/aridonabijoux/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Aridona Bijoux sur Instagram"
                      className="p-2 rounded-lg bg-[#FAF8F5] text-stone-600 hover:bg-amber-900 hover:text-white transition-colors"
                    >
                      <IconInstagram size={16} />
                    </a>
                    <a
                      href="https://www.facebook.com/profile.php?id=61593227000931"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Aridona Bijoux sur Facebook"
                      className="p-2 rounded-lg bg-[#FAF8F5] text-stone-600 hover:bg-amber-900 hover:text-white transition-colors"
                    >
                      <IconFacebook size={16} />
                    </a>
                    <a
                      href="https://www.tiktok.com/@aridonabijoux"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Aridona Bijoux sur TikTok"
                      className="p-2 rounded-lg bg-[#FAF8F5] text-stone-600 hover:bg-amber-900 hover:text-white transition-colors"
                    >
                      <IconTikTok size={16} />
                    </a>
                    <a
                      href="https://x.com/AridonaBijoux"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Aridona Bijoux sur X (Twitter)"
                      className="p-2 rounded-lg bg-[#FAF8F5] text-stone-600 hover:bg-amber-900 hover:text-white transition-colors"
                    >
                      <IconX size={15} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FORMULAIRE DE CONTACT */}
            <div className="lg:col-span-3 bg-white border border-stone-200/80 p-8 sm:p-10 rounded-2xl shadow-xs">
              <h3 className="text-xl font-serif font-medium text-stone-900 mb-6">Envoyer une demande</h3>

              {submitted && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>Votre message a été transmis à notre conciergerie. Nous vous répondrons dans les plus brefs délais.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium uppercase tracking-wider text-stone-500">Nom & Prénom *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: Sarah Mensah"
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all"
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
                      className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-stone-500">Objet de la demande</label>
                  <input
                    type="text"
                    value={formData.sujet}
                    onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                    placeholder="Ex: Conseils tailles, suivi de commande..."
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-stone-500">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Précisez votre demande ici..."
                    className="w-full bg-[#FAF8F5] border border-stone-200 rounded-xl px-4 py-3 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-amber-800 focus:bg-white transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={envoiEnCours}
                  className="w-full bg-stone-900 hover:bg-amber-900 active:scale-[0.99] text-white font-medium py-3.5 px-6 rounded-xl text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {envoiEnCours ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  {envoiEnCours ? 'Transmission...' : 'Transmettre à la Maison'}
                </button>
              </form>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
