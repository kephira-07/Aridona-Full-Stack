import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Titre from '../composant/Titre';
import PanierTotal from '../composant/PanierTotal';
import { toast } from 'react-toastify';
import { MessageSquare, MapPin, Loader2 } from 'lucide-react';
import BoutonRetour from '../composant/BoutonRetour';
import axios from 'axios';

const PasserCommande = () => {
  const {
    monnaie = 'FCFA',
    panierProduits = {},
    produits = [],
    getPanierMontant,
    delivery_free = 0,
    backendUrl,
    token,
    setPanierProduits,
    whatsappNum
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const [methode, setMethode] = useState('cod');
  const [loading, setLoading] = useState(false);

  const WHATSAPP_NUMBER = whatsappNum || "22872656485";

  const [formData, setFormData] = useState({
    fullName: '',
    country: 'Togo',
    city: 'Lomé',
    neighborhood: '',
    phone: ''
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

    try {
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

      if (orderItems.length === 0) {
        toast.error("Votre panier est vide.", { theme: "dark" });
        return;
      }

      const sousTotal = typeof getPanierMontant === 'function' ? Number(getPanierMontant()) : 0;
      const fraisLivraison = sousTotal === 0 ? 0 : (Number(delivery_free) || 0);
      const totalFinal = sousTotal + fraisLivraison;

      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'Client';

      const clientUserId = extraireUserIdDuToken(token);

      const commandeBackendData = {
        userId: clientUserId,
        address: {
          firstName: firstName,
          lastName: lastName,
          email: "client-whatsapp@Aridona.com",
          street: formData.neighborhood.trim() || "Non spécifié",
          city: formData.city.trim(),
          zipcode: "00228",
          phone: formData.phone.trim()
        },
        items: orderItems,
        amount: totalFinal,
        paymentMethod: methode === 'cod' ? 'COD' : 'Mobile Money'
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
        message += `💳 *Paiement :* ${methode === 'cod' ? 'À la livraison' : 'Mobile Money'}\n\n`;
        message += `🛍️ *DÉTAILS DU PANIER :*\n`;

        orderItems.forEach((item, index) => {
          let tailleFormatee = item.size;
          if (!tailleFormatee || tailleFormatee.trim() === "" || tailleFormatee === '""' || tailleFormatee.toLowerCase() === "unique") {
            tailleFormatee = "Unique";
          }
          message += `${index + 1}. *${item.nom}* (Taille: ${tailleFormatee}) x${item.quantity} -> ${(item.prix * item.quantity).toLocaleString()} ${monnaie}\n`;
        });

        message += `\n💰 *Sous-total :* ${sousTotal.toLocaleString()} ${monnaie}`;
        message += `\n📦 *Frais de livraison :* ${fraisLivraison.toLocaleString()} ${monnaie}`;
        message += `\n⭐ *TOTAL À PAYER : ${totalFinal.toLocaleString()} ${monnaie}*`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        if (typeof setPanierProduits === 'function') {
          setPanierProduits({});
        }

        // La confirmation et l'éventuelle invite à créer un compte se font maintenant
        // sur une vraie page dédiée (sert aussi de page de conversion pour Google Business).
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

      <form onSubmit={onSubmitHandler} className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-4'>
        <div className='lg:col-span-7 space-y-6'>
          <div className='text-2xl font-light tracking-wide mb-8'>
            <Titre text1={'INFORMATIONS'} text2={'DE LIVRAISON'} />
            <p className='text-xs text-stone-400 italic mt-1'>
              Saisissez vos informations de livraison avant de confirmer la commande sur WhatsApp.
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
                className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm'
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
                className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm'
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
                  className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm'
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
                  className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm'
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
                  className='w-full border border-stone-200 bg-stone-50/50 py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm'
                  type="text"
                  placeholder='Ex: Adidogomé'
                />
              </div>
            </div>
          </div>
        </div>

        <div className='lg:col-span-5 bg-stone-50/50 p-6 sm:p-8 border border-stone-100 lg:sticky lg:top-28 space-y-8 shadow-sm'>
          <div>
            <PanierTotal />
          </div>

          <div className='space-y-4'>
            <div className='text-sm font-medium uppercase tracking-widest text-stone-800 border-b border-stone-200 pb-2 flex items-center gap-2'>
              <MapPin size={16} className='text-amber-800' /> Mode de règlement
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div
                onClick={() => setMethode('cod')}
                className={`flex items-center gap-3 border p-4 cursor-pointer transition-all ${
                  methode === 'cod' ? 'border-amber-900 bg-white shadow-sm' : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'
                }`}
              >
                <div className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center ${
                  methode === 'cod' ? 'border-amber-900' : 'border-stone-300'
                }`}>
                  {methode === 'cod' && <span className='w-1.5 h-1.5 bg-amber-900 rounded-full'></span>}
                </div>
                <span className='text-xs font-medium uppercase tracking-wider text-stone-700'>À la livraison</span>
              </div>

              <div
                onClick={() => setMethode('momo')}
                className={`flex items-center gap-3 border p-4 cursor-pointer transition-all ${
                  methode === 'momo' ? 'border-amber-900 bg-white shadow-sm' : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'
                }`}
              >
                <div className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center ${
                  methode === 'momo' ? 'border-amber-900' : 'border-stone-300'
                }`}>
                  {methode === 'momo' && <span className='w-1.5 h-1.5 bg-amber-900 rounded-full'></span>}
                </div>
                <span className='text-xs font-medium uppercase tracking-wider text-stone-700'>Mobile Money</span>
              </div>
            </div>
          </div>

          <div className='pt-2'>
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-medium py-4 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-400 shadow-md active:scale-[0.99] cursor-pointer"
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