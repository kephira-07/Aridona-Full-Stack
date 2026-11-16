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
  Sparkles,
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
        color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      };
    case 'add_to_cart':
      return {
        label: 'Ajouté au panier',
        detail: ev.produitNom || 'Bijou',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      };
    case 'add_to_favorites':
      return {
        label: 'Mis en favoris',
        detail: ev.produitNom || 'Bijou',
        color: 'text-pink-400 bg-pink-500/10 border-pink-500/25',
      };
    case 'checkout_start':
      return {
        label: 'Étape Livraison',
        detail: 'Formulaire de livraison ouvert',
        color: 'text-violet-400 bg-violet-500/10 border-violet-500/25',
      };
    case 'whatsapp_click':
      return {
        label: 'Clic WhatsApp',
        detail: ev.produitNom || 'Commande envoyée vers WhatsApp',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      };
    default:
      return {
        label: 'Page visitée',
        detail: ev.pageLabel || ev.path || 'Accueil',
        color: 'text-stone-300 bg-stone-800 border-stone-700',
      };
  }
};

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
      <div className="flex flex-col justify-center items-center h-screen bg-stone-950 gap-4">
        <RefreshCw className="animate-spin text-amber-500 w-10 h-10" />
        <span className="text-xs uppercase tracking-widest text-stone-500 font-medium">Chargement du tableau de bord...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-stone-950 p-8 text-center">
        <p className="text-stone-400 text-sm">Impossible de charger les statistiques.</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-stone-900 border border-stone-800 rounded-xl text-amber-500 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 transition-all cursor-pointer"
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
        label: 'Demandes / Commandes',
        data: (stats.zonesPlusDemandees || []).map((z) => z.total),
        backgroundColor: 'rgba(217, 119, 6, 0.85)',
        borderColor: '#d97706',
        borderWidth: 1,
        borderRadius: 8,
        hoverBackgroundColor: '#f59e0b',
      },
    ],
  };

  const geoChartOptions = {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1c1917',
        titleColor: '#f59e0b',
        bodyColor: '#e7e5e4',
        borderColor: '#292524',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#78716c', font: { size: 10 } },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#d6d3d1', font: { size: 11, weight: '500' } },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto bg-stone-950 min-h-screen text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">

      {/* EN-TÊTE PREMIUM */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500/80 text-[11px] uppercase font-bold tracking-widest mb-1">
            <Sparkles size={14} />
            <span>Vue d'ensemble analytique</span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl tracking-wide bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent font-bold">
            Aridona Héritage — Suivi & Comportement
          </h1>
          <p className="text-xs text-stone-400 mt-1 tracking-wide">
            Suivez en direct qui visite votre site, quels bijoux attirent l'attention et ce que font vos visiteurs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCsv}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 border border-amber-500/40 rounded-xl hover:border-amber-400 text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 transition-all shadow-lg cursor-pointer text-xs font-semibold disabled:opacity-50"
            title="Télécharger tout l'historique des visiteurs au format CSV (Excel)"
          >
            <Download size={16} />
            <span>{exporting ? 'Export...' : 'Télécharger CSV'}</span>
          </button>

          <button
            onClick={fetchStats}
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-800 rounded-xl hover:border-amber-500/50 text-stone-300 hover:text-amber-400 bg-stone-900/80 transition-all shadow-lg hover:shadow-amber-500/5 group cursor-pointer text-xs font-medium"
            title="Actualiser les données"
          >
            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* ================= SECTION 1 : COMPORTEMENT DES VISITEURS ================= */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-amber-400" />
          <h2 className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Fréquentation & Parcours des Visiteurs
          </h2>
        </div>

        {/* Cartes Visiteurs Uniques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-emerald-400">Visiteurs Aujourd'hui</span>
              <p className="text-2xl font-bold font-serif text-white mt-1">
                {behavior.visiteursAujourdHui} <span className="text-xs font-sans font-normal text-stone-400">personne{behavior.visiteursAujourdHui > 1 ? 's' : ''}</span>
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-sky-400">7 Derniers Jours</span>
              <p className="text-2xl font-bold font-serif text-white mt-1">
                {behavior.visiteurs7Jours} <span className="text-xs font-sans font-normal text-stone-400">visiteur{behavior.visiteurs7Jours > 1 ? 's' : ''}</span>
              </p>
            </div>
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-widest text-amber-400">30 Derniers Jours</span>
              <p className="text-2xl font-bold font-serif text-white mt-1">
                {behavior.visiteurs30Jours} <span className="text-xs font-sans font-normal text-stone-400">visiteur{behavior.visiteurs30Jours > 1 ? 's' : ''}</span>
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Users size={20} />
            </div>
          </div>
        </div>

        {/* Entonnoir des actions sur 30 jours */}
        <div className="bg-stone-900/80 border border-stone-800/80 p-5 rounded-2xl">
          <p className="text-[11px] uppercase font-semibold tracking-wider text-stone-400 mb-4">
            Entonnoir du comportement sur le site (30 derniers jours)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-stone-950/90 border border-stone-800/80 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-stone-400 mb-1">
                <span className="text-[10px] uppercase tracking-wider">Pages Vues</span>
                <Globe size={14} />
              </div>
              <p className="text-xl font-bold font-serif text-white">{behavior.entonnoir.pagesVues}</p>
            </div>

            <div className="bg-stone-950/90 border border-sky-500/20 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-sky-400 mb-1">
                <span className="text-[10px] uppercase tracking-wider">Bijoux Vus</span>
                <Eye size={14} />
              </div>
              <p className="text-xl font-bold font-serif text-white">{behavior.entonnoir.vuesProduits}</p>
            </div>

            <div className="bg-stone-950/90 border border-pink-500/20 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-pink-400 mb-1">
                <span className="text-[10px] uppercase tracking-wider">Mis en Favoris</span>
                <Heart size={14} />
              </div>
              <p className="text-xl font-bold font-serif text-white">{behavior.entonnoir.ajoutsFavoris}</p>
            </div>

            <div className="bg-stone-950/90 border border-amber-500/25 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <span className="text-[10px] uppercase tracking-wider">Ajouts Panier</span>
                <ShoppingBag size={14} />
              </div>
              <p className="text-xl font-bold font-serif text-white">{behavior.entonnoir.ajoutsPanier}</p>
            </div>

            <div className="bg-stone-950/90 border border-violet-500/25 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-violet-400 mb-1">
                <span className="text-[10px] uppercase tracking-wider">Page Livraison</span>
                <MapPin size={14} />
              </div>
              <p className="text-xl font-bold font-serif text-white">{behavior.entonnoir.debutsCommande}</p>
            </div>

            <div className="bg-stone-950/90 border border-emerald-500/30 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-[10px] uppercase tracking-wider">Clics WhatsApp</span>
                <MessageCircle size={14} />
              </div>
              <p className="text-xl font-bold font-serif text-white">{behavior.entonnoir.clicsWhatsapp}</p>
            </div>
          </div>
        </div>

        {/* Grille : Journal en Direct + Top Bijoux Consultés + Origines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Journal d'activité en direct */}
          <div className="bg-stone-900/80 border border-stone-800/80 p-5 rounded-2xl lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800/60">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-amber-400" />
                <h3 className="text-xs uppercase font-semibold tracking-wider text-stone-200">
                  Journal d'activité en direct (Dernières actions)
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Temps réel
              </span>
            </div>

            {behavior.activiteRecente.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500">
                Les actions de vos prochains visiteurs apparaîtront ici automatiquement en direct.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {behavior.activiteRecente.map((ev, index) => {
                  const badge = getBadgeAction(ev);
                  const identite = [ev.visitorName, ev.visitorEmail, ev.visitorPhone].filter(Boolean).join(' • ');
                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-1.5 bg-stone-950/80 border border-stone-800/70 px-3.5 py-2.5 rounded-xl text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span className="text-[10px] font-mono text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800 shrink-0">
                            #{ev.visitorCode || 'ANON'}
                          </span>
                          {identite && (
                            <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md truncate max-w-xs">
                              {identite}
                            </span>
                          )}
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-stone-200 truncate font-medium">
                            {badge.detail}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 text-[11px] text-stone-500 shrink-0 flex-wrap">
                          <span className="flex items-center gap-1 text-stone-400">
                            {ev.device === 'Ordinateur' ? <Monitor size={12} /> : <Smartphone size={12} />}
                            {ev.osBrowser || ev.device}
                          </span>
                          {(ev.visitorCity || ev.country) && (
                            <span className="text-stone-400">• {ev.visitorCity || ev.country}</span>
                          )}
                          <span className="text-stone-300 font-medium">• {ev.source}</span>
                          <span className="text-amber-500/80 font-medium">{formatTempsRelatif(ev.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bijoux qui attirent le plus l'attention + Sources */}
          <div className="space-y-6">
            <div className="bg-stone-900/80 border border-stone-800/80 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-800/60">
                <Eye size={15} className="text-sky-400" />
                <h3 className="text-xs uppercase font-semibold tracking-wider text-stone-200">
                  Bijoux les Plus Consultés
                </h3>
              </div>

              {behavior.topBijouxConsultes.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">
                  En attente des prochaines consultations de fiches bijoux.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {behavior.topBijouxConsultes.map((item, idx) => (
                    <div key={idx} className="bg-stone-950/80 border border-stone-800/70 p-2.5 rounded-xl flex items-center justify-between gap-2">
                      <span className="text-xs text-stone-200 truncate flex-1 font-medium">
                        {item.nom}
                      </span>
                      <div className="flex items-center gap-2 shrink-0 text-[11px]">
                        <span className="text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded" title="Vues de la fiche">
                          {item.vues} vue{item.vues > 1 ? 's' : ''}
                        </span>
                        {item.ajoutsPanier > 0 && (
                          <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded" title="Ajouts au panier">
                            {item.ajoutsPanier} panier
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-stone-900/80 border border-stone-800/80 p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-800/60">
                <Globe size={15} className="text-amber-400" />
                <h3 className="text-xs uppercase font-semibold tracking-wider text-stone-200">
                  Origine des Visiteurs & Appareils
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">Sources d'entrée</p>
                  <div className="flex flex-wrap gap-2">
                    {behavior.sources.length === 0 ? (
                      <span className="text-stone-500 text-[11px]">Aucune donnée</span>
                    ) : (
                      behavior.sources.map((s, i) => (
                        <span key={i} className="bg-stone-950 border border-stone-800 px-2.5 py-1 rounded-lg text-stone-300 text-[11px]">
                          {s.source} : <strong className="text-amber-400">{s.visiteurs}</strong>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-800/60">
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 mb-1.5">Appareils</p>
                  <div className="flex flex-wrap gap-2">
                    {behavior.appareils.length === 0 ? (
                      <span className="text-stone-500 text-[11px]">Aucune donnée</span>
                    ) : (
                      behavior.appareils.map((a, i) => (
                        <span key={i} className="bg-stone-950 border border-stone-800 px-2.5 py-1 rounded-lg text-stone-300 text-[11px]">
                          {a.device} : <strong className="text-sky-400">{a.visiteurs}</strong>
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
      <div className="pt-4 border-t border-stone-800/80 space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-amber-400" />
          <h2 className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Résultats Commerciaux & État du Catalogue
          </h2>
        </div>

        {/* BENTO GRID : Métriques Clés de Performance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-stone-900/80 border border-stone-800/80 p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all">
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] uppercase font-semibold tracking-widest text-amber-500/80">Volume des Ventes</span>
              <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
                {stats.chiffreAffairesTotal.toLocaleString('fr-FR')} <span className="text-xs text-amber-400 font-sans font-normal">FCFA</span>
              </h3>
            </div>
            <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 z-10">
              <TrendingUp size={22} strokeWidth={1.5} />
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          </div>

          <div className="bg-stone-900/80 border border-stone-800/80 p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-violet-500/30 transition-all">
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] uppercase font-semibold tracking-widest text-violet-400/80">Sélection Boutique</span>
              <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
                {stats.totalProduitsVedette} <span className="text-xs text-violet-400 font-sans font-normal">Vedette{stats.totalProduitsVedette > 1 ? 's' : ''}</span>
              </h3>
            </div>
            <div className="p-3.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20 z-10">
              <Star size={22} strokeWidth={1.5} />
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all" />
          </div>

          <div className="bg-stone-900/80 border border-stone-800/80 p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] uppercase font-semibold tracking-widest text-emerald-400/80">Commandes Traitées</span>
              <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
                {stats.totalCommandes} <span className="text-xs text-emerald-400 font-sans font-normal">Expédiées</span>
              </h3>
            </div>
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 z-10">
              <Package size={22} strokeWidth={1.5} />
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          </div>

          <div className="bg-stone-900/80 border border-stone-800/80 p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-sky-500/30 transition-all">
            <div className="space-y-1.5 z-10">
              <span className="text-[10px] uppercase font-semibold tracking-widest text-sky-400/80">Zone Principale</span>
              <h3 className="text-lg font-bold font-serif text-white tracking-tight truncate max-w-[160px]">
                {stats.zoneTop || "Non définie"}
              </h3>
            </div>
            <div className="p-3.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20 z-10">
              <MapPin size={22} strokeWidth={1.5} />
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all" />
          </div>

        </div>

        {/* LIGNE SECONDAIRE : État du catalogue */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex items-center gap-3.5 bg-stone-900/60 border border-stone-800/60 p-4 rounded-2xl">
            <div className="p-2.5 bg-stone-800 text-stone-300 rounded-lg shrink-0">
              <Gem size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-widest text-stone-500">Total Produits</p>
              <p className="text-lg font-bold font-serif text-white">{stats.totalProduits}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-stone-900/60 border border-stone-800/60 p-4 rounded-2xl">
            <div className="p-2.5 bg-stone-800 text-stone-300 rounded-lg shrink-0">
              <Layers size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-widest text-stone-500">Total Catégories</p>
              <p className="text-lg font-bold font-serif text-white">{stats.totalCategories}</p>
            </div>
          </div>

          <div className={`flex items-center gap-3.5 p-4 rounded-2xl border ${
            stats.rupturesStock > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-stone-900/60 border-stone-800/60'
          }`}>
            <div className={`p-2.5 rounded-lg shrink-0 ${stats.rupturesStock > 0 ? 'bg-red-500/15 text-red-400' : 'bg-stone-800 text-stone-300'}`}>
              <AlertTriangle size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className={`text-[10px] uppercase font-semibold tracking-widest ${stats.rupturesStock > 0 ? 'text-red-400/90' : 'text-stone-500'}`}>Ruptures de Stock</p>
              <p className={`text-lg font-bold font-serif ${stats.rupturesStock > 0 ? 'text-red-300' : 'text-white'}`}>{stats.rupturesStock}</p>
            </div>
          </div>
        </div>

        {/* BLOCS DE GRAPHIQUES & CLASSEMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="bg-stone-900/80 border border-stone-800/80 p-6 rounded-2xl shadow-xl lg:col-span-2 space-y-6">

            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-800/60">
                <Trophy size={16} className="text-amber-400" />
                <h2 className="text-xs uppercase font-semibold tracking-wider text-stone-300">
                  Les Pièces les Plus Vendues
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.produitsPlusVendus.map((bijou, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3.5 bg-stone-950/80 p-3 rounded-xl border border-stone-800/80 hover:border-amber-500/30 transition-all group"
                  >
                    <span className="font-serif text-base font-bold text-amber-500/60 w-5 text-center">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-200 truncate group-hover:text-amber-300 transition-colors">
                        {bijou.nom}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {bijou.ventes} unité{bijou.ventes > 1 ? 's' : ''} vendue{bijou.ventes > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-stone-300 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800">
                      {bijou.totalGenere.toLocaleString('fr-FR')} F
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-stone-800/60">
                <Star size={16} className="text-violet-400" />
                <h2 className="text-xs uppercase font-semibold tracking-wider text-stone-300">
                  Produits Vedette de la Boutique
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.produitsVedette.map((bijou, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-3.5 bg-stone-950/80 p-3 rounded-xl border border-stone-800/80 hover:border-violet-500/30 transition-all group"
                  >
                    <span className="font-serif text-base font-bold text-violet-500/50 w-5 text-center">
                      #{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-200 truncate group-hover:text-violet-300 transition-colors">
                        {bijou.nom}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {bijou.categorie}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-violet-500/20">
                      <Star size={11} fill="currentColor" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="bg-stone-900/80 border border-stone-800/80 p-6 rounded-2xl shadow-xl lg:col-span-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={16} className="text-amber-400" />
                <h2 className="text-xs uppercase font-semibold tracking-wider text-stone-300">
                  Zones à Forte Demande
                </h2>
              </div>
              <p className="text-[11px] text-stone-500">
                Répartition des demandes par région ou ville.
              </p>
            </div>

            <div className="h-64 relative my-4">
              <Bar data={geoChartData} options={geoChartOptions} />
            </div>

            <div className="text-[11px] text-stone-400 bg-stone-950/80 p-3 rounded-xl border border-stone-800 text-center italic">
              Données utiles pour ajuster la logistique et cibler vos campagnes publicitaires.
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
