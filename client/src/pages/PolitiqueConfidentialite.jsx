import React, { useState } from 'react';

/**
 * Design plan
 * -----------
 * Subject: Aridona Bijoux — bijoux en acier inoxydable, basé à Lomé, commandes confirmées sur WhatsApp.
 * Palette (brushed-steel / gunmetal, cool tones — deliberately NOT the warm-gold amber palette,
 * which reads as fine-gold jewellery rather than stainless steel):
 *   - graphite-950  #12151A  (page background)
 *   - graphite-900  #1B1F26  (card background)
 *   - steel-100     #E7ECF1  (primary text / light steel)
 *   - steel-400     #9AA7B4  (secondary text)
 *   - steel-600     #5C6B79  (borders, hairlines)
 *   - blue-steel    #6E93B3  (single accent — cool gunmetal-blue, evokes brushed stainless)
 * Type:
 *   - Display: 'Space Grotesk' — geometric, industrial, bold, uppercase with tracking — reads like
 *     lettering stamped into metal.
 *   - Body: 'Inter' — clean, neutral, highly legible for dense legal text.
 *   - Utility/mono: 'JetBrains Mono' — used for the article numbers, like a serial number engraved
 *     on a metal tag (jewellery hallmark / stamped plate), and for the WhatsApp contact chip.
 * Layout: a single "plate" per article, each with an engraved mono index (§01, §02…) — justified here
 *   because the content genuinely is a sequential, numbered legal document. A brushed-steel texture
 *   (thin diagonal highlight lines) runs across the header, echoing the product material itself.
 * Signature: the brushed-metal header band + hallmark-style "stamped" article numbers — the one
 *   place the metaphor is spent, everything else stays quiet and disciplined.
 */

