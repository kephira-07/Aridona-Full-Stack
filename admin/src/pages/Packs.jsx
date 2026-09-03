import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Package, Plus, X } from 'lucide-react';
import { backendUrl } from '../config';
import { toast } from 'react-toastify';

const emptyForm = { nom: '', description: '', prix: '', produits: [] };

export default function Packs({ token }) {
  const [packs, setPacks] = useState([]);
  const [produits, setProduits] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

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
  const remove = async (id) => {
    if (!window.confirm('Supprimer ce pack ?')) return;
    try { await axios.delete(`${backendUrl}/api/packs/${id}`, { headers }); toast.success('Pack supprimé.'); load(); } catch { toast.error('Suppression impossible.'); }
  };

  return (
    <div className="max-w-6xl font-sans text-stone-800">
      <div className="mb-8"><div className="flex items-center gap-2 text-amber-800 text-xs font-semibold uppercase tracking-widest"><Package size={16} /><span>Offres composées</span></div><h1 className="mt-1 text-2xl font-semibold text-stone-900">Packs de bijoux</h1><p className="mt-1 text-xs text-stone-500">Compose une offre avec les produits déjà présents dans ton catalogue.</p></div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={submit} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs lg:col-span-1">
          <div className="mb-5 flex items-center justify-between border-b border-stone-100 pb-3"><h2 className="text-sm font-semibold uppercase tracking-wide">{editingId ? 'Modifier le pack' : 'Créer un pack'}</h2>{editingId && <button type="button" onClick={reset} aria-label="Annuler" className="text-stone-400"><X size={16} /></button>}</div>
          <div className="space-y-4">
            <input required value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Nom du pack" className="w-full rounded-xl border border-stone-200 bg-stone-50/40 p-3 text-xs" />
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description de l'offre" rows="4" className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50/40 p-3 text-xs" />
            <input required type="number" min="0" step="1" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} placeholder="Prix du pack en FCFA" className="w-full rounded-xl border border-stone-200 bg-stone-50/40 p-3 text-xs" />
            <select onChange={(e) => addProduct(e.target.value)} value="" className="w-full rounded-xl border border-stone-200 bg-stone-50/40 p-3 text-xs"><option value="">Ajouter un produit existant</option>{produits.map((p) => <option key={p._id} value={p._id}>{p.nom}</option>)}</select>
            <div className="space-y-2">{form.produits.map((item) => { const p = produits.find((product) => product._id === item.produit); return <div key={item.produit} className="flex items-center gap-2 rounded-xl bg-stone-50 p-2 text-xs"><span className="min-w-0 flex-1 truncate">{p?.nom || 'Produit'}</span><input type="number" min="1" max="20" value={item.quantite} onChange={(e) => updateQuantity(item.produit, e.target.value)} className="w-14 rounded-lg border border-stone-200 p-2" /><button type="button" onClick={() => removeProduct(item.produit)} aria-label="Retirer le produit" className="text-stone-400 hover:text-red-600"><X size={14} /></button></div>; })}</div>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-xs font-semibold uppercase tracking-widest text-white">{editingId ? <Pencil size={14} /> : <Plus size={14} />}{loading ? 'Enregistrement...' : editingId ? 'Enregistrer' : 'Créer le pack'}</button>
          </div>
        </form>
        <div className="space-y-3 lg:col-span-2">{packs.map((pack) => <div key={pack._id} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs"><div className="grid h-16 w-16 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-xl bg-stone-100">{pack.produits.slice(0, 4).map((item) => item.produit?.image?.[0]?.url && <img key={item.produit._id} src={item.produit.image[0].url} alt="" className="h-full w-full object-cover" />)}</div><div className="min-w-0 flex-1"><h3 className="font-ebgaramond text-xl text-stone-900">{pack.nom}</h3><p className="mt-1 line-clamp-2 text-xs text-stone-500">{pack.description}</p><p className="mt-2 text-sm font-semibold text-amber-900">{Number(pack.prix).toLocaleString('fr-FR')} FCFA</p></div><button onClick={() => edit(pack)} aria-label="Modifier le pack" className="p-2 text-stone-500 hover:text-amber-800"><Pencil size={16} /></button><button onClick={() => remove(pack._id)} aria-label="Supprimer le pack" className="p-2 text-stone-400 hover:text-red-600"><Trash2 size={16} /></button></div>)}{packs.length === 0 && <div className="rounded-2xl border border-dashed border-stone-300 p-12 text-center text-sm text-stone-400">Aucun pack créé pour le moment.</div>}</div>
      </div>
    </div>
  );
}
