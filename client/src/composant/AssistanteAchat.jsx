import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gem, X, ArrowRight } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const AUTO_HIDE_MS = 7500;
const STORAGE_STEPS_KEY = 'aridona_guide_seen_steps';
const STORAGE_DONE_KEY = 'aridona_guide_done';

const readSeenSteps = () => {
  try {
    const raw = localStorage.getItem(STORAGE_STEPS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const markStepSeen = (stepId) => {
  try {
    const current = readSeenSteps();
    if (!current.includes(stepId)) {
      const updated = [...current, stepId];
      localStorage.setItem(STORAGE_STEPS_KEY, JSON.stringify(updated));
      if (updated.length >= 4) {
        localStorage.setItem(STORAGE_DONE_KEY, 'true');
      }
    }
  } catch {
    // Silencieux si stockage bloqué
  }
};

const isGuideDone = () => {
  try {
    return localStorage.getItem(STORAGE_DONE_KEY) === 'true';
  } catch {
    return false;
  }
};

export default function AssistanteAchat() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    getPanierCount,
    getPanierMontant,
    monnaie = 'FCFA',
    panierOuvert,
    setPanierOuvert,
  } = useContext(ShopContext);

  const count = typeof getPanierCount === 'function' ? getPanierCount() : 0;
  const montant = typeof getPanierMontant === 'function' ? Number(getPanierMontant()) || 0 : 0;

  const [activeGuide, setActiveGuide] = useState(null);

  const resolveCurrentStep = () => {
    if (pathname.startsWith('/commande-confirmee') || pathname.startsWith('/login')) {
      return null;
    }

    if (pathname.startsWith('/panier') && count > 0) {
      return {
        id: 'cart_page',
        badge: 'Dernière étape',
        text: 'Vérifiez votre panier puis cliquez sur le bouton vert « Commander sur WhatsApp » (aucun formulaire à remplir sur le site).',
        ctaLabel: null,
        onCta: null,
      };
    }

    if (count > 0 && !pathname.startsWith('/panier')) {
      return {
        id: 'cart_added',
        badge: `Votre panier (${count} article${count > 1 ? 's' : ''})`,
        text: `Super ! Votre bijou (${montant.toLocaleString('fr-FR')} ${monnaie}) est dans le panier. Quand vous avez fini votre sélection, ouvrez votre panier pour commander sur WhatsApp.`,
        ctaLabel: 'Ouvrir mon panier',
        onCta: () => setPanierOuvert(true),
      };
    }

    if (pathname.startsWith('/produit/') || pathname.startsWith('/pack/')) {
      return {
        id: 'product_view',
        badge: 'Comment commander ?',
        text: 'Ce modèle vous plaît ? Cliquez sur « Achat rapide sur WhatsApp » pour le commander tout de suite, ou « Ajouter au panier » pour choisir plusieurs bijoux.',
        ctaLabel: null,
        onCta: null,
      };
    }

    if (pathname === '/' || pathname.startsWith('/collection') || pathname.startsWith('/packs')) {
      return {
        id: 'welcome',
        badge: 'Bienvenue chez Aridona',
        text: 'Touchez un bijou qui vous plaît, ajoutez-le au panier, puis validez en 1 clic sur WhatsApp — sans formulaire, paiement à la livraison.',
        ctaLabel: pathname === '/' ? 'Explorer le catalogue' : null,
        onCta: pathname === '/' ? () => navigate('/collection') : null,
      };
    }

    return null;
  };

  useEffect(() => {
    if (isGuideDone()) {
      setActiveGuide(null);
      return undefined;
    }

    const step = resolveCurrentStep();
    if (!step) {
      setActiveGuide(null);
      return undefined;
    }

    const seen = readSeenSteps();
    if (seen.includes(step.id)) {
      setActiveGuide(null);
      return undefined;
    }

    const showTimer = setTimeout(() => {
      markStepSeen(step.id);
      setActiveGuide(step);
    }, 800);

    const hideTimer = setTimeout(() => {
      setActiveGuide(null);
    }, 800 + AUTO_HIDE_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname, count]);

  if (!activeGuide || panierOuvert) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[1400] max-w-[calc(100vw-2rem)] sm:max-w-sm pointer-events-none">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto w-full rounded-2xl border border-amber-200/90 bg-white/95 backdrop-blur-md p-4 shadow-xl transition-all duration-300"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-900">
            <Gem size={12} className="text-amber-700" />
            <span>{activeGuide.badge}</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveGuide(null)}
            aria-label="Fermer le conseil"
            className="rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-stone-700">
          {activeGuide.text}
        </p>

        {activeGuide.ctaLabel && activeGuide.onCta && (
          <button
            type="button"
            onClick={() => {
              const action = activeGuide.onCta;
              setActiveGuide(null);
              action();
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs hover:bg-amber-950 transition-all cursor-pointer"
          >
            <span>{activeGuide.ctaLabel}</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
