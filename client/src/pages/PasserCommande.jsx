import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Titre from '../composant/Titre';
import PanierTotal from '../composant/PanierTotal';
import { toast } from 'react-toastify';
import { MessageSquare, MapPin } from 'lucide-react';
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
        setPanierProduits 
    } = useContext(ShopContext);

    const [methode, setMethode] = useState('cod'); 
    const [loading, setLoading] = useState(false);

    const WHATSAPP_NUMBER = "22891253109"; 

    const [formData, setFormData] = useState({
        fullName: '',
        country: 'Togo',
        city: 'Lomé',
        neighborhood: '',
        phone: ''
    });

    if (!produits || produits.length === 0) {
        return (
            <div className='max-w-7xl mx-auto px-4 pt-40 pb-20 flex flex-col items-center justify-center text-center'>
                <div className='w-10 h-10 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin mb-4'></div>
                <p className='text-xs text-stone-400 uppercase tracking-widest font-mono animate-pulse'>
                    Initialisation de votre écrin de commande...
                </p>
            </div>
        );
    }

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 🛠️ Fonction utilitaire pour décoder l'ID du Token JWT directement côté client
    const extraireUserIdDuToken = (jwtToken) => {
        try {
            if (!jwtToken) return null;
            const base64Url = jwtToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload).id;
        } catch (error) {
            console.error("Erreur de décodage du token :", error);
            return null;
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            let orderItems = [];

            // 1. Extraction et mise en conformité stricte avec orderSchema
            for (const itemsId in panierProduits) {
                for (const size in panierProduits[itemsId]) {
                    if (panierProduits[itemsId][size] > 0) {
                        const itemInfo = produits.find(product => (product._id === itemsId || product.id === itemsId));
                        if (itemInfo) {
                            orderItems.push({
                                _id: String(itemInfo._id || itemInfo.id),
                                nom: String(itemInfo.nom || itemInfo.name || "Bijou Arilona"),
                                prix: Number(itemInfo.prix || itemInfo.price || 0),
                                size: String(size),
                                quantity: Number(panierProduits[itemsId][size]),
                                image: Array.isArray(itemInfo.image) ? itemInfo.image : [itemInfo.image || '']
                            });
                        }
                    }
                }
            }

            if (orderItems.length === 0) {
                toast.error("Votre panier est vide.", { theme: "dark" });
                return;
            }

            const sousTotal = typeof getPanierMontant === 'function' ? getPanierMontant() : 0;
            const fraisLivraison = Number(delivery_free) || 0;
            const totalFinal = sousTotal + fraisLivraison;

            const nameParts = formData.fullName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || 'Client';

            // 🔍 Récupération forcée de l'ID utilisateur pour combler le manque du backend
            const clientUserId = extraireUserIdDuToken(token);

            // 2. Construction de l'objet attendu au millimètre près par le modèle
            const commandeBackendData = {
                userId: clientUserId, // 🎯 Injecté ici en direct pour contrer le "Path userId is required"
                address: {
                    firstName: firstName,
                    lastName: lastName,
                    email: "client-whatsapp@arilona.com", 
                    street: formData.neighborhood || "Non spécifié",
                    city: formData.city,
                    zipcode: "00228",
                    phone: formData.phone
                },
                items: orderItems,
                amount: totalFinal,
                paymentMethod: methode === 'cod' ? 'COD' : 'Mobile Money'
            };

            // 3. Envoi de la requête HTTP POST avec formats d'en-tête cumulés
            const urlDestination = `${backendUrl}/api/order/place`;
            const response = await axios.post(urlDestination, commandeBackendData, { 
                headers: { 
                    token: token,
                    Authorization: `Bearer ${token}`
                } 
            });

            if (response.data.success) {
                // 4. Préparation du message pour l'envoi WhatsApp
                let message = `✨ *NOUVELLE COMMANDE - ARILONA BIJOUX* ✨\n\n`;
                message += `👤 *Client :* ${formData.fullName}\n`;
                message += `📞 *Téléphone :* ${formData.phone}\n`;
                message += `📍 *Adresse :* ${formData.neighborhood}, ${formData.city} (${formData.country})\n`;
                message += `💳 *Paiement souhaité :* ${methode === 'cod' ? 'À la livraison' : 'Mobile Money'}\n\n`;
                message += `🛍️ *DÉTAILS DES ARTICLES :*\n`;
                
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

                toast.success("Commande enregistrée avec succès ! Redirection WhatsApp... ✨", { theme: "dark", autoClose: 2000 });

                if (typeof setPanierProduits === 'function') {
                    setPanierProduits({});
                }

                setTimeout(() => {
                    window.open(whatsappUrl, '_blank');
                }, 1500);
            } else {
                toast.error(response.data.message || "Erreur lors de l'enregistrement.", { theme: "dark" });
            }

        } catch (error) {
            console.error("Erreur soumission commande:", error);
            toast.error(error.response?.data?.message || "Une erreur est survenue lors de la communication avec le serveur.", { theme: "dark" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20'>
            <BoutonRetour/>
            <form onSubmit={onSubmitHandler} className='grid grid-cols-1 lg:grid-cols-12 gap-12 items-start'>
                
                {/* --- BLOC DE GAUCHE : FORMULAIRE --- */}
                <div className='lg:col-span-7 space-y-6'>
                    <div className='text-2xl font-light tracking-wide mb-8'>
                        <Titre text1={'INFORMATIONS'} text2={'DE LIVRAISON'} />
                        <p className='text-xs text-stone-400 italic mt-1'>Remplissez vos coordonnées avant de passer à l'étape WhatsApp.</p>
                    </div>
                    
                    <div className='space-y-4'>
                        <div>
                            <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>Nom & Prénom *</label>
                            <input required name='fullName' onChange={onChangeHandler} value={formData.fullName} className='w-full border border-stone-200 bg-stone-50/50 rounded-none py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm' type="text" placeholder='Ex: Amina Mensah' />
                        </div>

                        <div>
                            <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>Numéro de téléphone (WhatsApp) *</label>
                            <input required name='phone' onChange={onChangeHandler} value={formData.phone} className='w-full border border-stone-200 bg-stone-50/50 rounded-none py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm' type="tel" placeholder='Ex: 90 12 34 56' />
                        </div>

                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <div>
                                <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>Pays *</label>
                                <input required name='country' onChange={onChangeHandler} value={formData.country} className='w-full border border-stone-200 bg-stone-50/50 rounded-none py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm' type="text" placeholder='Togo' />
                            </div>
                            <div>
                                <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>Ville *</label>
                                <input required name='city' onChange={onChangeHandler} value={formData.city} className='w-full border border-stone-200 bg-stone-50/50 rounded-none py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm' type="text" placeholder='Lomé' />
                            </div>
                            <div>
                                <label className='text-xs font-medium uppercase tracking-wider text-stone-600 block mb-1.5'>Quartier / Rue *</label>
                                <input required name='neighborhood' onChange={onChangeHandler} value={formData.neighborhood} className='w-full border border-stone-200 bg-stone-50/50 rounded-none py-3 px-4 outline-none focus:bg-white focus:border-stone-900 transition-all text-sm' type="text" placeholder='Ex: Adidogomé' />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- BLOC DE DROITE : TOTAL & PAIEMENT --- */}
                <div className='lg:col-span-5 bg-stone-50/50 p-6 sm:p-8 border border-stone-100 rounded-none lg:sticky lg:top-28 space-y-8'>
                    <div>
                        <PanierTotal />
                    </div>

                    <div className='space-y-4'>
                        <div className='text-sm font-medium uppercase tracking-widest text-stone-800 border-b border-stone-200 pb-2 flex items-center gap-2'>
                            <MapPin size={16} className='text-stone-500' /> Mode de règlement préféré
                        </div>
                        
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                            <div onClick={() => setMethode('cod')} className={`flex items-center gap-3 border p-4 cursor-pointer transition-all ${methode === 'cod' ? 'border-stone-900 bg-white shadow-sm' : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'}`}>
                                <div className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center ${methode === 'cod' ? 'border-stone-900' : 'border-stone-300'}`}>
                                    {methode === 'cod' && <span className='w-1.5 h-1.5 bg-stone-900 rounded-full'></span>}
                                </div>
                                <span className='text-xs font-medium uppercase tracking-wider text-stone-700'>À la livraison</span>
                            </div>

                            <div onClick={() => setMethode('momo')} className={`flex items-center gap-3 border p-4 cursor-pointer transition-all ${methode === 'momo' ? 'border-stone-900 bg-white shadow-sm' : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'}`}>
                                <div className={`w-3.5 h-3.5 border rounded-full flex items-center justify-center ${methode === 'momo' ? 'border-stone-900' : 'border-stone-300'}`}>
                                    {methode === 'momo' && <span className='w-1.5 h-1.5 bg-stone-900 rounded-full'></span>}
                                </div>
                                <span className='text-xs font-medium uppercase tracking-wider text-stone-700'>Mobile Money</span>
                            </div>
                        </div>
                    </div>

                    <div className='pt-2'>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full text-white font-medium py-4 text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-stone-400 shadow-md font-mono"
                        >
                            <MessageSquare size={16} />
                            {loading ? 'Sauvegarde logistique...' : 'Confirmer & Envoyer sur WhatsApp'}
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
};

export default PasserCommande;