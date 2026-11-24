import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import Titre from '../composant/Titre';
import PanierTotal from '../composant/PanierTotal';
import { MessageCircle, ShieldCheck, ShoppingBag } from 'lucide-react';
import BoutonRetour from '../composant/BoutonRetour';

const PasserCommande = () => {
  const {
    getPanierCount,
    commanderPanierSurWhatsapp,
  } = useContext(ShopContext);

  const navigate = useNavigate();
  const count = typeof getPanierCount === 'function' ? getPanierCount() : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20 min-h-[70vh]">
      <BoutonRetour />

      <div className="mt-6 text-center">
        <Titre text1="FINALISER" text2="SUR WHATSAPP" />
        <p className="mt-2 text-xs sm:text-sm text-stone-500">
          Aucun formulaire à remplir : envoyez directement votre sélection sur WhatsApp et indiquez-nous simplement votre quartier de livraison.
        </p>
      </div>

      {count === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 p-10 text-center">
          <ShoppingBag size={36} className="mx-auto text-stone-400 mb-3" />
          <p className="text-sm font-medium text-stone-700">Votre panier est actuellement vide.</p>
          <button
            type="button"
            onClick={() => navigate('/collection')}
            className="mt-5 rounded-xl bg-amber-900 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-amber-950 cursor-pointer"
          >
            Découvrir nos bijoux
          </button>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50/60 p-6 sm:p-8 space-y-6 shadow-xs">
          <PanierTotal />

          <p className="text-xs text-stone-600 bg-white border border-stone-200/80 rounded-xl p-3.5 leading-relaxed text-center">
            <ShieldCheck size={15} className="inline-block text-amber-800 mr-1.5 -mt-0.5" />
            <strong>Paiement à la livraison ou par Mobile Money</strong> (Flooz / Mixx by Yas) — livraison rapide à Lomé et partout au Togo.
          </p>

          <button
            type="button"
            onClick={commanderPanierSurWhatsapp}
            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-4 px-5 text-xs uppercase tracking-widest shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <MessageCircle size={18} />
            <span>Envoyer ma commande sur WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PasserCommande;
