import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Package, Plus, X, Wand2, Search, Check } from 'lucide-react';
import { backendUrl } from '../config';
import { toast } from 'react-toastify';

const emptyForm = { nom: '', description: '', prix: '', produits: [] };

const getProductImage = (product) => {
  const first = Array.isArray(product?.image) ? product.image[0] : product?.image;
  return typeof first === 'object' ? first?.url : first;
};

export default function Packs({ token }) {
  const [packs, setPacks] = useState([]);
  const [produits, setProduits] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');

  const headers = { token, Authorization: `Bearer ${token}` };
  const load = async () => {
    try {
      const [packsResponse, productsResponse] = await Promise.all([
        axios.get(`${backendUrl}/api/packs/admin`, { headers }),
        axios.get(`${backendUrl}/api/produit/list`),
      ]);
      setPacks(packsResponse.data.packs || []);
      setProduits(productsResponse.data.produits || []);
    } catch (error) {
      toast.error('Impossible de charger les packs et produits.');
    }
  };

  useEffect(() => { load(); }, []);

  const reset = () => { setForm(emptyForm); setEditingId(null); };
  const addProduct = (id) => {
    if (!id || form.produits.some((item) => item.produit === id)) return;
    setForm({ ...form, produits: [...form.produits, { produit: id, quantite: 1 }] });
  };
  const removeProduct = (id) => setForm({ ...form, produits: form.produits.filter((item) => item.produit !== id) });
  const updateQuantity = (id, value) => setForm({ ...form, produits: form.produits.map((item) => item.produit === id ? { ...item, quantite: Number(value) } : item) });

  const submit = async (event) => {
    event.preventDefault();
    if (form.produits.length < 2) return toast.warning('Sélectionne au moins deux produits.');
    setLoading(true);
    try {
      const request = editingId
        ? axios.put(`${backendUrl}/api/packs/${editingId}`, form, { headers })
        : axios.post(`${backendUrl}/api/packs`, form, { headers });
      await request;
      toast.success(editingId ? 'Pack modifié.' : 'Pack créé.');
      reset();
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible d’enregistrer le pack.');
    } finally { setLoading(false); }
  };

  const edit = (pack) => {
    setEditingId(pack._id);
    setForm({ nom: pack.nom, description: pack.description, prix: pack.prix, produits: pack.produits.map((item) => ({ produit: item.produit?._id || item.produit, quantite: item.quantite })) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateWithAI = async () => {
    if (form.produits.length < 2) {
      toast.warning("Sélectionnez au moins 2 bijoux à gauche pour que l'IA compose l'offre.");
      return;
    }
    setAiLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/packs/ai-generate`,
        { produitIds: form.produits.map((item) => item.produit) },
        { headers }
      );
      if (response.data.success && response.data.pack) {
        const { nom, description, prixSuggere } = response.data.pack;
        setForm((prev) => ({
          ...prev,
          nom: nom || prev.nom,
          description: description || prev.description,
          prix: prixSuggere !== undefined ? String(prixSuggere) : prev.prix,
        }));
        toast.success("Pack composé avec succès par Groq !");
      } else {
        toast.error(response.data.message || "L'IA n'a pas pu composer le pack.");
      }
    } catch (err) {
      console.error("Erreur IA pack:", err);
      toast.error(err.response?.data?.message || "Erreur de communication avec Groq.");
    } finally {
      setAiLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce pack ?')) return;
    try { await axios.delete(`${backendUrl}/api/packs/${id}`, { headers }); toast.success('Pack supprimé.'); load(); } catch { toast.error('Suppression impossible.'); }
  };

  const filteredProducts = produits.filter(
    (p) => !searchProduct.trim() || p.nom.toLowerCase().includes(searchProduct.trim().toLowerCase())
  );

  const valeurSeparee = form.produits.reduce((sum, item) => {
    const prod = produits.find((p) => p._id === item.produit);
    return sum + Number(prod?.prix || 0) * Number(item.quantite || 1);
  }, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-sans text-stone-800">
      {/* En-tête */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-800">
            <Package size={16} />
            <span>Offres composées</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold text-stone-900">Packs de bijoux</h1>
          <p className="mt-1 text-xs text-stone-500">
            1. Cliquez sur les bijoux que vous voulez assembler • 2. Remplissez ou générez l'offre à droite.
          </p>
        </div>
        {editingId && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50 cursor-pointer"
          >
            <X size={14} />
            Annuler la modification
          </button>
        )}
      </div>

      {/* Bloc principal : Création / Modification en 2 étapes claires */}
      <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="mb-5 flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-900">
            {editingId ? 'Modifier le pack' : 'Nouveau pack'}
          </h2>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-900 border border-amber-200/70">
            {form.produits.length} bijou{form.produits.length > 1 ? 'x' : ''} sélectionné{form.produits.length > 1 ? 's' : ''}
            {valeurSeparee > 0 && ` • Valeur : ${valeurSeparee.toLocaleString('fr-FR')} FCFA`}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* ÉTAPE 1 : Grille visuelle des bijoux */}
          <div className="space-y-3 lg:col-span-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs font-semibold text-stone-700">
                Étape 1 — Cliquez sur les photos pour ajouter au pack
              </span>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  placeholder="Rechercher un bijou..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2 pl-9 pr-3 text-xs focus:border-amber-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid max-h-[420px] grid-cols-2 gap-2.5 overflow-y-auto rounded-2xl border border-stone-200 bg-stone-50/50 p-3 sm:grid-cols-3 md:grid-cols-4">
              {filteredProducts.map((p) => {
                const isSelected = form.produits.some((item) => item.produit === p._id);
                const imgUrl = getProductImage(p);
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => (isSelected ? removeProduct(p._id) : addProduct(p._id))}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-700 bg-amber-50 ring-2 ring-amber-700/80 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-amber-400 hover:shadow-xs'
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.nom} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-stone-400">Sans image</div>
                      )}
                      {isSelected && (
                        <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-white shadow">
                          <Check size={13} />
                        </span>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="truncate text-[11px] font-semibold text-stone-800">{p.nom}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-amber-800">{Number(p.prix || 0).toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ÉTAPE 2 : Infos du pack et validation */}
          <div className="flex flex-col justify-between space-y-4 lg:col-span-5">
            <div className="space-y-3.5">
              <span className="block text-xs font-semibold text-stone-700">
                Étape 2 — Détails du pack
              </span>

              {/* Mini-liste des bijoux retenus */}
              {form.produits.length > 0 ? (
                <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/60 p-2">
                  {form.produits.map((item) => {
                    const p = produits.find((product) => product._id === item.produit);
                    const imgUrl = getProductImage(p);
                    return (
                      <div key={item.produit} className="flex items-center gap-2.5 rounded-lg bg-white p-1.5 text-xs border border-stone-100">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-stone-100">
                          {imgUrl && <img src={imgUrl} alt={p?.nom || ''} className="h-full w-full object-cover" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-stone-800">{p?.nom || 'Produit'}</p>
                          <p className="text-[10px] text-stone-500">{Number(p?.prix || 0).toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={item.quantite}
                          onChange={(e) => updateQuantity(item.produit, e.target.value)}
                          className="w-12 rounded-md border border-stone-200 p-1 text-center text-xs"
                          title="Quantité"
                        />
                        <button type="button" onClick={() => removeProduct(item.produit)} aria-label="Retirer le produit" className="p-1 text-stone-400 hover:text-red-600 cursor-pointer">
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/40 p-4 text-center text-xs text-stone-400">
                  Sélectionnez au moins 2 bijoux à gauche.
                </div>
              )}

              <button
                type="button"
                onClick={generateWithAI}
                disabled={aiLoading || form.produits.length < 2}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-white shadow-xs hover:from-amber-800 hover:to-amber-900 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Wand2 size={14} className={aiLoading ? "animate-spin" : ""} />
                <span>{aiLoading ? "Groq compose l'offre..." : "Remplir automatiquement avec Groq"}</span>
              </button>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Nom du pack" className="w-full rounded-xl border border-stone-200 bg-stone-50/40 p-3 text-xs" />
                <input required type="number" min="0" step="1" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} placeholder="Prix du pack (FCFA)" className="w-full rounded-xl border border-stone-200 bg-stone-50/40 p-3 text-xs" />
              </div>

              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de l'offre" rows="3" className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50/40 p-3 text-xs" />
            </div>

            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-60">
              {editingId ? <Pencil size={14} /> : <Plus size={14} />}
              {loading ? 'Enregistrement...' : editingId ? 'Enregistrer les modifications' : 'Créer le pack'}
            </button>
          </div>
        </div>
      </form>

      {/* Liste des packs existants */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
          Packs enregistrés ({packs.length})
        </h2>
        {packs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-sm text-stone-400">
            Aucun pack créé pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {packs.map((pack) => (
              <div key={pack._id} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                <div className="grid h-20 w-20 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-xl bg-stone-100">
                  {pack.produits.slice(0, 4).map((item) => item.produit?.image?.[0]?.url && (
                    <img key={item.produit._id} src={item.produit.image[0].url} alt="" className="h-full w-full object-cover" />
                  ))}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-ebgaramond text-xl text-stone-900 truncate">{pack.nom}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-stone-500">{pack.description}</p>
                  <p className="mt-2 text-sm font-semibold text-amber-900">{Number(pack.prix).toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => edit(pack)} aria-label="Modifier le pack" className="rounded-lg p-2 text-stone-500 hover:bg-amber-50 hover:text-amber-800 cursor-pointer">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove(pack._id)} aria-label="Supprimer le pack" className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 cursor-pointer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
