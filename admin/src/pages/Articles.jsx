import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';
import {
  Newspaper,
  Pencil,
  Trash2,
  Loader2,
  Wand2,
  Check,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Articles({ token }) {
  const [articles, setArticles] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState('tous'); // 'tous' | 'publies' | 'brouillons'
  const [searchArticle, setSearchArticle] = useState('');

  const [titre, setTitre] = useState('');
  const [extrait, setExtrait] = useState('');
  const [contenu, setContenu] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [publie, setPublie] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [produitId, setProduitId] = useState('');

  const [idEdition, setIdEdition] = useState(null);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/article/admin`, {
        headers: { token, Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setArticles(response.data.articles);
    } catch (err) {
      console.error("Erreur chargement articles:", err.message);
      toast.error("Impossible de charger les articles.");
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/produit/list`);
      if (response.data.success) setProduits(response.data.produits || []);
    } catch (err) {
      console.error("Erreur chargement produits:", err.message);
      toast.error("Impossible de charger les produits.");
    }
  };

  useEffect(() => { fetchArticles(); fetchProduits(); }, []);

  const chargerEdition = (article) => {
    setIdEdition(article._id);
    setTitre(article.titre);
    setExtrait(article.extrait);
    setContenu(article.contenu);
    setTagsInput((article.tags || []).join(', '));
    setPublie(Boolean(article.publie));
    setMetaTitle(article.metaTitle || '');
    setMetaDescription(article.metaDescription || '');
    setProduitId(article.produit?._id || article.produit || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const annulerEdition = () => {
    setIdEdition(null);
    setTitre(''); setExtrait(''); setContenu(''); setTagsInput('');
    setPublie(false); setMetaTitle(''); setMetaDescription(''); setProduitId('');
  };

  
  const generateWithAI = async () => {
    if (!produitId && !titre.trim()) {
      toast.warning("Veuillez sélectionner un bijou lié ou saisir une idée dans le champ Titre.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/article/ai-generate`,
        { sujet: titre.trim(), produitId: produitId || undefined },
        { headers: { token, Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && response.data.article) {
        const art = response.data.article;
        if (art.titre) setTitre(art.titre);
        if (art.extrait) setExtrait(art.extrait);
        if (art.contenu) setContenu(art.contenu);
        if (Array.isArray(art.tags)) setTagsInput(art.tags.join(', '));
        if (art.metaTitle) setMetaTitle(art.metaTitle);
        if (art.metaDescription) setMetaDescription(art.metaDescription);
        toast.success("Article rédigé avec succès par Groq !");
      } else {
        toast.error(response.data.message || "L'IA n'a pas pu rédiger l'article.");
      }
    } catch (err) {
      console.error("Erreur IA article:", err);
      toast.error(err.response?.data?.message || "Erreur de communication avec Groq.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titre.trim() || !extrait.trim() || !contenu.trim()) {
      toast.warning("Titre, extrait et contenu sont obligatoires.");
      return;
    }
    if (!produitId) {
      toast.warning("Veuillez sélectionner un produit.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('titre', titre.trim());
    formData.append('extrait', extrait.trim());
    formData.append('contenu', contenu.trim());
    formData.append('tags', JSON.stringify(tagsInput.split(',').map((t) => t.trim()).filter(Boolean)));
    formData.append('publie', publie ? 'true' : 'false');
    formData.append('metaTitle', metaTitle);
    formData.append('metaDescription', metaDescription);
    formData.append('produitId', produitId);

    try {
      let response;
      if (idEdition) {
        response = await axios.put(`${backendUrl}/api/article/update/${idEdition}`, formData, {
          headers: { token, Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.post(`${backendUrl}/api/article/add`, formData, {
          headers: { token, Authorization: `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        toast.success(idEdition ? "Article mis à jour !" : "Article créé !");
        annulerEdition();
        fetchArticles();
      } else {
        toast.error(response.data.message || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur enregistrement article:", error);
      toast.error(error.response?.data?.message || "Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    try {
      const response = await axios.delete(`${backendUrl}/api/article/remove/${id}`, {
        headers: { token, Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.info("Article supprimé");
        if (idEdition === id) annulerEdition();
        fetchArticles();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Impossible de supprimer l'article");
    }
  };

  const togglePublication = async (article) => {
    try {
      const formData = new FormData();
      formData.append('publie', (!article.publie).toString());
      const response = await axios.put(`${backendUrl}/api/article/update/${article._id}`, formData, {
        headers: { token, Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success(!article.publie ? "Article publié" : "Article repassé en brouillon");
        fetchArticles();
      }
    } catch (error) {
      console.error("Erreur changement de statut:", error);
      toast.error("Impossible de changer le statut de publication");
    }
  };

  return (
    <div className="max-w-6xl font-sans text-stone-800">

      <div className="mb-8">
        <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold uppercase tracking-widest mb-1">
          <Newspaper className="w-4 h-4" />
          <span>Atelier & Contenu</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Journal / Blog
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Articles pour le référencement — conseils, guides, actualités de la boutique.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* --- FORMULAIRE --- */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs lg:col-span-1 sticky top-6">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-stone-100">
            <Newspaper className="w-4 h-4 text-amber-800" />
            <h2 className="text-sm font-semibold tracking-wide text-stone-900 uppercase">
              {idEdition ? "Modifier l'article" : "Nouvel article"}
            </h2>
          </div>

                    {/* BLOC GROQ IA */}
          <div className="mb-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-amber-700" /> Rédaction Assistée par Groq
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">IA Rapide</span>
            </div>
            <p className="text-[11px] text-stone-600 mb-3 leading-relaxed">
              Sélectionnez un bijou ci-dessous ou tapez une idée dans Titre, puis cliquez pour générer tout l'article SEO.
            </p>
            <button
              type="button"
              onClick={generateWithAI}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg py-2.5 px-3 text-xs font-semibold uppercase tracking-wider shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Wand2 className={`w-3.5 h-3.5 ${aiLoading ? "animate-spin" : ""}`} />
              <span>{aiLoading ? "Groq rédige l'article..." : "Rédiger l'article avec Groq"}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Titre *
              </label>
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                placeholder="Ex: Comment entretenir vos bijoux en acier inoxydable"
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Extrait (résumé, ≤300 caractères) *
              </label>
              <textarea
                value={extrait}
                onChange={(e) => setExtrait(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="Résumé affiché sur la carte de l'article et utilisé comme description SEO si aucune n'est fournie"
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all resize-none"
                required
              />
              <span className="text-[10px] text-stone-400">{extrait.length}/300</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Contenu *
              </label>
              <textarea
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                rows={10}
                placeholder={"Rédigez l'article ici. Laissez une ligne vide entre deux paragraphes."}
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all resize-y font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Tags <span className="text-stone-400 font-normal normal-case">(séparés par des virgules)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="entretien, acier inoxydable, conseils"
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
              />
            </div>

            {/* Produit source de l'image */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Produit associé *
              </label>
              <select
                value={produitId}
                onChange={(e) => setProduitId(e.target.value)}
                className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
                required
              >
                <option value="">Choisir un produit existant</option>
                {produits.map((produit) => (
                  <option key={produit._id} value={produit._id}>{produit.nom}</option>
                ))}
              </select>
              {produitId && (() => {
                const produit = produits.find((item) => item._id === produitId);
                const imageUrl = produit?.image?.[0]?.url || produit?.image?.[0];
                return imageUrl ? (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-2">
                    <img src={imageUrl} alt={produit.nom} className="h-16 w-16 rounded-lg object-cover" />
                    <p className="text-xs text-stone-600">Image reprise automatiquement depuis ce produit.</p>
                  </div>
                ) : null;
              })()}
            </div>

            {/* SEO */}
            <div className="grid grid-cols-1 gap-3 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5 mt-2">
                  Titre SEO <span className="text-stone-400 font-normal normal-case">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  maxLength={70}
                  className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Meta Description <span className="text-stone-400 font-normal normal-case">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                  className="w-full border border-stone-200 bg-stone-50/30 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-stone-900 transition-all"
                />
              </div>
            </div>

            {/* Publication */}
            <div className="flex items-center justify-between p-4 bg-stone-50/80 border border-stone-200/60 rounded-xl">
              <div>
                <p className="text-xs font-semibold text-stone-900">Publier immédiatement</p>
                <p className="text-[11px] text-stone-500">Sinon, l'article reste en brouillon (invisible côté client).</p>
              </div>
              <input
                type="checkbox"
                checked={publie}
                onChange={() => setPublie((p) => !p)}
                className="w-4 h-4 accent-amber-900 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl font-medium text-xs uppercase tracking-widest text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  idEdition ? 'bg-amber-800 hover:bg-amber-900' : 'bg-stone-900 hover:bg-stone-950'
                }`}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /><span>Enregistrement...</span></>
                ) : (
                  <><Check size={14} className="text-amber-400" /><span>{idEdition ? "Enregistrer les modifications" : "Créer l'article"}</span></>
                )}
              </button>
              {idEdition && (
                <button
                  type="button"
                  onClick={annulerEdition}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-xl font-medium text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Annuler l'édition
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- LISTE --- */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-stone-100">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'tous', label: `Tous (${articles.length})` },
                { id: 'publies', label: `Publiés (${articles.filter((a) => a.publie).length})` },
                { id: 'brouillons', label: `Brouillons (${articles.filter((a) => !a.publie).length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltreStatut(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    filtreStatut === f.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchArticle}
                onChange={(e) => setSearchArticle(e.target.value)}
                placeholder="Rechercher un article..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-stone-900"
              />
            </div>
          </div>

          <div className="space-y-3">
            {articles
              .filter((a) => {
                if (filtreStatut === 'publies' && !a.publie) return false;
                if (filtreStatut === 'brouillons' && a.publie) return false;
                if (!searchArticle.trim()) return true;
                return String(a.titre || '').toLowerCase().includes(searchArticle.trim().toLowerCase());
              })
              .map((article) => (
              <div
                key={article._id}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  idEdition === article._id ? 'bg-amber-50/60 border-amber-200' : 'border-stone-100 hover:bg-stone-50/50'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                  {(article.image?.url || article.produit?.image?.[0]?.url) ? (
                    <img src={article.image?.url || article.produit.image[0].url} alt={article.image?.alt || article.produit.nom} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs text-stone-900 truncate">{article.titre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      article.publie ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {article.publie ? 'Publié' : 'Brouillon'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(article.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublication(article)}
                    className="p-2 text-stone-500 hover:text-amber-800 hover:bg-amber-100/60 rounded-lg transition-colors cursor-pointer"
                    title={article.publie ? "Repasser en brouillon" : "Publier"}
                  >
                    {article.publie ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    onClick={() => chargerEdition(article)}
                    className="p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-100/60 rounded-lg transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(article._id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {articles.length === 0 && (
              <div className="text-center py-12 text-stone-400 text-xs">
                <Newspaper size={32} className="mx-auto mb-2 text-stone-300" />
                <span>Aucun article pour le moment.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
