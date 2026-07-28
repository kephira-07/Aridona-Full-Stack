import React, { useState } from 'react';

/**
 * Design plan — light variant of the "brushed steel" identity
 * -------------------------------------------------------------
 * Same signature as the privacy policy (brushed-metal header band, hallmark-style
 * stamped article numbers) but inverted to a light, polished-steel palette so the
 * two legal pages read as one family without being a copy-paste dark theme.
 *
 * Palette:
 *   - mist-50    #F4F6F8   page background (cool, silvery white — not warm cream)
 *   - white-100  #FFFFFF   card background
 *   - ink-900    #1C2126   primary text
 *   - steel-500  #667685   secondary text
 *   - steel-300  #C7D0D8   hairlines / borders
 *   - blue-steel #3E6C93   single accent — deep gunmetal-blue, legible on light bg
 * Type: Space Grotesk (display) + Inter (body) + JetBrains Mono (article index / labels) —
 *   unchanged from the privacy policy, keeps the two documents visually related.
 * Signature: brushed-steel header band (now light highlights on pale steel) + hallmark
 *   article numbers §01…
 */

const articles = [
  {
    id: '01',
    title: 'Objet',
    body: (
      <p>
        Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et
        l'utilisation du site et du catalogue en ligne d'<strong className="text-ink-900">Aridona Bijoux</strong>,
        boutique de bijoux en acier inoxydable basée à Lomé, Togo. En naviguant sur le
        site, en créant un compte ou en passant commande, vous acceptez sans réserve les
        présentes conditions.
      </p>
    ),
  },
  {
    id: '02',
    title: 'Définitions',
    body: (
      <ul className="space-y-2">
        <li><span className="text-blue-steel font-medium">« Le Site »</span> — la plateforme en ligne d'Aridona Bijoux et son catalogue de produits.</li>
        <li><span className="text-blue-steel font-medium">« Le Client »</span> — toute personne qui consulte le site ou y passe commande.</li>
        <li><span className="text-blue-steel font-medium">« La Commande »</span> — toute demande d'achat validée sur le site ou confirmée via WhatsApp.</li>
      </ul>
    ),
  },
  {
    id: '03',
    title: 'Produits et disponibilité',
    body: (
      <p>
        Aridona Bijoux propose des créations en acier inoxydable sélectionnées avec soin.
        Chaque pièce est présentée avec la description la plus fidèle possible (visuels,
        dimensions, finition). Nos offres et nos prix restent valables tant qu'ils sont
        visibles sur le site, dans la limite des stocks disponibles. En cas de rupture après
        commande, nous vous en informons dans les meilleurs délais et proposons un
        remboursement ou un article équivalent.
      </p>
    ),
  },
  {
    id: '04',
    title: 'Prix',
    body: (
      <p>
        Les prix sont affichés en Francs CFA (FCFA), toutes taxes comprises. Les frais de
        livraison, lorsqu'ils s'appliquent, sont communiqués avant la confirmation finale de
        la commande, sur le site ou lors de l'échange WhatsApp. Aridona Bijoux se réserve le
        droit de modifier ses prix à tout moment, sans effet sur les commandes déjà confirmées.
      </p>
    ),
  },
  {
    id: '05',
    title: 'Commande et confirmation sur WhatsApp',
    body: (
      <>
        <p>
          Une commande peut être initiée directement sur le site puis est systématiquement
          finalisée par un message de confirmation sur notre canal WhatsApp officiel : articles
          choisis, adresse de livraison, mode de paiement et montant total y sont récapitulés
          avant validation.
        </p>
        <p className="mt-3">
          La commande n'est considérée comme définitive qu'après cette confirmation mutuelle.
          Le Client reste responsable de l'exactitude des informations transmises (coordonnées,
          adresse, quantités).
        </p>
      </>
    ),
  },
  {
    id: '06',
    title: 'Modalités de paiement',
    body: (
      <ul className="space-y-2">
        <li><span className="text-blue-steel font-medium">Paiement à la livraison —</span> réglé en espèces à réception, selon la zone couverte.</li>
        <li><span className="text-blue-steel font-medium">Mobile Money / Transfert —</span> selon les modalités convenues lors de la confirmation WhatsApp.</li>
        <li>Toute commande est réputée payée une fois le règlement confirmé par nos soins.</li>
      </ul>
    ),
  },
  {
    id: '07',
    title: 'Livraison',
    body: (
      <p>
        Les livraisons sont effectuées à l'adresse communiquée par le Client lors de la
        confirmation de commande. Les délais indiqués sont donnés à titre indicatif et
        dépendent de la zone géographique et du prestataire de messagerie. Aridona Bijoux ne
        saurait être tenu responsable d'un retard imputable à un tiers transporteur ou à une
        adresse erronée fournie par le Client.
      </p>
    ),
  },
  {
    id: '08',
    title: 'Retours et échanges',
    body: (
      <p>
        Un article reçu endommagé ou non conforme à la commande peut être signalé dans les
        48 heures suivant la réception, photos à l'appui, via WhatsApp ou par email. Après
        vérification, Aridona Bijoux propose un échange ou un remboursement. Les bijoux
        personnalisés ou portés ne sont ni repris ni échangés, sauf défaut de fabrication avéré.
      </p>
    ),
  },
  {
    id: '09',
    title: 'Garantie des produits',
    body: (
      <p>
        Nos bijoux en acier inoxydable sont garantis contre tout défaut de fabrication pendant
        30 jours à compter de la réception. Cette garantie ne couvre pas l'usure normale, un
        choc, une exposition à des produits chimiques ou un mauvais entretien.
      </p>
    ),
  },
  {
    id: '10',
    title: 'Responsabilité',
    body: (
      <p>
        Aridona Bijoux met tout en œuvre pour garantir l'exactitude des informations publiées
        sur le site. Nous ne saurions toutefois être tenus responsables d'une indisponibilité
        temporaire du site, d'une erreur manifeste de prix ou de description, ou de l'usage
        qui serait fait des produits après leur livraison.
      </p>
    ),
  },
  {
    id: '11',
    title: 'Propriété intellectuelle',
    body: (
      <p>
        L'ensemble des éléments du site (textes, visuels des bijoux, logos, éléments
        graphiques) reste la propriété exclusive d'<strong className="text-ink-900">Aridona Bijoux</strong>.
        Toute reproduction, extraction ou réutilisation non autorisée, totale ou partielle,
        est strictement interdite sans accord écrit préalable.
      </p>
    ),
  },
  {
    id: '12',
    title: 'Droit applicable et litiges',
    body: (
      <p>
        Les présentes CGU sont soumises au droit togolais. En cas de litige, le Client est
        invité à contacter en priorité notre service client pour rechercher une solution
        amiable. À défaut d'accord, les tribunaux compétents de Lomé seront seuls saisis.
      </p>
    ),
  },
  {
    id: '13',
    title: 'Modification des présentes CGU',
    body: (
      <p>
        Aridona Bijoux se réserve le droit de modifier les présentes conditions à tout moment,
        notamment pour refléter une évolution légale ou de nos services. La date « en vigueur
        au » indiquée en en-tête permet de suivre la version applicable.
      </p>
    ),
  },
  {
    id: '14',
    title: 'Contact',
    body: (
      <>
        <p className="mb-4">
          Pour toute question relative aux présentes conditions ou à une commande, notre
          service client reste accessible :
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-steel-300 bg-mist-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-steel-500 font-mono">Email</p>
            <p className="text-ink-900 mt-1">contact@aridona.com</p>
          </div>
          <div className="rounded-lg border border-steel-300 bg-mist-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-steel-500 font-mono">WhatsApp</p>
            <p className="text-ink-900 mt-1">Sur simple message, via le site</p>
          </div>
          <div className="rounded-lg border border-steel-300 bg-mist-50 px-4 py-3 sm:col-span-2">
            <p className="text-[11px] uppercase tracking-widest text-steel-500 font-mono">Adresse</p>
            <p className="text-ink-900 mt-1">Lomé, Togo</p>
          </div>
        </div>
      </>
    ),
  },
];

