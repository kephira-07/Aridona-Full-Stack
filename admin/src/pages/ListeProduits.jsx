import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [sharingState, setSharingState] = useState(null); // { id, platform }
  
  // State pour la barre de recherche
  const [searchTerm, setSearchTerm] = useState('');

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

  // 🔎 Filtrage dynamique des produits selon le terme recherché (par nom ou catégorie)
  const filteredList = list.filter((item) => {
    const term = searchTerm.toLowerCase();
    const nomMatch = item.nom?.toLowerCase().includes(term);
    const catNom = getCategorieNom(item.categorie).toLowerCase();
    const catMatch = catNom.includes(term);
    return nomMatch || catMatch;
  });

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[200px] text-stone-500'>
        Chargement du catalogue...
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4 p-4 max-w-6xl mx-auto'>
      {/* En-tête + Barre de recherche */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2'>
        <p className='font-bold text-lg text-stone-800'>Catalogue des Bijoux</p>
        
        {/* Input Recherche */}
        <div className='relative w-full sm:w-72'>
          <input
            type="text"
            placeholder="Rechercher par bijou ou catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 transition-all shadow-sm'
          />
          <svg 
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* En-tête du tableau (Bureau) */}
      <div className='hidden md:grid grid-cols-[1fr_2.2fr_1fr_1fr_1.1fr_1.9fr] items-center py-2.5 px-4 border bg-stone-100 text-sm font-semibold text-stone-600 rounded-lg'>
        <span>Image</span>
        <span>Nom</span>
        <span>Catégorie</span>
        <span>Prix</span>
        <span className='text-center'>Statut Stock</span>
        <span className='text-center'>Actions & Partage</span>
      </div>

      {/* Liste des produits filtrés */}
      {filteredList.length === 0 ? (
        <p className='text-stone-500 py-8 text-center bg-white rounded-xl border border-stone-200'>
          {searchTerm ? "Aucun bijou ne correspond à votre recherche." : "Aucun produit trouvé."}
        </p>
      ) : (
        filteredList.map((item) => {
          const isSharingX = sharingState?.id === item._id && sharingState?.platform === 'x';
          const isSharingIg = sharingState?.id === item._id && sharingState?.platform === 'instagram';

          return (
            <div 
              key={item._id} 
              className='grid grid-cols-[1fr_2fr_1.2fr] md:grid-cols-[1fr_2.2fr_1fr_1fr_1.1fr_1.9fr] items-center gap-2 py-3 px-4 border border-stone-200 bg-white text-sm rounded-xl hover:bg-stone-50/50 transition-colors shadow-sm'
            >
              {/* Image */}
              <img
                className='w-12 h-12 object-cover rounded-md border border-stone-200'
                src={getImageUrl(item.image)}
                alt={getImageAlt(item.image, item.nom)}
              />
              
              {/* Nom */}
              <p className='font-medium text-stone-800 truncate'>{item.nom}</p>
              
              {/* Catégorie sécurisée */}
              <p className='hidden md:block text-stone-500 truncate'>
                {getCategorieNom(item.categorie)}
              </p>
              
              {/* Prix */}
              <p className='hidden md:block font-semibold text-amber-900'>
                {item.prix?.toLocaleString()} FCFA
              </p>

              {/* TOGGLE STOCK */}
              <div className='flex items-center justify-center'>
                <button
                  type="button"
                  disabled={updatingId === item._id}
                  onClick={() => toggleStock(item._id, item.enStock !== false)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 flex items-center gap-1.5 border cursor-pointer
                    ${updatingId === item._id ? 'opacity-50 cursor-not-allowed' : ''}
                    ${item.enStock !== false
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.enStock !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className="hidden sm:inline">{item.enStock !== false ? 'En Stock' : 'Rupture'}</span>
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
