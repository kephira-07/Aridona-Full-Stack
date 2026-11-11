import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { ShopContext } from '../context/ShopContext';
import PackCard from '../composant/PackCard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Titre from '../composant/Titre';
import BoutonRetour from '../composant/BoutonRetour';

export default function Packs() {
  const { backendUrl } = useContext(ShopContext);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${backendUrl}/api/packs`)
      .then(({ data }) => { if (data.success) setPacks(data.packs || []); })
      .finally(() => setLoading(false));
  }, [backendUrl]);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Packs de bijoux Aridona',
    url: 'https://aridona.store/packs',
    numberOfItems: packs.length,
    itemListElement: packs.map((pack, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://aridona.store/pack/${pack.slug}`,
      name: pack.nom,
    })),
  };

  return (
    <div className="relative min-h-screen bg-[#FBF9F5] overflow-hidden">
      <Helmet>
        <title>Packs de Bijoux | Aridona Bijoux</title>
        <meta name="description" content="Nos packs assemblent plusieurs bijoux en acier inoxydable 316L à prix plus doux : le cadeau tout trouvé ou la silhouette complète en un geste. Livrés à Lomé et partout au Togo." />
        <link rel="canonical" href="https://aridona.store/packs" />
        <meta property="og:title" content="Packs de Bijoux | Aridona Bijoux" />
        <meta property="og:description" content="Le cadeau tout trouvé, ou la silhouette complète en un seul geste — nos packs de bijoux en acier inoxydable à prix plus doux." />
        <meta property="og:url" content="https://aridona.store/packs" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Éléments décoratifs de fond luxueux et discrets */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 -z-10 h-96 w-96 rounded-full bg-stone-200/30 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
        <div className="mb-6">
          <BoutonRetour />
        </div>

        {/* En-tête éditorial raffiné */}
        <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/5 px-3.5 py-1 text-xs font-medium tracking-wider text-amber-900 border border-amber-900/10">
              <span>Offres exclusives</span>
            </div>
            
            <Titre text1="Découvrez" text2="Nos Packs" />
            
            <p id="packs-title" className="max-w-xl text-sm leading-relaxed text-stone-600 font-light">
              Plusieurs bijoux assortis réunis dans une offre avantageuse : des idées cadeaux prêtes à offrir, livrées à Lomé et partout au Togo.
            </p>
          </div>

          <Link 
            to="/collection" 
            className="group inline-flex items-center gap-3 rounded-full bg-amber-900 px-6 py-3 text-xs font-medium uppercase tracking-widest text-white shadow-sm transition-all duration-300 hover:bg-amber-950 hover:shadow-md"
          >
            <span>Découvrir la collection</span>
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </header>

        {/* États de chargement et d'affichage */}
        {loading ? (
          <div className="py-24 text-center text-sm font-light tracking-wide text-stone-500 animate-pulse" role="status">
            Chargement des packs d'exception...
          </div>
        ) : packs.length === 0 ? (
          <div className="py-24 text-center text-sm text-stone-500 font-light">
            Aucun pack disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {packs.map((pack) => (
              <div key={pack._id} className="transition-all duration-300 hover:-translate-y-1">
                <PackCard pack={pack} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}