const ConditionUtilisation = () => {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-mist-50 text-ink-900 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .text-ink-900 { color: #1C2126; }
        .text-steel-500 { color: #667685; }
        .text-steel-300 { color: #C7D0D8; }
        .text-blue-steel { color: #3E6C93; }
        .bg-mist-50 { background-color: #F4F6F8; }
        .bg-white-100 { background-color: #FFFFFF; }
        .border-steel-300 { border-color: #D7DEE4; }
        .brushed-light {
          background:
            repeating-linear-gradient(
              115deg,
              rgba(255,255,255,0.9) 0px,
              rgba(255,255,255,0.9) 1px,
              transparent 1px,
              transparent 6px
            ),
            linear-gradient(135deg, #E9EDF1 0%, #DCE2E7 55%, #CFD7DD 100%);
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 md:px-10 py-14">

        {/* Header — brushed-steel plate, light finish */}
        <header className="brushed-light rounded-2xl border border-steel-300 px-8 py-10 md:px-12 md:py-12 mb-10 relative overflow-hidden shadow-sm">
          <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-blue-steel mb-4">
            Aridona Bijoux · Acier inoxydable · Lomé
          </p>
          <h1 className="font-display font-bold text-3xl md:text-[2.6rem] leading-tight uppercase tracking-wide text-ink-900">
            Conditions Générales<br className="hidden md:block" /> d'Utilisation
          </h1>
          <p className="mt-5 text-sm text-steel-500 font-mono">
            En vigueur au&nbsp;: {today}
          </p>
        </header>

        {/* Table of contents — hallmark index */}
        <nav aria-label="Sommaire" className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-widest text-steel-500 mb-3">Sommaire</p>
          <div className="flex flex-wrap gap-2">
            {articles.map((a) => (
              <a
                key={a.id}
                href={`#article-${a.id}`}
                className="font-mono text-xs px-3 py-1.5 rounded-full border border-steel-300 text-steel-500 hover:text-ink-900 hover:border-blue-steel/60 transition-colors bg-white-100"
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
              className="bg-white-100 border border-steel-300 rounded-xl px-6 py-6 md:px-8 md:py-7 scroll-mt-6 shadow-sm"
            >
              <div className="flex items-baseline gap-4 mb-3">
                <span className="font-mono text-blue-steel text-sm shrink-0">§{a.id}</span>
                <h2 className="font-display font-bold text-lg md:text-xl uppercase tracking-wide text-ink-900">
                  {a.title}
                </h2>
              </div>
              <div className="text-sm md:text-[15px] leading-relaxed text-steel-500 pl-0 md:pl-9">
                {a.body}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-steel-300 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-steel-300">
            Aridona Bijoux — Acier inoxydable, sans compromis.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ConditionUtilisation;