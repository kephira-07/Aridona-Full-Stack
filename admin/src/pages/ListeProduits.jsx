import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Plus, Search, Star } from 'lucide-react';
import { backendUrl } from '../config';

const IconInstagram = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const IconX = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const ListeProduits = ({ token }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [sharingState, setSharingState] = useState(null); // { id, platform }
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('all');
  const filtreActif = searchParams.get('filtre') || 'tous';

  const setFiltre = (val) => {
    if (val === 'tous') {
      searchParams.delete('filtre');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ filtre: val });
    }
  };

  // Helper pour extraire l'URL de l'image (compatible string ou objet Cloudinary)
  const getImageUrl = (imgData) => {
    if (!imgData) return '/placeholder.png';
    const first = Array.isArray(imgData) ? imgData[0] : imgData;
    return typeof first === 'object' && first?.url ? first.url : (first || '/placeholder.png');
  };

  // Helper pour extraire le texte alternatif de l'image de couverture (rempli côté backend)
  const getImageAlt = (imgData, fallback) => {
    const first = Array.isArray(imgData) ? imgData[0] : imgData;
    return (typeof first === 'object' && first?.alt) || fallback;
  };

  // Helper pour extraire le nom de la catégorie (compatible string ou objet Populate)
  const getCategorieNom = (catData) => {
    if (!catData) return 'Non catégorisé';
    if (typeof catData === 'object') {
      return catData.nom || catData.name || 'Non catégorisé';
    }
    return catData;
  };

  // 📥 Récupérer tous les produits
  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/produit/list`);
      
      if (response.data.success) {
        setList(response.data.produits);
      } else {
        toast.error(response.data.message || "Impossible de charger la liste");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Mettre à jour le stock en temps réel
  const toggleStock = async (id, currentStatus) => {
    try {
      setUpdatingId(id);
      const newStatus = !currentStatus;

      const response = await axios.put(
        `${backendUrl}/api/produit/changer-stock/${id}`,
        { enStock: newStatus },
        { headers: { token, Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Statut mis à jour");
        setList(prevList =>
          prevList.map(item =>
            item._id === id ? { ...item, enStock: newStatus } : item
          )
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // 📤 Partager un bijou existant sur X ou Instagram en 1 clic
  const shareOnSocial = async (item, platform) => {
    const label = platform === 'x' ? 'X (Twitter)' : 'Instagram';
    if (!window.confirm(`Publier « ${item.nom} » maintenant sur ${label} ?`)) return;

    const authToken = token || localStorage.getItem('token');

    try {
      setSharingState({ id: item._id, platform });
      const response = await axios.post(
        `${backendUrl}/api/produit/share-social/${item._id}`,
        {
          instagram: platform === 'instagram',
          x: platform === 'x',
        },
        { headers: { token: authToken, Authorization: `Bearer ${authToken}` } }
      );

      const result = response.data?.social?.[platform];
      if (result?.success) {
        toast.success(result.message || `Publié sur ${label} !`);
      } else {
        toast.error(result?.message || `Impossible de publier sur ${label}.`);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Votre session a expiré. Veuillez cliquer sur 'Quitter' et vous reconnecter.");
      } else {
        toast.error(error.response?.data?.message || `Erreur lors de la publication sur ${label}.`);
      }
    } finally {
      setSharingState(null);
    }
  };

  // 🗑️ Supprimer un produit
  const removeProduct = async (id) => {
    if (!window.confirm("Es-tu sûr de vouloir supprimer ce bijou ?")) return;

    try {
      const response = await axios.delete(
        `${backendUrl}/api/produit/remove/${id}`,
        { headers: { token, Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setList(prev => prev.filter(item => item._id !== id));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // 🔎 Filtrage dynamique par onglet, catégorie et texte
  const uniqueCategories = Array.from(
    new Set(list.map((item) => getCategorieNom(item.categorie)).filter(Boolean))
  ).sort();

  const counts = {
    tous: list.length,
    stock: list.filter((i) => i.enStock !== false && i.stock !== 0).length,
    rupture: list.filter((i) => i.enStock === false || i.stock === 0).length,
    vedette: list.filter((i) => Boolean(i.meilleurVente)).length,
  };

  const filteredList = list.filter((item) => {
    const estRupture = item.enStock === false || item.stock === 0;
    if (filtreActif === 'stock' && estRupture) return false;
    if (filtreActif === 'rupture' && !estRupture) return false;
    if (filtreActif === 'vedette' && !item.meilleurVente) return false;

    const nomCat = getCategorieNom(item.categorie);
    if (categorieFilter !== 'all' && nomCat !== categorieFilter) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return String(item.nom || '').toLowerCase().includes(term) || nomCat.toLowerCase().includes(term);
  });

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[200px] text-stone-500'>
        Chargement du catalogue...
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 max-w-6xl mx-auto'>
      {/* En-tête + Bouton Ajouter */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <p className='font-bold text-xl text-stone-900'>Catalogue des Bijoux</p>
          <p className='text-xs text-stone-500'>Filtrez par stock ou catégorie, ajustez la disponibilité et partagez en 1 clic.</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/add')}
          className='inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto'
        >
          <Plus size={15} />
          <span>Ajouter un bijou</span>
        </button>
      </div>

      {/* Filtres rapides + Recherche + Catégorie */}
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs'>
        <div className='flex flex-wrap gap-1.5'>
          {[
            { id: 'tous', label: 'Tous', count: counts.tous },
            { id: 'stock', label: 'En stock', count: counts.stock },
            { id: 'rupture', label: 'Ruptures', count: counts.rupture },
            { id: 'vedette', label: 'Vedettes', count: counts.vedette },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltre(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filtreActif === f.id
                  ? 'bg-slate-950 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                filtreActif === f.id ? 'bg-white/20 text-white' : 'bg-white text-stone-700'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <select
            value={categorieFilter}
            onChange={(e) => setCategorieFilter(e.target.value)}
            className='px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 cursor-pointer'
          >
            <option value="all">Toutes catégories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className='relative w-full sm:w-60'>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Rechercher un bijou..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-stone-900 transition-all'
            />
          </div>
        </div>
      </div>

      {/* En-tête du tableau (Bureau) */}
      <div className='hidden md:grid grid-cols-[0.7fr_2.2fr_1fr_1fr_1.3fr_1.9fr] items-center py-2.5 px-4 border border-stone-200 bg-stone-100 text-xs font-semibold uppercase tracking-wider text-stone-600 rounded-xl'>
        <span>Image</span>
        <span>Nom</span>
        <span>Catégorie</span>
        <span>Prix</span>
        <span className='text-center'>Stock</span>
        <span className='text-center'>Actions & Partage</span>
      </div>

      {/* Liste des produits filtrés */}
      {filteredList.length === 0 ? (
        <p className='text-stone-500 py-10 text-center bg-white rounded-2xl border border-stone-200 text-sm'>
          Aucun bijou ne correspond à ce filtre.
        </p>
      ) : (
        filteredList.map((item) => {
          const isSharingX = sharingState?.id === item._id && sharingState?.platform === 'x';
          const isSharingIg = sharingState?.id === item._id && sharingState?.platform === 'instagram';
          const estEnStock = item.enStock !== false && item.stock !== 0;
          const stockNum = item.stock;

          return (
            <div 
              key={item._id} 
              className='flex flex-col md:grid md:grid-cols-[0.7fr_2.2fr_1fr_1fr_1.3fr_1.9fr] md:items-center gap-3 py-3.5 px-4 border border-stone-200 bg-white text-sm rounded-2xl hover:bg-stone-50/40 transition-colors shadow-2xs'
            >
              <div className='flex items-center gap-3 md:contents'>
                {/* Image */}
                <img
                  className='w-14 h-14 md:w-12 md:h-12 object-cover rounded-xl border border-stone-200 shrink-0'
                  src={getImageUrl(item.image)}
                  alt={getImageAlt(item.image, item.nom)}
                />

                {/* Nom + infos mobiles */}
                <div className='min-w-0 flex-1'>
                  <p className='font-semibold text-stone-900 truncate flex items-center gap-1.5'>
                    <span className='truncate'>{item.nom}</span>
                    {item.meilleurVente && (
                      <Star size={12} className='text-amber-600 fill-amber-500 shrink-0' title="Produit Vedette" />
                    )}
                  </p>
                  <p className='md:hidden text-xs text-stone-500 mt-0.5'>
                    {getCategorieNom(item.categorie)} • <strong className='text-amber-900'>{item.prix?.toLocaleString()} FCFA</strong>
                  </p>
                </div>
              </div>

              {/* Catégorie bureau */}
              <p className='hidden md:block text-xs text-stone-500 truncate'>
                {getCategorieNom(item.categorie)}
              </p>

              {/* Prix bureau */}
              <p className='hidden md:block text-xs font-bold text-amber-900'>
                {item.prix?.toLocaleString()} FCFA
              </p>

              {/* TOGGLE STOCK + QUANTITÉ EXACTE */}
              <div className='flex items-center md:justify-center gap-2'>
                <button
                  type="button"
                  disabled={updatingId === item._id}
                  onClick={() => toggleStock(item._id, item.enStock !== false)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 border cursor-pointer
                    ${updatingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}
                    ${estEnStock
                      ? (stockNum !== null && stockNum !== undefined && stockNum <= 3
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100')
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  title="Cliquer pour basculer En stock / Rupture"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    estEnStock
                      ? (stockNum !== null && stockNum !== undefined && stockNum <= 3 ? 'bg-amber-500' : 'bg-emerald-500')
                      : 'bg-rose-500'
                  }`} />
                  <span>
                    {!estEnStock
                      ? 'Rupture'
                      : (stockNum !== null && stockNum !== undefined ? `${stockNum} en stock` : 'En Stock')}
                  </span>
                </button>
              </div>

              {/* Actions (Partage X / IG, Modification & Suppression) */}
              <div className='flex items-center justify-center gap-1.5 flex-wrap'>
                <button
                  type="button"
                  disabled={Boolean(sharingState)}
                  onClick={() => shareOnSocial(item, 'x')}
                  title="Publier ce bijou sur X (@AridonaBijoux)"
                  className='p-1.5 text-stone-700 bg-stone-100 hover:bg-stone-900 hover:text-white rounded-lg border border-stone-200 transition-colors cursor-pointer disabled:opacity-50'
                >
                  {isSharingX ? <Loader2 size={13} className="animate-spin" /> : <IconX size={13} />}
                </button>

                <button
                  type="button"
                  disabled={Boolean(sharingState)}
                  onClick={() => shareOnSocial(item, 'instagram')}
                  title="Publier ce bijou sur Instagram (@aridonabijoux)"
                  className='p-1.5 text-amber-900 bg-amber-50 hover:bg-amber-900 hover:text-white rounded-lg border border-amber-200 transition-colors cursor-pointer disabled:opacity-50'
                >
                  {isSharingIg ? <Loader2 size={14} className="animate-spin" /> : <IconInstagram size={14} />}
                </button>

                {/* Bouton Éditer */}
                <button 
                  type="button"
                  onClick={() => navigate(`/edit/${item._id}`)}
                  className='px-2.5 py-1 text-xs font-medium text-slate-700 bg-stone-100 hover:bg-slate-900 hover:text-white rounded-lg border border-stone-200 transition-colors cursor-pointer'
                >
                  Modifier
                </button>

                {/* Bouton Supprimer */}
                <button 
                  type="button"
                  onClick={() => removeProduct(item._id)}
                  className='px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-800 rounded-lg transition-colors cursor-pointer'
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ListeProduits;
