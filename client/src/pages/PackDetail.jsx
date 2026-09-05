import { startTransition, useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Gift, ShoppingBag, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { ShopContext } from '../context/ShopContext';
import BoutonRetour from '../composant/BoutonRetour';

const getImageUrl = (image) => {
  const first = Array.isArray(image) ? image[0] : image;
  return typeof first === 'object' ? first?.url : first;
};

export default function PackDetail() {
  const { slug } = useParams();
  const { backendUrl, ajouterPackAuPanier } = useContext(ShopContext);
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setLoading(true);
      setNotFound(false);
      setPack(null);
    });
    axios.get(`${backendUrl}/api/packs/${encodeURIComponent(slug)}`)
      .then(({ data }) => { if (data.success) setPack(data.pack); else setNotFound(true); })
      .catch((error) => { if (error.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [backendUrl, slug]);

  const handleAjouterPanier = () => {
    if (!pack) return;
    ajouterPackAuPanier(pack);
  };

  if (loading) return <div className="py-40 text-center text-sm text-stone-500" role="status">Chargement du pack...</div>;
  
  if (notFound || !pack) return (
    <div className="py-40 text-center px-4">
      <Helmet>
        <title>Pack introuvable | Aridona Bijoux</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <h1 className="font-ebgaramond text-3xl text-stone-900">Pack introuvable</h1>
      <p className="mt-2 text-sm text-stone-600">Le pack que vous recherchez n'existe plus ou a été retiré.</p>
      <Link to="/packs" className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-amber-900">
        Voir tous les packs
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FCFBFA] px-4 py-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{pack.nom} | Packs Aridona Bijoux</title>
        <meta name="description" content={pack.description} />
        <link rel="canonical" href={`https://aridona.store/pack/${pack.slug}`} />
        <meta property="og:title" content={`${pack.nom} | Aridona Bijoux`} />
        <meta property="og:description" content={pack.description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://aridona.store/pack/${pack.slug}`} />
      </Helmet>
        <BoutonRetour/>
      <div className="mx-auto max-w-6xl">
        {/* Lien de retour */}
    

        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          
          {/* Grille des visuels des produits du pack (7 colonnes) */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-3 overflow-hidden  bg-white p-4 border border-stone-200/80 shadow-sm">
            {pack.produits.map(({ produit }, index) => (
              <Link 
                key={produit._id} 
                to={`/produit/${produit.slug}`} 
                className={`group overflow-hidden  bg-stone-100 aspect-square ${index === 0 && pack.produits.length === 3 ? 'col-span-2 aspect-video' : ''}`}
              >
                <img 
                  src={getImageUrl(produit.image)} 
                  alt={produit.nom} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </Link>
            ))}
          </div>

          {/* Informations et passage de commande (5 colonnes) */}
          <div className="lg:col-span-5 pt-2 flex flex-col">
          <h1 className="font-ebgaramond text-4xl leading-tight text-stone-900 sm:text-5xl">{pack.nom}</h1>
            <p className="mt-5 text-base leading-relaxed text-stone-600">{pack.description}</p>

            {/* Composition du pack */}
            <div className="mt-8 rounded-2xl bg-white p-6 border border-stone-200/80 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-4 flex items-center gap-2">
                <Gift size={15} className="text-amber-800" /> Composition détaillée du pack
              </p>
              <ul className="space-y-3 divide-y divide-stone-100">
                {pack.produits.map(({ produit, quantite }, idx) => (
                  <li key={produit._id} className={`flex items-center justify-between gap-3 text-sm ${idx !== 0 ? 'pt-3' : ''}`}>
                    <Link to={`/produit/${produit.slug}`} className="font-medium text-stone-800 hover:text-amber-800 transition-colors">
                      {produit.nom}
                    </Link>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">x{quantite}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prix et CTA panier */}
            <div className="mt-8 flex items-center justify-between gap-4 pt-6 border-t border-stone-200">
              <div>
                <span className="block text-xs text-stone-400 uppercase tracking-wider">Prix du pack</span>
                <span className="text-3xl font-semibold text-stone-900">{Number(pack.prix).toLocaleString('fr-FR')} FCFA</span>
              </div>
              <button
                type="button"
                onClick={handleAjouterPanier}
                className="inline-flex items-center gap-2 rounded-full bg-amber-900 px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-amber-950 shadow-sm"
              >
                <ShoppingBag size={16} /> Ajouter au panier
              </button>
            </div>

            <p className="mt-4 flex items-center gap-1.5 text-xs text-stone-500">
              <CheckCircle2 size={50} className="text-emerald-700" /> Commande enregistrée puis confirmée avec Aridona sur WhatsApp.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}