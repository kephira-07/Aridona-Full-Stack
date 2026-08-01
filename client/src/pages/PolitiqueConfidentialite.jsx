import React from 'react';
import { Helmet } from 'react-helmet-async';
import BoutonRetour from '../composant/BoutonRetour';
import Titre from '../composant/Titre';

const articles = [
  {
    title: 'Qui sommes-nous',
    body: (
      <>
        <p>
          <strong className="text-stone-900">Aridona Bijoux</strong> est une boutique de bijoux en
          acier inoxydable basée à Lomé, au Togo. La présente politique de confidentialité s'applique
          à notre site, à notre catalogue en ligne et à nos échanges via WhatsApp dans le cadre de la
          prise et de la confirmation des commandes.
        </p>
        <p className="mt-3">
          Aridona Bijoux est responsable du traitement des données personnelles décrites ci-dessous.
          Pour toute question, notre équipe reste joignable aux coordonnées indiquées à l'article 12.
        </p>
      </>
    ),
  },
  {
    title: 'Données que nous collectons',
    body: (
      <>
        <p className="mb-3">Nous collectons uniquement les données nécessaires au bon traitement de votre commande :</p>
        <ul className="space-y-2">
          <li><span className="text-amber-800 font-medium">Identité —</span> nom et prénom.</li>
          <li><span className="text-amber-800 font-medium">Contact —</span> adresse email et numéro de téléphone / WhatsApp.</li>
          <li><span className="text-amber-800 font-medium">Livraison —</span> adresse, quartier, ville et pays de livraison.</li>
          <li><span className="text-amber-800 font-medium">Commande —</span> historique et détail des articles achetés, montant, mode de paiement choisi.</li>
          <li><span className="text-amber-800 font-medium">Compte —</span> identifiants et jetons de session chiffrés, si vous créez un compte client — y compris via la connexion Google (nom, email et photo de profil transmis par Google avec votre accord).</li>
          <li><span className="text-amber-800 font-medium">Avis produits —</span> si vous laissez un avis sur un bijou, votre prénom/nom et votre commentaire sont conservés et peuvent être publiés sur la fiche produit après validation.</li>
          <li><span className="text-amber-800 font-medium">Navigation —</span> données techniques de connexion (adresse IP, type d'appareil) et cookies, voir article 8.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Pourquoi nous les utilisons',
    body: (
      <>
        <p className="mb-3">Vos données servent exclusivement à :</p>
        <ul className="space-y-2">
          <li>Préparer, confirmer et livrer vos commandes de bijoux.</li>
          <li>Vous contacter au sujet d'une commande, d'une livraison ou d'une question client.</li>
          <li>Créer et sécuriser votre espace client, si vous en ouvrez un.</li>
          <li>Afficher, une fois modérés, les avis que vous choisissez de publier sur nos créations.</li>
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
    title: 'Base légale du traitement',
    body: (
      <>
        <p>Selon le cas, le traitement de vos données repose sur :</p>
        <ul className="mt-3 space-y-2">
          <li><span className="text-amber-800 font-medium">L'exécution du contrat —</span> pour traiter et livrer votre commande.</li>
          <li><span className="text-amber-800 font-medium">Votre consentement —</span> pour les communications marketing, la connexion via Google et certains cookies.</li>
          <li><span className="text-amber-800 font-medium">Notre intérêt légitime —</span> pour la sécurité du site et la prévention de la fraude.</li>
          <li><span className="text-amber-800 font-medium">Une obligation légale —</span> le cas échéant, pour la comptabilité et la facturation.</li>
        </ul>
      </>
    ),
  },
  {
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
    title: 'Connexion via Google',
    body: (
      <p>
        Si vous choisissez de vous connecter avec votre compte Google, celui-ci nous transmet, avec
        votre autorisation, votre nom, votre adresse email et votre photo de profil afin de créer ou
        retrouver votre espace client Aridona Bijoux. Nous n'accédons à aucune autre donnée de votre
        compte Google et n'y publions jamais rien en votre nom.
      </p>
    ),
  },
  {
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
    title: 'Sécurité de vos données',
    body: (
      <p>
        Les échanges avec notre site sont chiffrés (HTTPS) et vos mots de passe sont hachés avant
        d'être stockés en base de données — nous ne les connaissons donc jamais en clair. L'accès aux
        données administratives est strictement limité aux personnes habilitées, via des mécanismes
        d'authentification sécurisés. Nous revoyons régulièrement nos pratiques pour limiter les
        risques d'accès non autorisé, de perte ou de divulgation de vos informations.
      </p>
    ),
  },
  {
    title: 'Vos droits',
    body: (
      <>
        <p className="mb-3">Vous disposez à tout moment d'un droit :</p>
        <ul className="space-y-2">
          <li>D'accès à vos données personnelles.</li>
          <li>De rectification des informations inexactes ou incomplètes.</li>
          <li>De suppression de vos données, dans la limite de nos obligations légales.</li>
          <li>De suppression d'un avis que vous avez publié sur le site.</li>
          <li>D'opposition à l'utilisation de vos données à des fins marketing.</li>
          <li>De retrait de votre consentement, lorsque le traitement en dépend.</li>
        </ul>
        <p className="mt-3">
          Pour exercer l'un de ces droits, contactez-nous aux coordonnées indiquées à l'article 13.
          Nous répondons à toute demande dans un délai raisonnable.
        </p>
      </>
    ),
  },
  {
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
    title: 'Nous contacter',
    body: (
      <>
        <p className="mb-4">
          Pour toute question sur cette politique ou sur vos données personnelles, contactez
          Aridona Bijoux :
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold">Email</p>
            <p className="text-stone-800 mt-1 text-sm">aridonabijoux@gmail.com</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold">WhatsApp</p>
            <p className="text-stone-800 mt-1 text-sm">+228 72 65 64 85</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 sm:col-span-2">
            <p className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold">Adresse</p>
            <p className="text-stone-800 mt-1 text-sm">Lomé, Togo</p>
          </div>
        </div>
      </>
    ),
  },
  {
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
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-white font-dmsans">
      <Helmet>
        <title>Politique de Confidentialité | ARIDONA Bijoux</title>
        <meta name="description" content="Politique de confidentialité d'Aridona Bijoux : données collectées, usage, conservation et droits des utilisateurs." />
        <link rel="canonical" href="https://aridona.store/politique-confidentialite" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <BoutonRetour />

        <header className="text-center mt-8 mb-12">
          <Titre text1="Aridona Bijoux" text2="Politique de Confidentialité" />
          <p className="text-xs text-stone-400 mt-3">Dernière mise à jour : {today}</p>
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

export default PolitiqueConfidentialite;
