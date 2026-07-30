import React from 'react';
import { Helmet } from 'react-helmet-async';
import BoutonRetour from '../composant/BoutonRetour';
import Titre from '../composant/Titre';

const articles = [
  {
    title: 'Objet',
    body: (
      <p>
        Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et
        l'utilisation du site et du catalogue en ligne d'<strong className="text-stone-900">Aridona Bijoux</strong>,
        boutique de bijoux en acier inoxydable basée à Lomé, au Togo. En naviguant sur le
        site, en créant un compte ou en passant commande, vous acceptez sans réserve les
        présentes conditions.
      </p>
    ),
  },
  {
    title: 'Définitions',
    body: (
      <ul className="space-y-2">
        <li><span className="text-amber-800 font-medium">« Le Site »</span> — la plateforme en ligne d'Aridona Bijoux et son catalogue de produits.</li>
        <li><span className="text-amber-800 font-medium">« Le Client »</span> — toute personne qui consulte le site ou y passe commande.</li>
        <li><span className="text-amber-800 font-medium">« La Commande »</span> — toute demande d'achat validée sur le site ou confirmée via WhatsApp.</li>
      </ul>
    ),
  },
  {
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
    title: 'Modalités de paiement',
    body: (
      <ul className="space-y-2">
        <li><span className="text-amber-800 font-medium">Paiement à la livraison —</span> réglé en espèces à réception, selon la zone couverte.</li>
        <li><span className="text-amber-800 font-medium">Mobile Money / Transfert —</span> selon les modalités convenues lors de la confirmation WhatsApp.</li>
        <li>Toute commande est réputée payée une fois le règlement confirmé par nos soins.</li>
      </ul>
    ),
  },
  {
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
    title: 'Compte client',
    body: (
      <p>
        La création d'un compte (par email ou via Google) vous permet de suivre vos commandes
        et de retrouver vos informations plus rapidement. Vous êtes responsable de la
        confidentialité de votre mot de passe et de l'exactitude des informations renseignées
        dans votre espace client. Toute activité effectuée depuis votre compte est présumée
        provenir de vous ; contactez-nous sans délai en cas de doute sur son accès.
      </p>
    ),
  },
  {
    title: 'Avis clients',
    body: (
      <p>
        Les avis laissés sur nos créations sont modérés avant publication et doivent refléter
        une expérience sincère avec le produit ou le service. Aridona Bijoux se réserve le
        droit de refuser ou de retirer tout avis mensonger, injurieux, hors sujet ou contraire
        à la loi. Un avis peut être supprimé à la demande de son auteur, dans les conditions
        de l'article 11 de notre politique de confidentialité.
      </p>
    ),
  },
  {
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
    title: 'Propriété intellectuelle',
    body: (
      <p>
        L'ensemble des éléments du site (textes, visuels des bijoux, logos, éléments
        graphiques) reste la propriété exclusive d'<strong className="text-stone-900">Aridona Bijoux</strong>.
        Toute reproduction, extraction ou réutilisation non autorisée, totale ou partielle,
        est strictement interdite sans accord écrit préalable.
      </p>
    ),
  },
  {
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
    title: 'Contact',
    body: (
      <>
        <p className="mb-4">
          Pour toute question relative aux présentes conditions ou à une commande, notre
          service client reste accessible :
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold">Email</p>
            <p className="text-stone-800 mt-1 text-sm">aridonabijoux@gmail.com</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold">WhatsApp</p>
            <p className="text-stone-800 mt-1 text-sm">+228 91 25 31 09</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 sm:col-span-2">
            <p className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold">Adresse</p>
            <p className="text-stone-800 mt-1 text-sm">Lomé, Togo</p>
          </div>
        </div>
      </>
    ),
  },
];

const ConditionUtilisation = () => {
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white font-dmsans">
      <Helmet>
        <title>Conditions Générales d'Utilisation | ARIDONA Bijoux</title>
        <meta name="description" content="Conditions Générales d'Utilisation d'Aridona Bijoux : accès au site, commandes, livraison et responsabilités." />
        <link rel="canonical" href="https://aridona.store/conditions-utilisation" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <BoutonRetour />

        <header className="text-center mt-8 mb-12">
          <Titre text1="Aridona Bijoux" text2="Conditions Générales d'Utilisation" />
          <p className="text-xs text-stone-400 mt-3">En vigueur au : {today}</p>
        </header>

        {/* Sommaire */}
        <nav aria-label="Sommaire" className="mb-12 flex flex-wrap justify-center gap-2">
          {articles.map((a, idx) => (
            <a
              key={idx}
              href={`#article-${idx + 1}`}
              className="text-[11px] font-medium uppercase tracking-wider px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 hover:text-amber-800 hover:border-amber-300 transition-colors"
            >
              {idx + 1}. {a.title}
            </a>
          ))}
        </nav>

        {/* Articles */}
        <div className="space-y-8">
          {articles.map((a, idx) => (
            <section key={idx} id={`article-${idx + 1}`} className="scroll-mt-24 flex items-start gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-ebgaramond font-semibold text-sm flex items-center justify-center mt-1">
                {idx + 1}
              </span>
              <div className="flex-1 pb-8 border-b border-stone-100 last:border-none last:pb-0">
                <h2 className="font-ebgaramond text-xl md:text-2xl text-stone-900 tracking-wide mb-3">
                  {a.title}
                </h2>
                <div className="text-sm md:text-[15px] leading-relaxed text-stone-600">
                  {a.body}
                </div>
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-14 pt-8 border-t border-stone-100 text-center">
          <p className="font-caveat text-2xl text-amber-700">Aridona Bijoux</p>
          <p className="text-[11px] uppercase tracking-widest text-stone-400 mt-1">Acier inoxydable · Lomé, Togo</p>
        </footer>
      </div>
    </div>
  );
};

export default ConditionUtilisation;
