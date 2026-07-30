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
  AlertTriangle
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Enregistrement des composants requis pour Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardStats({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 2. Ajoutez le header d'autorisation avec le Token
      const response = await axios.get(`${backendUrl}/api/produit/stats-dashboard`, {
        headers: { 
          token: token,
          Authorization: `Bearer ${token}` 
        }
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

  // Configuration du graphique géographique (Barres horizontales)
  const geoChartData = {
    labels: stats.zonesPlusDemandees.map(z => z.zone),
    datasets: [
      {
        label: 'Demandes / Commandes',
        data: stats.zonesPlusDemandees.map(z => z.total),
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
      }
    },
    scales: {
      x: { 
        grid: { color: 'rgba(255, 255, 255, 0.04)' }, 
        ticks: { color: '#78716c', font: { size: 10 } } 
      },
      y: { 
        grid: { display: false }, 
        ticks: { color: '#d6d3d1', font: { size: 11, weight: '500' } } 
      }
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
            Aridona Héritage
          </h1>
          <p className="text-xs text-stone-400 mt-1 tracking-wide">
            Indicateurs de performance, produits phares et répartition géographique.
          </p>
        </div>

        <button 
          onClick={fetchStats}
          className="p-2.5 border border-stone-800 rounded-xl hover:border-amber-500/50 text-stone-400 hover:text-amber-400 bg-stone-900/80 transition-all shadow-lg hover:shadow-amber-500/5 group cursor-pointer"
          title="Actualiser les données"
        >
          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* BENTO GRID : Métriques Clés de Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Métrique 1 : Chiffre d'Affaires Global */}
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

        {/* Métrique 2 : Produits marqués "Coup de Cœur / Vedette" par l'admin (pas des favoris client) */}
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

        {/* Métrique 3 : Total Commandes Validées */}
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

        {/* Métrique 4 : Top Zone Actuelle */}
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
        
        {/* Colonnes 1 & 2 : Les Produits Tendances (Ventes & Favoris) */}
        <div className="bg-stone-900/80 border border-stone-800/80 p-6 rounded-2xl shadow-xl lg:col-span-2 space-y-6">
          
          {/* Section : Les plus vendus */}
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

          {/* Section : Produits marqués "Vedette" par l'admin (flag éditorial, pas des favoris client) */}
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

        {/* Colonne 3 : Analyse Géographique (Zones les plus demandées) */}
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
            💡 Données utiles pour ajuster la logistique et cibler vos campagnes publicitaires.
          </div>
        </div>

      </div>

    </div>
  );
}