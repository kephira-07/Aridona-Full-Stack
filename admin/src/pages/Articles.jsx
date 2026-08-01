import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';
import {
  Newspaper,
  Pencil,
  Trash2,
  Upload,
  X,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Articles({ token }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [titre, setTitre] = useState('');
  const [extrait, setExtrait] = useState('');
  const [contenu, setContenu] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [publie, setPublie] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [alt, setAlt] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

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

  useEffect(() => { fetchArticles(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (idEdition) {
      const current = articles.find((a) => a._id === idEdition);
      setPreview(current ? current.image?.url : null);
    } else {
      setPreview(null);
    }
  };

  const chargerEdition = (article) => {
    setIdEdition(article._id);
    setTitre(article.titre);
    setExtrait(article.extrait);
    setContenu(article.contenu);
    setTagsInput((article.tags || []).join(', '));
    setPublie(Boolean(article.publie));
    setMetaTitle(article.metaTitle || '');
    setMetaDescription(article.metaDescription || '');
    setAlt(article.image?.alt || '');
    setPreview(article.image?.url || null);
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const annulerEdition = () => {
    setIdEdition(null);
    setTitre(''); setExtrait(''); setContenu(''); setTagsInput('');
    setPublie(false); setMetaTitle(''); setMetaDescription(''); setAlt('');
    setImage(null); setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titre.trim() || !extrait.trim() || !contenu.trim()) {
      toast.warning("Titre, extrait et contenu sont obligatoires.");
      return;
    }
    if (!idEdition && !image) {
      toast.warning("Veuillez sélectionner une image de couverture.");
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
    formData.append('alt', alt);
    if (image) formData.append('image', image);

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
        toast.success(idEdition ? "✨ Article mis à jour !" : "✨ Article créé !");
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

            {/* Image */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Image de couverture {idEdition && "(Optionnelle)"}
              </label>
              {preview ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-stone-200 group">
                  <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                  {image && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full transition-colors shadow-md"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <label className="w-full h-32 border-2 border-dashed border-stone-200 hover:border-amber-700/60 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-all text-center p-4 group">
                  <div className="p-2.5 rounded-full bg-white border border-stone-200 group-hover:border-amber-600/40 text-stone-400 group-hover:text-amber-700 transition-all mb-2 shadow-xs">
                    <Upload size={16} />
                  </div>
                  <span className="text-xs font-medium text-stone-600 group-hover:text-stone-900">
                    Cliquez pour choisir une image
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" required={!idEdition} />
                </label>
              )}
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Texte alternatif de l'image (SEO)"
                className="w-full mt-2 border border-stone-200 bg-stone-50/30 rounded-lg px-3 py-2 text-[11px] outline-none focus:bg-white focus:border-stone-900 transition-all"
              />
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
                  <><Sparkles size={14} className="text-amber-400" /><span>{idEdition ? "Enregistrer les modifications" : "Créer l'article"}</span></>
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
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
            <h2 className="text-sm font-semibold tracking-wide text-stone-900 uppercase">Articles</h2>
            <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-semibold">
              {articles.length} au total
            </span>
          </div>

          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article._id}
                className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  idEdition === article._id ? 'bg-amber-50/60 border-amber-200' : 'border-stone-100 hover:bg-stone-50/50'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                  {article.image?.url ? (
                    <img src={article.image.url} alt={article.image.alt} className="w-full h-full object-cover" />
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
