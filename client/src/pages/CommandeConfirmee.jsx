import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { CheckCircle2, MessageSquare, UserPlus, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { ShopContext } from '../context/ShopContext';

// Page vue par le client juste après l'enregistrement de sa commande, avant qu'il ne
// parte confirmer sur WhatsApp. Sert aussi de "page de conversion" à déclarer dans
// Google Business Profile ("page vue une fois l'achat terminé").
const CommandeConfirmee = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl, token, setToken, monnaie = 'FCFA' } = useContext(ShopContext);

  const { whatsappUrl, montant } = location.state || {};
  const [creatingAccount, setCreatingAccount] = useState(false);

  // Cette page n'a de sens qu'après une commande réelle — sans état de navigation
  // (accès direct à l'URL, rechargement...), on renvoie vers l'accueil.
  useEffect(() => {
    if (!whatsappUrl) {
      navigate('/', { replace: true });
    }
  }, [whatsappUrl, navigate]);

  const creerCompte = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setCreatingAccount(true);
        const res = await axios.post(`${backendUrl}/api/utilisateur/google-login`, {
          access_token: tokenResponse.access_token,
        });
        if (res.data.success) {
          setToken(res.data.token);
          localStorage.setItem('token', res.data.token);
          toast.success("Compte créé ! Vous retrouverez vos prochaines commandes plus facilement.", { theme: "dark" });
        } else {
          toast.error(res.data.message, { theme: "dark" });
        }
      } catch (error) {
        console.error("Erreur création de compte post-commande:", error);
        toast.error("Impossible de créer le compte pour le moment.", { theme: "dark" });
      } finally {
        setCreatingAccount(false);
      }
    },
    onError: () => toast.error("La connexion Google a échoué.", { theme: "dark" }),
  });

  const estInvite = !token || token === "null" || token === "undefined";

  if (!whatsappUrl) return null;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <Helmet>
        <title>Commande confirmée | ARIDONA Bijoux</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-6">
        <CheckCircle2 size={32} strokeWidth={1.5} />
      </div>

      <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-wide">
        Merci pour votre commande !
      </h1>
      <p className="text-sm text-stone-500 mt-3 leading-relaxed">
        Votre commande a bien été enregistrée{montant ? ` pour un total de ${Number(montant).toLocaleString()} ${monnaie}` : ''}.
        Il ne reste qu'une étape : confirmez-la avec nous sur WhatsApp pour finaliser la livraison.
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-3 mt-8 w-full sm:w-auto px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-md active:scale-[0.98]"
      >
        <MessageSquare size={16} />
        <span>Confirmer sur WhatsApp</span>
      </a>

      {estInvite && (
        <div className="mt-12 pt-8 border-t border-stone-100">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-800 mb-4">
            <UserPlus size={22} />
          </div>
          <h2 className="font-serif text-lg text-stone-900">Créer votre compte Aridona ?</h2>
          <p className="text-xs text-stone-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Totalement facultatif — retrouvez vos prochaines commandes plus facilement.
          </p>
          <button
            type="button"
            disabled={creatingAccount}
            onClick={() => creerCompte()}
            className="mt-5 inline-flex items-center justify-center gap-2 bg-white border border-stone-300 text-stone-700 py-3 px-6 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-stone-50 hover:border-amber-800/30 transition-all duration-300 active:scale-[0.98] cursor-pointer disabled:opacity-60"
          >
            {creatingAccount ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.51 15 0 12 0 7.35 0 3.37 2.67 1.48 6.56l3.87 3a7.18 7.18 0 0 1 6.65-4.52z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46a5.54 5.54 0 0 1-2.4 3.64l3.73 2.9c2.18-2.01 3.7-4.97 3.7-8.69z" />
                <path fill="#FBBC05" d="M5.35 14.56a7.12 7.12 0 0 1 0-4.12l-3.87-3A11.95 11.95 0 0 0 0 12c0 1.9.44 3.7 1.23 5.32l4.12-3.12l-.01-.64z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.73-2.9a7.14 7.14 0 0 1-11.02-3.84l-3.95 3.06C3.17 21.31 7.21 24 12 24z" />
              </svg>
            )}
            <span>{creatingAccount ? 'Création...' : 'Continuer avec Google'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CommandeConfirmee;
