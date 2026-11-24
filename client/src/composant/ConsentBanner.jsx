import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('aridona_consent');
      if (!accepted) {
        setVisible(true);
      }
    } catch {
      // Ignorer si stockage bloqué
    }
  }, []);

  const accepter = () => {
    try {
      localStorage.setItem('aridona_consent', 'true');
    } catch {
      // Ignorer
    }
    setVisible(false);
  };

  const refuser = () => {
    try {
      localStorage.setItem('aridona_consent', 'declined');
    } catch {
      // Ignorer
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[1500] p-3 sm:p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-stone-900/95 backdrop-blur-md text-stone-200 border border-stone-700/80 rounded-2xl p-4 sm:px-6 sm:py-4 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-start gap-3 text-xs leading-relaxed">
          <ShieldCheck size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <p>
            Bienvenue chez <strong className="text-white">Aridona Bijoux</strong>. En poursuivant votre navigation sur notre boutique, vous acceptez nos{' '}
            <Link to="/conditions-utilisation" className="text-amber-400 underline hover:text-amber-300 font-medium">
              Conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link to="/politique-confidentialite" className="text-amber-400 underline hover:text-amber-300 font-medium">
              Politique de confidentialité
            </Link>.
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={refuser}
            className="flex-1 sm:flex-initial border border-stone-600 hover:border-stone-400 text-stone-300 hover:text-white font-medium text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={accepter}
            className="flex-1 sm:flex-initial bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            J'accepte
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
