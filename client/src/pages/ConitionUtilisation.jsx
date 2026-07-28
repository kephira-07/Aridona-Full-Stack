import React from 'react';

const ConditionUtilisation = () => {
  return (
    <div className="bg-slate-950 text-slate-300 min-h-screen py-16 px-6 md:px-12 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Glow effet d'arrière-plan */}
        <div className="absolute -left-16 -top-16 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* En-tête */}
        <div className="border-b border-slate-800 pb-8 mb-8 text-center md:text-left">
          <h1 className="font-serif text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent uppercase tracking-wider">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-xs text-amber-500/80 uppercase tracking-widest mt-2 font-semibold">
            Aridona Bijoux • En vigueur au : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Contenu */}
        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme <strong>Aridona Bijoux</strong>. En naviguant sur le site ou en effectuant des achats, vous acceptez sans réserve les présentes conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">2. Produits et Disponibilité</h2>
            <p>
              Aridona Bijoux propose des créations de bijouterie fines de haute qualité. Nos offres de produits et prix sont valables tant qu'elles sont visibles sur le site, dans la limite des stocks disponibles. Chaque pièce est présentée avec le plus grand soin possible (visuels, dimensions, métaux).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">3. Commandes & Modalités de Paiement</h2>
            <p className="mb-2">
              Les commandes peuvent être effectuées directement en ligne sur la plateforme ou finalisées via notre canal WhatsApp officiel.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Tarifs :</strong> Les prix sont affichés en Francs CFA (FCFA) toutes taxes comprises.</li>
              <li><strong>Paiement :</strong> Le règlement s'effectue selon les modes de paiement disponibles (Paiement à la livraison ou Mobile Money / Transfert selon arrangement).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">4. Livraison</h2>
            <p>
              Les livraisons sont effectuées à l'adresse fournie lors de la commande. Les délais de livraison sont donnés à titre indicatif et dépendent des services de messagerie et de la zone géographique du client.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">5. Propriété Intellectuelle</h2>
            <p>
              L'ensemble des éléments du site (textes, visuels des bijoux, logos, éléments graphiques) reste la propriété exclusive d'<strong>Aridona Bijoux</strong>. Toute reproduction ou utilisation non autorisée est strictement interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-100 mb-3 text-amber-400">6. Contact</h2>
            <p>
              Pour toute question relative aux présentes conditions ou à une commande, notre service client reste accessible par mail à <span className="text-amber-400 font-medium">contact@Aridona.com</span> ou via notre canal WhatsApp.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};
export default ConditionUtilisation;