const articles = [
  {
    id: '01',
    title: 'Qui sommes-nous',
    body: (
      <>
        <p>
          <strong className="text-steel-100">Aridona Bijoux</strong> est une boutique de bijoux en
          acier inoxydable basée à Lomé, Togo. La présente politique de confidentialité s'applique à
          notre site, à notre catalogue en ligne et à nos échanges via WhatsApp dans le cadre de la
          prise et de la confirmation des commandes.
        </p>
        <p className="mt-3">
          Aridona Bijoux agit en tant que responsable du traitement des données personnelles
          décrites ci-dessous. Pour toute question, notre équipe reste joignable via les
          coordonnées indiquées à l'article 12.
        </p>
      </>
    ),
  },
  {
    id: '02',
    title: 'Données que nous collectons',
    body: (
      <>
        <p className="mb-3">Nous collectons uniquement les données nécessaires au traitement de votre commande :</p>
        <ul className="space-y-2">
          <li><span className="text-blue-steel font-medium">Identité —</span> nom et prénom.</li>
          <li><span className="text-blue-steel font-medium">Contact —</span> adresse email et numéro de téléphone / WhatsApp.</li>
          <li><span className="text-blue-steel font-medium">Livraison —</span> adresse, quartier, ville et pays de livraison.</li>
          <li><span className="text-blue-steel font-medium">Commande —</span> historique et détail des articles achetés, montant, mode de paiement choisi.</li>
          <li><span className="text-blue-steel font-medium">Compte —</span> identifiants et jetons de session chiffrés, si vous créez un compte client.</li>
          <li><span className="text-blue-steel font-medium">Navigation —</span> données techniques de connexion (adresse IP, type d'appareil) et cookies, voir article 8.</li>
        </ul>
      </>
    ),
  },
  {
    id: '03',
    title: 'Pourquoi nous les utilisons',
    body: (
      <>
        <p className="mb-3">Vos données servent exclusivement à :</p>
        <ul className="space-y-2">
          <li>Préparer, confirmer et livrer vos commandes de bijoux.</li>
          <li>Vous contacter au sujet d'une commande, d'une livraison ou d'une question client.</li>
          <li>Créer et sécuriser votre espace client, si vous en ouvrez un.</li>
          <li>Améliorer notre catalogue et notre service, à partir de statistiques anonymisées.</li>
          <li>Vous informer de nouvelles collections, uniquement si vous y avez consenti.</li>
        </ul>
        <p className="mt-3">
          Nous ne vendons ni ne louons vos données personnelles à des tiers à des fins publicitaires.
        </p>
      </>
    ),
  },
  {
    id: '04',
    title: 'Base légale du traitement',
    body: (
      <>
        <p>Selon le cas, le traitement de vos données repose sur :</p>
        <ul className="mt-3 space-y-2">
          <li><span className="text-blue-steel font-medium">L'exécution du contrat —</span> pour traiter et livrer votre commande.</li>
          <li><span className="text-blue-steel font-medium">Votre consentement —</span> pour les communications marketing et certains cookies.</li>
          <li><span className="text-blue-steel font-medium">Notre intérêt légitime —</span> pour la sécurité du site et la prévention de la fraude.</li>
          <li><span className="text-blue-steel font-medium">Une obligation légale —</span> le cas échéant, pour la comptabilité et la facturation.</li>
        </ul>
      </>
    ),
  },
  {
    id: '05',
    title: 'Confirmation de commande sur WhatsApp',
    body: (
      <>
        <p>
          Pour aller plus vite, nous confirmons vos commandes directement sur WhatsApp. Lorsque vous
          nous contactez ou nous laissez votre numéro, nous vous transmettons un message pour valider
          les articles choisis, l'adresse de livraison et le mode de paiement.
        </p>
        <p className="mt-3">
          Seules les informations strictement nécessaires à cette confirmation (nom, articles, adresse,
          numéro de téléphone) transitent par WhatsApp. Ces échanges sont soumis, en plus de la présente
          politique, aux conditions et à la politique de confidentialité de WhatsApp / Meta, que nous
          vous invitons à consulter. Nous ne partageons jamais vos données de paiement par ce canal.
        </p>
      </>
    ),
  },
  {
    id: '06',
    title: 'Partage de vos données',
    body: (
      <>
        <p className="mb-3">Vos données peuvent être partagées, dans la stricte mesure nécessaire, avec :</p>
        <ul className="space-y-2">
          <li>Nos partenaires de livraison, pour acheminer votre commande jusqu'à vous.</li>
          <li>Nos prestataires de paiement, pour sécuriser la transaction.</li>
          <li>Nos prestataires techniques (hébergement du site, outils de messagerie), sous obligation de confidentialité.</li>
          <li>Les autorités compétentes, si la loi nous y oblige.</li>
        </ul>
        <p className="mt-3">Aucun de ces partenaires n'est autorisé à réutiliser vos données à ses propres fins.</p>
      </>
    ),
  },
  {
    id: '07',
    title: 'Durée de conservation',
    body: (
      <p>
        Nous conservons vos données le temps nécessaire à la gestion de votre relation commerciale avec
        Aridona Bijoux, puis pendant la durée requise par nos obligations légales et comptables. Les
        données liées à un compte inactif depuis plus de trois ans peuvent être supprimées ou archivées
        de façon sécurisée.
      </p>
    ),
  },
  {
    id: '08',
    title: 'Cookies et traceurs',
    body: (
      <p>
        Notre site peut utiliser des cookies strictement nécessaires à son fonctionnement (panier,
        connexion) ainsi que des cookies de mesure d'audience. Ces derniers ne sont déposés qu'avec
        votre consentement et vous pouvez le retirer à tout moment depuis les réglages de votre
        navigateur ou le bandeau proposé sur le site.
      </p>
    ),
  },
  {
    id: '09',
    title: 'Sécurité de vos données',
    body: (
      <p>
        Vos mots de passe sont hachés et chiffrés en base de données. L'accès aux données administratives
        est strictement limité aux personnes habilitées, via des mécanismes d'authentification sécurisés.
        Nous revoyons régulièrement nos pratiques pour limiter les risques d'accès non autorisé, de perte
        ou de divulgation de vos informations.
      </p>
    ),
  },
  {
    id: '10',
    title: 'Vos droits',
    body: (
      <>
        <p className="mb-3">Vous disposez à tout moment d'un droit :</p>
        <ul className="space-y-2">
          <li>D'accès à vos données personnelles.</li>
          <li>De rectification des informations inexactes ou incomplètes.</li>
          <li>De suppression de vos données, dans la limite de nos obligations légales.</li>
          <li>D'opposition à l'utilisation de vos données à des fins marketing.</li>
          <li>De retrait de votre consentement, lorsque le traitement en dépend.</li>
        </ul>
        <p className="mt-3">
          Pour exercer l'un de ces droits, contactez-nous aux coordonnées indiquées à l'article 12.
          Nous répondons à toute demande dans un délai raisonnable.
        </p>
      </>
    ),
  },
  {
    id: '11',
    title: 'Mineurs',
    body: (
      <p>
        Notre site s'adresse à des personnes majeures. Si un mineur nous transmet des données sans
        l'accord d'un parent ou tuteur, nous invitons ce dernier à nous contacter afin que ces
        données soient supprimées dans les meilleurs délais.
      </p>
    ),
  },
  {
    id: '12',
    title: 'Nous contacter',
    body: (
      <>
        <p className="mb-4">
          Pour toute question sur cette politique ou sur vos données personnelles, contactez
          Aridona Bijoux :
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-steel-600/40 bg-graphite-950/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-steel-400 font-mono">Email</p>
            <p className="text-steel-100 mt-1">contact@aridona.com</p>
          </div>
          <div className="rounded-lg border border-steel-600/40 bg-graphite-950/60 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-steel-400 font-mono">WhatsApp</p>
            <p className="text-steel-100 mt-1">Sur simple message, via le site</p>
          </div>
          <div className="rounded-lg border border-steel-600/40 bg-graphite-950/60 px-4 py-3 sm:col-span-2">
            <p className="text-[11px] uppercase tracking-widest text-steel-400 font-mono">Adresse</p>
            <p className="text-steel-100 mt-1">Lomé, Togo</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: '13',
    title: 'Modification de cette politique',
    body: (
      <p>
        Cette politique peut être mise à jour pour refléter une évolution légale ou de nos services.
        La date de dernière mise à jour, indiquée en en-tête, permet de suivre ces évolutions. Nous
        vous invitons à la consulter régulièrement.
      </p>
    ),
  },
];

const PolitiqueConfidentialite = () => {
  const [activeId, setActiveId] = useState(null);
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-graphite-950 text-steel-100 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .text-steel-100 { color: #E7ECF1; }
        .text-steel-400 { color: #9AA7B4; }
        .text-steel-600 { color: #5C6B79; }
        .text-blue-steel { color: #8FB2D1; }
        .bg-graphite-950 { background-color: #12151A; }
        .bg-graphite-900 { background-color: #1B1F26; }
        .border-steel-600\\/40 { border-color: rgba(92,107,121,0.4); }
        .brushed {
          background:
            repeating-linear-gradient(
              115deg,
              rgba(231,236,241,0.05) 0px,
              rgba(231,236,241,0.05) 1px,
              transparent 1px,
              transparent 6px
            ),
            linear-gradient(135deg, #20262E 0%, #171A20 55%, #12151A 100%);
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 md:px-10 py-14">

        {/* Header — brushed-steel plate, hallmark motif */}
        <header className="brushed rounded-2xl border border-steel-600/40 px-8 py-10 md:px-12 md:py-12 mb-10 relative overflow-hidden">
          <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-blue-steel mb-4">
            Aridona Bijoux · Acier inoxydable · Lomé
          </p>
          <h1 className="font-display font-bold text-3xl md:text-[2.6rem] leading-tight uppercase tracking-wide text-steel-100">
            Politique de<br className="hidden md:block" /> Confidentialité
          </h1>
          <p className="mt-5 text-sm text-steel-400 font-mono">
            Dernière mise à jour&nbsp;: {today}
          </p>
        </header>

        {/* Table of contents — hallmark index */}
        <nav aria-label="Sommaire" className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-widest text-steel-400 mb-3">Sommaire</p>
          <div className="flex flex-wrap gap-2">
            {articles.map((a) => (
              <a
                key={a.id}
                href={`#article-${a.id}`}
                className="font-mono text-xs px-3 py-1.5 rounded-full border border-steel-600/40 text-steel-400 hover:text-steel-100 hover:border-blue-steel/60 transition-colors"
              >
                §{a.id}
              </a>
            ))}
          </div>
        </nav>

        {/* Articles */}
        <div className="space-y-4">
          {articles.map((a) => (
            <section
              key={a.id}
              id={`article-${a.id}`}
              className="bg-graphite-900 border border-steel-600/40 rounded-xl px-6 py-6 md:px-8 md:py-7 scroll-mt-6"
            >
              <div className="flex items-baseline gap-4 mb-3">
                <span className="font-mono text-blue-steel text-sm shrink-0">§{a.id}</span>
                <h2 className="font-display font-bold text-lg md:text-xl uppercase tracking-wide text-steel-100">
                  {a.title}
                </h2>
              </div>
              <div className="text-sm md:text-[15px] leading-relaxed text-steel-400 pl-0 md:pl-9">
                {a.body}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-steel-600/40 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-steel-600">
            Aridona Bijoux — Acier inoxydable, sans compromis.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;