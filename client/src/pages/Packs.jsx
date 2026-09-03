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
  const { backendUrl, whatsappNum } = useContext(ShopContext);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${backendUrl}/api/packs`)
      .then(({ data }) => { if (data.success) setPacks(data.packs || []); })
      .finally(() => setLoading(false));
  }, [backendUrl]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] px-4 py-6 sm:px-6 lg:px-8">
      <Helmet>
        <title>Packs de bijoux | Aridona Bijoux</title>
        <meta name="description" content="Découvrez les packs de bijoux Aridona, des compositions élégantes en acier inoxydable à commander sur WhatsApp." />
        <link rel="canonical" href="https://aridona.store/packs" />
        <meta property="og:title" content="Packs de bijoux | Aridona Bijoux" />
        <meta property="og:description" content="Des compositions de bijoux pensées pour offrir ou compléter votre style." />
        <meta property="og:url" content="https://aridona.store/packs" />
        <meta property="og:type" content="website" />
      </Helmet>
      

      <div className="mx-auto max-w-7xl">
        <BoutonRetour/>
        {/* En-tête éditorial */}
   <header className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <Titre text1="Découvrez" text2="Nos Packs" />
            <p id="packs-title" className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
              Des associations pensées pour offrir ou composer une silhouette complète, à un prix privilégié.
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
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <PackCard key={pack._id} pack={pack} whatsappNum={whatsappNum} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}