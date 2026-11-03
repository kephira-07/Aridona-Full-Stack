import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

// Page sur laquelle CinetPay redirige le client une fois le paiement en ligne
// tenté (réussi ou non). La confirmation définitive vient du webhook côté serveur ;
// cette page ne fait qu'appeler /verifier-paiement pour donner un retour immédiat au client.
const PaiementRetour = () => {
  const { backendUrl, monnaie = 'FCFA' } = useContext(ShopContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statut, setStatut] = useState('verification'); // verification | succes | echec
  const [montant, setMontant] = useState(null);

  useEffect(() => {
    const transactionId = searchParams.get('transaction_id');

    if (!transactionId) {
      setStatut('echec');
      return;
    }

    axios.get(`${backendUrl}/api/order/verifier-paiement`, {
      params: { transaction_id: transactionId }
    })
      .then(({ data }) => {
        if (data.success) {
          setMontant(data.montant);
          setStatut('succes');
        } else {
          setStatut('echec');
        }
      })
      .catch(() => setStatut('echec'));
  }, [backendUrl, searchParams]);

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <Helmet>
        <title>Paiement | ARIDONA Bijoux</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {statut === 'verification' && (
        <>
          <Loader2 size={40} className="mx-auto animate-spin text-amber-800" strokeWidth={1.5} />
          <p className="text-sm text-stone-500 mt-6">Vérification de votre paiement en cours...</p>
        </>
      )}

      {statut === 'succes' && (
        <>
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-6">
            <CheckCircle2 size={32} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-wide">Paiement confirmé !</h1>
          <p className="text-sm text-stone-500 mt-3 leading-relaxed">
            Votre commande {montant ? `de ${Number(montant).toLocaleString()} ${monnaie} ` : ''}a bien été réglée.
            Vous recevrez la confirmation de livraison sur WhatsApp.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-4 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold uppercase tracking-widest transition-all"
          >
            Retour à l'accueil
          </button>
        </>
      )}

      {statut === 'echec' && (
        <>
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600 mb-6">
            <XCircle size={32} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-wide">Paiement non confirmé</h1>
          <p className="text-sm text-stone-500 mt-3 leading-relaxed">
            Le paiement a été annulé ou n'a pas pu être validé. Aucun montant n'a été débité, vous pouvez réessayer.
          </p>
          <button
            type="button"
            onClick={() => navigate('/commander')}
            className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-widest transition-all"
          >
            Réessayer
          </button>
        </>
      )}
    </div>
  );
};

export default PaiementRetour;
