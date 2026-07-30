import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../config';
import { Star, Check, Trash2, MessageSquareText, Clock } from 'lucide-react';

const Avis = ({ token }) => {
  const [avisListe, setAvisListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filtre, setFiltre] = useState('attente'); // 'attente' | 'tous'

  const fetchAvis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/avis/admin`, {
        headers: { token, Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAvisListe(response.data.avis);
      } else {
        toast.error(response.data.message || "Impossible de charger les avis.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvis();
  }, []);

  const approuverAvis = async (id) => {
    try {
      setBusyId(id);
      const response = await axios.put(`${backendUrl}/api/avis/approuver/${id}`, {}, {
        headers: { token, Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Avis approuvé et publié !");
        setAvisListe(prev => prev.map(a => a._id === id ? { ...a, approuve: true } : a));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setBusyId(null);
    }
  };

  const supprimerAvis = async (id) => {
    if (!window.confirm("Supprimer définitivement cet avis ?")) return;
    try {
      setBusyId(id);
      const response = await axios.delete(`${backendUrl}/api/avis/supprimer/${id}`, {
        headers: { token, Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success("Avis supprimé.");
        setAvisListe(prev => prev.filter(a => a._id !== id));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setBusyId(null);
    }
  };

  const avisFiltres = filtre === 'attente' ? avisListe.filter(a => !a.approuve) : avisListe;
  const nombreEnAttente = avisListe.filter(a => !a.approuve).length;

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-[200px] text-stone-500'>
        Chargement des avis...
      </div>
    );
  }

  return (
    <div className="max-w-5xl font-sans text-stone-800">

      <div className="mb-8">
        <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold uppercase tracking-widest mb-1">
          <MessageSquareText className="w-4 h-4" />
          <span>Atelier & Réputation</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Modération des Avis
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Un avis n'est visible sur la fiche produit et dans les données Google qu'après approbation.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setFiltre('attente')}
          className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
            filtre === 'attente'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Clock size={13} />
          <span>En attente {nombreEnAttente > 0 && `(${nombreEnAttente})`}</span>
        </button>
        <button
          type="button"
          onClick={() => setFiltre('tous')}
          className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            filtre === 'tous'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          Tous ({avisListe.length})
        </button>
      </div>

      {avisFiltres.length === 0 ? (
        <p className='text-stone-500 py-12 text-center bg-white rounded-xl border border-stone-200 text-sm'>
          {filtre === 'attente' ? "Aucun avis en attente de modération." : "Aucun avis pour le moment."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {avisFiltres.map((item) => (
            <div
              key={item._id}
              className={`p-4 rounded-xl border bg-white shadow-xs ${item.approuve ? 'border-stone-200' : 'border-amber-300/60 bg-amber-50/30'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-stone-900">{item.nom}</span>
                  <span className="text-stone-300">•</span>
                  <span className="text-xs text-stone-500">{item.produit?.nom || 'Produit supprimé'}</span>
                  {!item.approuve && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase tracking-wider rounded-full">
                      En attente
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-400">
                  {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="flex text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className={i < item.note ? "fill-amber-500" : "text-stone-200"} />
                ))}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed italic mb-3">"{item.commentaire}"</p>

              <div className="flex items-center gap-2">
                {!item.approuve && (
                  <button
                    type="button"
                    disabled={busyId === item._id}
                    onClick={() => approuverAvis(item._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Check size={13} /> Approuver
                  </button>
                )}
                <button
                  type="button"
                  disabled={busyId === item._id}
                  onClick={() => supprimerAvis(item._id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Avis;
