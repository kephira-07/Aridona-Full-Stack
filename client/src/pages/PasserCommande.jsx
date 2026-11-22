import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Titre from '../composant/Titre';
import PanierTotal from '../composant/PanierTotal';
import { toast } from 'react-toastify';
import { MessageSquare, MapPin, Loader2, Banknote, Smartphone, ShieldCheck, Truck } from 'lucide-react';
import BoutonRetour from '../composant/BoutonRetour';
import axios from 'axios';
import { trackEvent, identifyVisitor } from '../utils/tracker';

const PasserCommande = () => {
  const {
    monnaie = 'FCFA',
    panierProduits = {},
    panierPacks = {},
    packs = [],
    produits = [],
    getPanierMontant,
    seuilReduction = 25000,
    tauxReduction = 0.1,
    calculerReduction,
    backendUrl,
    token,
    viderPanier,
    whatsappNum
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const [methode, setMethode] = useState('cod'); // 'cod' = à la livraison, 'momo' = mobile money
  const [loading, setLoading] = useState(false);
  const [accepteConditions, setAccepteConditions] = useState(false);

  const WHATSAPP_NUMBER = whatsappNum || "22872656485";

  const [formData, setFormData] = useState({
    fullName: '',
    country: 'Togo',
    city: 'Lomé',
    neighborhood: '',
    phone: '',
    email: ''
  });

  const getImageUrl = (imgData) => {
    if (!imgData) return '';
    if (Array.isArray(imgData) && imgData.length > 0) {
      const first = imgData[0];
      return typeof first === 'object' && first?.url ? first.url : String(first);
    }
    return typeof imgData === 'object' && imgData?.url ? imgData.url : String(imgData);
  };

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const extraireUserIdDuToken = (jwtToken) => {
    try {
      if (!jwtToken || jwtToken === "null" || jwtToken === "undefined") return null;
      const parts = jwtToken.split('.');
      if (parts.length !== 3) return null;

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload).id || null;
    } catch (error) {
      console.warn("Mode invité (token non-décodable):", error.message);
      return null;
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!accepteConditions) {
      toast.error("Veuillez accepter les conditions d'utilisation avant de confirmer votre commande.", { theme: "dark" });
      return;
    }

    try {
      try { localStorage.setItem('aridona_consent', 'true'); } catch {}
      setLoading(true);
      let orderItems = [];

      for (const itemsId in panierProduits) {
        for (const size in panierProduits[itemsId]) {
          if (panierProduits[itemsId][size] > 0) {
            const itemInfo = (produits || []).find(
              (product) => String(product._id || product.id) === String(itemsId)
            );

            if (itemInfo) {
              const mainImg = getImageUrl(itemInfo.image);
              orderItems.push({
                _id: String(itemInfo._id || itemInfo.id),
                type: 'produit',
                nom: String(itemInfo.nom || itemInfo.name || "Bijou Aridona"),
                prix: Number(itemInfo.prix || itemInfo.price || 0),
                size: String(size),
                quantity: Number(panierProduits[itemsId][size]),
                image: mainImg ? [mainImg] : []
              });
            }
          }
        }
      }

      for (const packId in panierPacks) {
        const quantite = panierPacks[packId];
        if (quantite > 0) {
          const packInfo = (packs || []).find((p) => String(p._id) === String(packId));
          if (packInfo) {
            const imgPack = packInfo.produits?.find((c) => c.produit?.image?.[0])?.produit?.image?.[0];
            const imgUrl = getImageUrl(imgPack);
            orderItems.push({
              _id: String(packId),
              type: 'pack',
              nom: String(packInfo.nom || "Pack Aridona"),
              prix: Number(packInfo.prix || 0),
              size: 'Coffret',
              quantity: Number(quantite),
              image: imgUrl ? [imgUrl] : []
            });
          }
        }
      }

      if (orderItems.length === 0) {
        toast.error("Votre panier est vide.", { theme: "dark" });
        return;
      }

      const sousTotal = typeof getPanierMontant === 'function' ? Number(getPanierMontant()) : 0;
      const reduction = typeof calculerReduction === 'function'
        ? calculerReduction(sousTotal)
        : (sousTotal >= seuilReduction ? Math.round(sousTotal * tauxReduction) : 0);
      const totalFinal = Math.max(0, sousTotal - reduction);

      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Client';
      const lastName = nameParts.slice(1).join(' ') || '';

      const clientUserId = extraireUserIdDuToken(token);

      const commandeBackendData = {
        userId: clientUserId,
        address: {
          firstName,
          lastName,
          email: formData.email.trim(),
          street: formData.neighborhood.trim() || "Non spécifié",
          city: formData.city.trim() || 'Lomé',
          zipcode: "00228",
          phone: formData.phone.trim()
        },
        items: orderItems,
        amount: totalFinal,
        paymentMethod: methode === 'cod' ? 'À la livraison' : 'Mobile Money'
      };

      const headers = {};
      if (token && token !== "null" && token !== "undefined") {
        headers['token'] = token;
        headers['Authorization'] = `Bearer ${token}`;
      }

      const urlDestination = `${backendUrl || ''}/api/order/place`;
      const response = await axios.post(urlDestination, commandeBackendData, { headers });

      if (response.data && response.data.success) {
        let message = `✨ *NOUVELLE COMMANDE — Aridona BIJOUX* ✨\n\n`;
        message += `👤 *Client :* ${formData.fullName.trim()}\n`;
        message += `📞 *Téléphone :* ${formData.phone.trim()}\n`;
        message += `📍 *Adresse :* ${formData.neighborhood.trim()}, ${formData.city.trim()} (${formData.country.trim()})\n`;
        message += `💳 *Règlement :* ${methode === 'cod' ? 'À la livraison (Espèces)' : 'Mobile Money (T-Money / Flooz)'}\n\n`;
        message += `🛍️ *DÉTAILS DU PANIER :*\n`;

        orderItems.forEach((item, index) => {
          if (item.type === 'pack') {
            message += `${index + 1}. 🎁 *Pack ${item.nom}* x${item.quantity} -> ${(item.prix * item.quantity).toLocaleString()} ${monnaie}\n`;
            return;
          }
          let tailleFormatee = item.size;
          if (!tailleFormatee || tailleFormatee.trim() === "" || tailleFormatee === '""' || tailleFormatee.toLowerCase() === "unique") {
            tailleFormatee = "Unique";
          }
          message += `${index + 1}. *${item.nom}* (Taille: ${tailleFormatee}) x${item.quantity} -> ${(item.prix * item.quantity).toLocaleString()} ${monnaie}\n`;
        });

        message += `\n💰 *Sous-total :* ${sousTotal.toLocaleString()} ${monnaie}`;
        if (reduction > 0) {
          message += `\n🎁 *Réduction (-${Math.round(tauxReduction * 100)}%) :* -${reduction.toLocaleString()} ${monnaie}`;
        }
        message += `\n⭐ *TOTAL À PAYER : ${totalFinal.toLocaleString()} ${monnaie}*`;

        const encodedMessage = encodeURIComponent(message);
        identifyVisitor({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          city: [formData.neighborhood, formData.city].filter(Boolean).join(', '),
        });
        trackEvent('whatsapp_click', { produitNom: `Commande (${orderItems.length} article${orderItems.length > 1 ? 's' : ''})`, pageLabel: 'Validation Commande' });
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        if (typeof viderPanier === 'function') {
          viderPanier();
        }

        navigate('/commande-confirmee', { state: { whatsappUrl, montant: totalFinal } });

      } else {
        toast.error(response.data?.message || "Erreur lors de l'enregistrement.", { theme: "dark" });
      }

    } catch (error) {
      console.error("Erreur enregistrement commande:", error);
      toast.error(
        error.response?.data?.message || "Erreur de connexion au serveur backend.",
        { theme: "dark" }
      );
    } finally {
      setLoading(false);
    }
  };

  if (!produits || produits.length === 0) {
    return (
      <div className='max-w-7xl mx-auto px-4 pt-40 pb-20 flex flex-col items-center justify-center text-center'>
        <div className='w-10 h-10 border-2 border-stone-200 border-t-amber-900 rounded-full animate-spin mb-4'></div>
        <p className='text-xs text-stone-400 uppercase tracking-widest font-mono animate-pulse'>
          Initialisation de votre écrin de commande...
        </p>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20'>
      <BoutonRetour />

      {/* BANDEAU EXPLICATIF EN 3 ÉTAPES */}
      <div className="mt-4 mb-8 bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-900 mb-3 flex items-center justify-center sm:justify-start gap-2">
          <ShieldCheck size={15} className="text-amber-800 shrink-0" />
          <span>Comment fonctionne votre commande chez Aridona Bijoux ?</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700">
          <div className="bg-white/90 rounded-xl p-3 border border-amber-100">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <MapPin size={13} className="text-amber-700 shrink-0" /> 1. Vos coordonnées
            </span>
            Indiquez votre nom, numéro WhatsApp et votre quartier de livraison.
          </div>
          <div className="bg-white/90 rounded-xl p-3 border border-amber-100">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <MessageSquare size={13} className="text-amber-700 shrink-0" /> 2. Confirmation WhatsApp
            </span>
            En cliquant sur le bouton vert, votre récapitulatif s'ouvre prêt à nous être envoyé.
          </div>
          <div className="bg-white/90 rounded-xl p-3 border border-amber-100">
            <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
              <Truck size={13} className="text-amber-700 shrink-0" /> 3. Livraison & Règlement
            </span>
            Nous vous livrons rapidement et vous payez à la réception ou par T-Money / Flooz.
          </div>
        </div>
      </div>

      <form onSubmit={onSubmitHandler} className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-4'>
        <div className='lg:col-span-7 space-y-6'>
          <div className='text-2xl font-light tracking-wide mb-8'>
            <Titre text1={'INFORMATIONS'} text2={'DE LIVRAISON'} />
            <p className='text-xs text-stone-400 italic mt-1'>
              Merci pour votre confiance ! Remplissez simplement ces quelques informations pour que notre livreur puisse vous joindre facilement.
            </p>
          </div>

          <div className='space-y-4'>
            <div>
              <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>
                Nom & Prénom *
              </label>
              <input
                required
                name='fullName'
                onChange={onChangeHandler}
                value={formData.fullName}
                className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm rounded-lg'
                type="text"
                placeholder='Ex: Amina Mensah'
              />
            </div>

            <div>
              <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>
                Numéro WhatsApp *
              </label>
              <input
                required
                name='phone'
                onChange={onChangeHandler}
                value={formData.phone}
                className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm rounded-lg'
                type="tel"
                placeholder='Ex: 90 12 34 56'
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div>
                <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>
                  Pays *
                </label>
                <input
                  required
                  name='country'
                  onChange={onChangeHandler}
                  value={formData.country}
                  className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm rounded-lg'
                  type="text"
                  placeholder='Togo'
                />
              </div>
              <div>
                <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>
                  Ville *
                </label>
                <input
                  required
                  name='city'
                  onChange={onChangeHandler}
                  value={formData.city}
                  className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm rounded-lg'
                  type="text"
                  placeholder='Lomé'
                />
              </div>
              <div>
                <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>
                  Quartier / Repère *
                </label>
                <input
                  required
                  name='neighborhood'
                  onChange={onChangeHandler}
                  value={formData.neighborhood}
                  className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm rounded-lg'
                  type="text"
                  placeholder='Ex: Adidogomé, face pharmacie'
                />
              </div>
            </div>

            <div>
              <label className='text-xs font-medium uppercase tracking-wider text-stone-500 block mb-1.5'>
                Adresse Email (optionnel)
              </label>
              <input
                name='email'
                onChange={onChangeHandler}
                value={formData.email}
                className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm rounded-lg'
                type="email"
                placeholder='Pour recevoir nos offres et nouveautés'
              />
            </div>
          </div>
        </div>

        <div className='lg:col-span-5 bg-stone-50/50 p-6 sm:p-8 border border-stone-100 lg:sticky lg:top-28 space-y-8 shadow-sm rounded-2xl'>
          <div>
            <PanierTotal />
          </div>

          <div className='space-y-4'>
            <div className='text-sm font-medium uppercase tracking-widest text-stone-800 border-b border-stone-200 pb-2 flex items-center gap-2'>
              <MapPin size={16} className='text-amber-800' /> Mode de règlement
            </div>

            <p className='text-xs text-stone-500 italic'>
              Aucun paiement en ligne n'est débité sur le site. Vous payez en toute sécurité à la réception de votre bijou ou via Mobile Money.
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div
                onClick={() => setMethode('cod')}
                className={`flex items-center gap-3 border p-4 rounded-xl cursor-pointer transition-all ${
                  methode === 'cod' ? 'border-amber-900 bg-white shadow-sm ring-1 ring-amber-900/20' : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'
                }`}
              >
                <Banknote size={18} className={methode === 'cod' ? 'text-amber-900' : 'text-stone-400'} />
                <div className='flex flex-col'>
                  <span className='text-xs font-semibold uppercase tracking-wider text-stone-800'>À la livraison</span>
                  <span className='text-[10px] text-stone-500'>En espèces à Lomé</span>
                </div>
              </div>

              <div
                onClick={() => setMethode('momo')}
                className={`flex items-center gap-3 border p-4 rounded-xl cursor-pointer transition-all ${
                  methode === 'momo' ? 'border-amber-900 bg-white shadow-sm ring-1 ring-amber-900/20' : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'
                }`}
              >
                <Smartphone size={18} className={methode === 'momo' ? 'text-amber-900' : 'text-stone-400'} />
                <div className='flex flex-col'>
                  <span className='text-xs font-semibold uppercase tracking-wider text-stone-800'>Mobile Money</span>
                  <span className='text-[10px] text-stone-500'>T-Money / Flooz</span>
                </div>
              </div>
            </div>
          </div>

          <div className='pt-2 space-y-4'>
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-stone-600 leading-relaxed select-none bg-white border border-stone-200/80 p-3.5 rounded-xl">
              <input
                type="checkbox"
                required
                checked={accepteConditions}
                onChange={(e) => setAccepteConditions(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-amber-900 rounded cursor-pointer shrink-0"
              />
              <span>
                J'ai lu et j'accepte les{' '}
                <Link to="/conditions-utilisation" target="_blank" className="text-amber-900 underline font-semibold hover:text-amber-700">
                  Conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link to="/politique-confidentialite" target="_blank" className="text-amber-900 underline font-semibold hover:text-amber-700">
                  Politique de confidentialité
                </Link>{' '}
                d'Aridona Bijoux. *
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !accepteConditions}
              className="w-full text-white font-medium py-4 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed shadow-md active:scale-[0.99] cursor-pointer rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className='animate-spin' />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  <span>Confirmer & Envoyer sur WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PasserCommande;
