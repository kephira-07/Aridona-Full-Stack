import { useContext, useEffect, useState } from 'react';

import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { ShopContext } from '../context/ShopContext';
import PackCard from '../composant/PackCard'; // Ajustez le chemin vers votre PackCard si nécessaire
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
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 lg:px-8">
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
      

      <div className="mx-auto max-w-7xl">
        <BoutonRetour/>
        {/* En-tête éditorial */}
   <header className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center rounded-full bg-amber-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Offres exclusives</span>
            <Titre text1="Découvrez" text2="Nos Packs" />
            <p id="packs-title" className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
              Plusieurs bijoux assortis réunis dans une offre avantageuse : des idées cadeaux prêtes à offrir, livrées à Lomé et partout au Togo.
            </p>
          </div>
          <Link 
            to="/collection" 
            className="inline-flex items-center gap-2.5 border border-amber-900 bg-amber-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white shadow-xs transition-all duration-300 hover:border-amber-900/30 hover:bg-amber-50/80 hover:text-amber-950 hover:shadow-md group"
          >
            <span>Découvrir la collection</span>
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </header>

        {loading ? (
          <div className="py-20 text-center text-sm text-stone-500" role="status">Chargement des packs...</div>
        ) : packs.length === 0 ? (
          <div className="py-20 text-center text-sm text-stone-500">Aucun pack disponible pour le moment.</div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {packs.map((pack) => (
              <PackCard key={pack._id} pack={pack} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}