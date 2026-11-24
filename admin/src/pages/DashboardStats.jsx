import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';
import {
  Package,
  Star,
  Trophy,
  MapPin,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Layers,
  Gem,
  AlertTriangle,
  Users,
  Eye,
  ShoppingBag,
  Heart,
  MessageCircle,
  Smartphone,
  Monitor,
  Activity,
  Globe,
  Clock,
  Download
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const formatTempsRelatif = (dateStr) => {
  if (!dateStr) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  if (diffSec < 60) return "À l'instant";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH} h`;
  const diffJ = Math.floor(diffH / 24);
  return `Il y a ${diffJ} j`;
};

const getBadgeAction = (ev) => {
  switch (ev.eventType) {
    case 'product_view':
      return {
        label: 'Bijou consulté',
        detail: ev.produitNom || ev.pageLabel,
        color: 'text-sky-700 bg-sky-100 border-sky-200',
      };
    case 'add_to_cart':
      return {
        label: 'Ajouté au panier',
        detail: ev.produitNom || 'Bijou',
        color: 'text-amber-800 bg-amber-100 border-amber-200',
      };
    case 'add_to_favorites':
      return {
        label: 'Mis en favoris',
        detail: ev.produitNom || 'Bijou',
        color: 'text-rose-700 bg-rose-100 border-rose-200',
      };
    case 'checkout_start':
      return {
        label: 'Étape Livraison',
        detail: 'Formulaire de livraison ouvert',
        color: 'text-violet-700 bg-violet-100 border-violet-200',
      };
    case 'whatsapp_click':
      return {
        label: 'Clic WhatsApp',
        detail: ev.produitNom || 'Commande envoyée vers WhatsApp',
        color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
      };
    default:
      return {
        label: 'Page visitée',
        detail: ev.pageLabel || ev.path || 'Accueil',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      };
  }
};

const SOURCE_COLORS = [
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-sky-100 text-sky-800 border-sky-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-amber-100 text-amber-800 border-amber-200',
];

export default function DashboardStats({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const downloadCsv = async () => {
    try {
      setExporting(true);
      const response = await axios.get(`${backendUrl}/api/produit/export-analytics`, {
        responseType: 'blob',
        headers: {
          token: token,
          Authorization: `Bearer ${token}`,
        },
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `aridona-activite-visiteurs-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement CSV :", error);
    } finally {
      setExporting(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/produit/stats-dashboard`, {
        headers: {
          token: token,
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Erreur de chargement des indicateurs :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-white gap-4">
        <RefreshCw className="animate-spin text-amber-600 w-10 h-10" />
        <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white p-8 text-center">
        <p className="text-slate-600 text-sm">Impossible de charger les statistiques.</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-amber-700 transition-all cursor-pointer shadow-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const behavior = stats.behavior || {
    visiteursAujourdHui: 0,
    visiteurs7Jours: 0,
    visiteurs30Jours: 0,
    entonnoir: {
      pagesVues: 0,
      vuesProduits: 0,
      ajoutsPanier: 0,
      ajoutsFavoris: 0,
      debutsCommande: 0,
      clicsWhatsapp: 0,
    },
    topBijouxConsultes: [],
    appareils: [],
    sources: [],
    activiteRecente: [],
  };

  const geoChartData = {
    labels: (stats.zonesPlusDemandees || []).map((z) => z.zone),
    datasets: [
      {
        label: 'Commandes',
        data: (stats.zonesPlusDemandees || []).map((z) => z.total),
        backgroundColor: [
          'rgba(245, 158, 11, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(14, 165, 233, 0.85)',
          'rgba(139, 92, 246, 0.85)',
          'rgba(244, 63, 94, 0.85)',
        ],
        borderColor: [
          '#d97706',
          '#059669',
          '#0284c7',
          '#7c3aed',
          '#e11d48',
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const geoChartOptions = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fbbf24',
        bodyColor: '#f8fafc',
        padding: 10,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        ticks: { color: '#64748b', font: { size: 11 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#334155', font: { size: 11, weight: '600' } },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-white min-h-screen text-slate-800 font-sans">

      {/* EN-TÊTE COLORÉ SUR FOND BLANC */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-amber-50 via-rose-50/70 to-sky-50 border border-amber-200/60 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-amber-700 text-[11px] uppercase font-bold tracking-widest mb-1">
            <BarChart3 size={14} className="text-amber-600" />
            <span>Tableau de bord analytique</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide bg-gradient-to-r from-amber-700 via-rose-600 to-indigo-700 bg-clip-text text-transparent font-bold">
            Aridona Bijoux — Activité & Performances
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Suivez en direct vos visiteurs, les bijoux consultés, les ajouts au panier et vos ventes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm cursor-pointer text-xs font-semibold disabled:opacity-50"
            title="Télécharger tout l'historique des visiteurs au format CSV (Excel)"
          >
            <Download size={15} />
            <span>{exporting ? 'Export...' : 'Télécharger CSV'}</span>
          </button>

          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl hover:border-indigo-300 text-slate-700 hover:text-indigo-700 bg-white hover:bg-indigo-50/50 transition-all shadow-2xs group cursor-pointer text-xs font-semibold"
            title="Actualiser les données"
          >
            <RefreshCw size={15} className="group-hover:rotate-180 transition-transform duration-500 text-indigo-600" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1 : COMPORTEMENT DES VISITEURS ================= */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
            <Activity size={16} />
          </div>
          <h2 className="text-sm uppercase font-bold tracking-wider text-slate-800">
            Fréquentation & Comportement des Visiteurs
          </h2>
        </div>

        {/* 3 Cartes Visiteurs Uniques Colorées */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700">Visiteurs Aujourd'hui</span>
              <p className="text-3xl font-bold font-serif text-emerald-950 mt-1">
                {behavior.visiteursAujourdHui} <span className="text-xs font-sans font-medium text-emerald-700">personne{behavior.visiteursAujourdHui > 1 ? 's' : ''}</span>
              </p>
            </div>
            <div className="p-3.5 bg-emerald-500 text-white rounded-2xl shadow-sm">
              <Users size={22} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-sky-700">7 Derniers Jours</span>
              <p className="text-3xl font-bold font-serif text-sky-950 mt-1">
                {behavior.visiteurs7Jours} <span className="text-xs font-sans font-medium text-sky-700">visiteur{behavior.visiteurs7Jours > 1 ? 's' : ''}</span>
              </p>
            </div>
            <div className="p-3.5 bg-sky-500 text-white rounded-2xl shadow-sm">
              <Users size={22} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 p-5 rounded-2xl shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-violet-700">30 Derniers Jours</span>
              <p className="text-3xl font-bold font-serif text-violet-950 mt-1">
                {behavior.visiteurs30Jours} <span className="text-xs font-sans font-medium text-violet-700">visiteur{behavior.visiteurs30Jours > 1 ? 's' : ''}</span>
              </p>
            </div>
            <div className="p-3.5 bg-violet-600 text-white rounded-2xl shadow-sm">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* Entonnoir des actions multicolore */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-600 mb-4">
            Parcours des visiteurs sur le site (30 derniers jours)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-indigo-50/90 border border-indigo-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-indigo-700 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pages Vues</span>
                <Globe size={15} />
              </div>
              <p className="text-2xl font-bold font-serif text-indigo-950">{behavior.entonnoir.pagesVues}</p>
            </div>

            <div className="bg-sky-50/90 border border-sky-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-sky-700 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Bijoux Vus</span>
                <Eye size={15} />
              </div>
              <p className="text-2xl font-bold font-serif text-sky-950">{behavior.entonnoir.vuesProduits}</p>
            </div>

            <div className="bg-rose-50/90 border border-rose-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-rose-700 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Mis en Favoris</span>
                <Heart size={15} />
              </div>
              <p className="text-2xl font-bold font-serif text-rose-950">{behavior.entonnoir.ajoutsFavoris}</p>
            </div>

            <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-amber-800 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Ajouts Panier</span>
                <ShoppingBag size={15} />
              </div>
              <p className="text-2xl font-bold font-serif text-amber-950">{behavior.entonnoir.ajoutsPanier}</p>
            </div>

            <div className="bg-purple-50/90 border border-purple-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-purple-700 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Page Commande</span>
                <MapPin size={15} />
              </div>
              <p className="text-2xl font-bold font-serif text-purple-950">{behavior.entonnoir.debutsCommande}</p>
            </div>

            <div className="bg-emerald-50/90 border border-emerald-200 p-4 rounded-2xl">
              <div className="flex items-center justify-between text-emerald-700 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider">Clics WhatsApp</span>
                <MessageCircle size={15} />
              </div>
              <p className="text-2xl font-bold font-serif text-emerald-950">{behavior.entonnoir.clicsWhatsapp}</p>
            </div>
          </div>
        </div>

        {/* Grille : Journal en Direct + Top Bijoux Consultés + Origines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Journal d'activité en direct */}
          <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Clock size={15} />
                </div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-800">
                  Journal d'activité en direct (Dernières actions)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                En direct
              </span>
            </div>

            {behavior.activiteRecente.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Les actions de vos prochains visiteurs apparaîtront ici automatiquement en direct.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {behavior.activiteRecente.map((ev, index) => {
                  const badge = getBadgeAction(ev);
                  const identite = [ev.visitorName, ev.visitorEmail, ev.visitorPhone].filter(Boolean).join(' • ');
                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-1.5 bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/80 px-3.5 py-2.5 rounded-2xl text-xs transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                            #{ev.visitorCode || 'ANON'}
                          </span>
                          {identite && (
                            <span className="text-[11px] font-semibold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md truncate max-w-xs">
                              {identite}
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border shrink-0 ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-slate-800 truncate font-semibold">
                            {badge.detail}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[11px] text-slate-500 shrink-0 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            {ev.device === 'Ordinateur' ? <Monitor size={12} className="text-sky-600" /> : <Smartphone size={12} className="text-rose-600" />}
                            {ev.osBrowser || ev.device}
                          </span>
                          {(ev.visitorCity || ev.country) && (
                            <span className="text-teal-700 font-medium">• {ev.visitorCity || ev.country}</span>
                          )}
                          <span className="text-violet-700 font-semibold">• {ev.source}</span>
                          <span className="text-amber-700 font-semibold">{formatTempsRelatif(ev.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bijoux les plus consultés + Sources */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                  <Eye size={15} />
                </div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-800">
                  Bijoux les Plus Consultés
                </h3>
              </div>

              {behavior.topBijouxConsultes.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  En attente des prochaines consultations de fiches bijoux.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {behavior.topBijouxConsultes.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-800 truncate flex-1 font-semibold">
                        {item.nom}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold">
                        <span className="text-sky-700 bg-sky-100 border border-sky-200 px-2 py-0.5 rounded-md">
                          {item.vues} vue{item.vues > 1 ? 's' : ''}
                        </span>
                        {item.ajoutsPanier > 0 && (
                          <span className="text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md">
                            {item.ajoutsPanier} panier
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
              <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                  <Globe size={15} />
                </div>
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-800">
                  Origine des Visiteurs & Appareils
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">Sources d'entrée</p>
                  <div className="flex flex-wrap gap-2">
                    {behavior.sources.length === 0 ? (
                      <span className="text-slate-400 text-[11px]">Aucune donnée</span>
                    ) : (
                      behavior.sources.map((s, i) => (
                        <span key={i} className={`border px-2.5 py-1 rounded-xl text-[11px] font-semibold ${SOURCE_COLORS[i % SOURCE_COLORS.length]}`}>
                          {s.source} : <strong>{s.visiteurs}</strong>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">Appareils utilisés</p>
                  <div className="flex flex-wrap gap-2">
                    {behavior.appareils.length === 0 ? (
                      <span className="text-slate-400 text-[11px]">Aucune donnée</span>
                    ) : (
                      behavior.appareils.map((a, i) => (
                        <span key={i} className="bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl text-indigo-900 text-[11px] font-semibold">
                          {a.device} : <strong>{a.visiteurs}</strong>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= SECTION 2 : VENTES & CATALOGUE ================= */}
      <div className="pt-6 border-t border-slate-200 space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
            <TrendingUp size={16} />
          </div>
          <h2 className="text-sm uppercase font-bold tracking-wider text-slate-800">
            Résultats Commerciaux & État du Catalogue
          </h2>
        </div>

        {/* 4 Cartes KPI Multicolores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-100">Volume des Ventes</span>
              <h3 className="text-2xl font-bold font-serif tracking-tight">
                {stats.chiffreAffairesTotal.toLocaleString('fr-FR')} <span className="text-xs font-sans font-normal">FCFA</span>
              </h3>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
              <TrendingUp size={22} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-violet-100">Sélection Boutique</span>
              <h3 className="text-2xl font-bold font-serif tracking-tight">
                {stats.totalProduitsVedette} <span className="text-xs font-sans font-normal">Vedette{stats.totalProduitsVedette > 1 ? 's' : ''}</span>
              </h3>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
              <Star size={22} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100">Commandes Validées</span>
              <h3 className="text-2xl font-bold font-serif tracking-tight">
                {stats.totalCommandes} <span className="text-xs font-sans font-normal">Hors annulées</span>
              </h3>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
              <Package size={22} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
            <div className="space-y-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-100">Zone Principale</span>
              <h3 className="text-xl font-bold font-serif tracking-tight truncate max-w-[150px]">
                {stats.zoneTop || "Non définie"}
              </h3>
            </div>
            <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl shrink-0">
              <MapPin size={22} />
            </div>
          </div>

        </div>

        {/* Ligne État du catalogue */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-center gap-3.5 bg-amber-50/70 border border-amber-200 p-4 rounded-2xl">
            <div className="p-3 bg-amber-500 text-white rounded-xl shrink-0">
              <Gem size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-amber-800">Total Produits</p>
              <p className="text-xl font-bold font-serif text-amber-950">{stats.totalProduits}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl">
            <div className="p-3 bg-indigo-500 text-white rounded-xl shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-800">Total Catégories</p>
              <p className="text-xl font-bold font-serif text-indigo-950">{stats.totalCategories}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3.5 p-4 rounded-2xl border ${
            stats.rupturesStock > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'
          }`}>
            <div className={`p-3 rounded-xl shrink-0 text-white ${stats.rupturesStock > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <p className={`text-[10px] uppercase font-bold tracking-widest ${stats.rupturesStock > 0 ? 'text-rose-700' : 'text-emerald-800'}`}>Ruptures de Stock</p>
              <p className={`text-xl font-bold font-serif ${stats.rupturesStock > 0 ? 'text-rose-950' : 'text-emerald-950'}`}>{stats.rupturesStock}</p>
            </div>
          </div>
        </div>

        {/* BLOCS DE GRAPHIQUES & CLASSEMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs lg:col-span-2 space-y-6">

            <div>
              <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                  <Trophy size={16} />
                </div>
                <h2 className="text-xs uppercase font-bold tracking-wider text-slate-800">
                  Les Pièces les Plus Vendues
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.produitsPlusVendus.map((bijou, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3.5 bg-gradient-to-r from-amber-50/80 to-orange-50/50 p-3.5 rounded-2xl border border-amber-200/80"
                  >
                    <span className="font-serif text-base font-bold text-amber-700 bg-amber-100 w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {bijou.nom}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {bijou.ventes} unité{bijou.ventes > 1 ? 's' : ''} vendue{bijou.ventes > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                      {bijou.totalGenere.toLocaleString('fr-FR')} F
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-violet-100 text-violet-700">
                  <Star size={16} />
                </div>
                <h2 className="text-xs uppercase font-bold tracking-wider text-slate-800">
                  Produits Vedette de la Boutique
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.produitsVedette.map((bijou, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3.5 bg-gradient-to-r from-violet-50/80 to-fuchsia-50/50 p-3.5 rounded-2xl border border-violet-200/80"
                  >
                    <span className="font-serif text-base font-bold text-violet-700 bg-violet-100 w-7 h-7 rounded-full flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {bijou.nom}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {bijou.categorie}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-violet-700 bg-violet-100 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-violet-200">
                      <Star size={12} fill="currentColor" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                  <BarChart3 size={16} />
                </div>
                <h2 className="text-xs uppercase font-bold tracking-wider text-slate-800">
                  Zones à Forte Demande
                </h2>
              </div>
              <p className="text-[11px] text-slate-500">
                Répartition des commandes par quartier ou ville.
              </p>
            </div>

            <div className="h-64 relative my-4">
              <Bar data={geoChartData} options={geoChartOptions} />
            </div>

            <div className="text-[11px] text-indigo-800 bg-indigo-50 p-3 rounded-2xl border border-indigo-200 text-center font-medium">
              Données utiles pour ajuster vos livraisons et cibler vos publications.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
