import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';
import { Package, Heart, Trophy, MapPin, RefreshCw, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Enregistrement des composants requis pour Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/produit/stats-dashboard`);
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
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <RefreshCw className="animate-spin text-amber-500 w-12 h-12" />
      </div>
    );
  }

  if (!stats) return <p className="text-gray-400 p-8 text-center bg-slate-950 h-screen">Impossible de charger les statistiques.</p>;

  // Configuration du graphique géographique (Barres horizontales)
  const geoChartData = {
    labels: stats.zonesPlusDemandees.map(z => z.zone),
    datasets: [
      {
        label: 'Demandes / Commandes',
        data: stats.zonesPlusDemandees.map(z => z.total),
        backgroundColor: 'rgba(217, 119, 6, 0.8)', // Amber-600 avec opacité
        borderColor: '#d97706',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const geoChartOptions = {
    indexAxis: 'y', // Mode horizontal
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { display: false }, ticks: { color: '#e2e8f0' } }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto bg-slate-950 min-h-screen text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      
      {/* EN-TÊTE PREMIUM */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-serif text-3xl tracking-widest bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent uppercase font-bold">
            Aridona Héritage
          </h1>
          <p className="text-xs text-slate-400 mt-1 tracking-wide">Analyses des performances, tendances de la collection et cartographie des demandes.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-3 border border-slate-800 rounded-xl hover:border-amber-500 hover:text-amber-400 bg-slate-900 transition-all shadow-lg hover:shadow-amber-500/10 group"
        >
          <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      {/* BENTO GRIDS : Les Métriques Clés de Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Métrique 1 : Chiffre d'Affaires Global */}
        <div className="bg-slate-900 border border-slate-800/60 p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="space-y-2 z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/80">Volume des Ventes</span>
            <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
              {stats.chiffreAffairesTotal.toLocaleString('fr-FR')} <span className="text-xs text-amber-400 font-sans">FCFA</span>
            </h3>
          </div>
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl z-10">
            <TrendingUp size={24} strokeWidth={1.5} />
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all" />
        </div>

        {/* Métrique 2 : Total Favoris cumulés */}
        <div className="bg-slate-900 border border-slate-800/60 p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="space-y-2 z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400/80">Intérêt Client</span>
            <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
              {stats.totalCoupsDeCoeur} <span className="text-xs text-rose-400 font-sans">Ajouts coups de cœur</span>
            </h3>
          </div>
          <div className="p-4 bg-rose-500/10 text-rose-400 rounded-xl z-10">
            <Heart size={24} strokeWidth={1.5} />
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all" />
        </div>

        {/* Métrique 3 : Total Commandes Validées */}
        <div className="bg-slate-900 border border-slate-800/60 p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="space-y-2 z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/80">Commandes Traitées</span>
            <h3 className="text-2xl font-bold font-serif text-white tracking-tight">
              {stats.totalCommandes} <span className="text-xs text-emerald-400 font-sans">expédiées</span>
            </h3>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl z-10">
            <Package size={24} strokeWidth={1.5} />
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
        </div>

        {/* Métrique 4 : Top Zone Actuelle */}
        <div className="bg-slate-900 border border-slate-800/60 p-6 rounded-2xl shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-sky-500/30 transition-all">
          <div className="space-y-2 z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400/80">Foyer Principal</span>
            <h3 className="text-xl font-bold font-serif text-white tracking-tight truncate max-w-[180px]">
              {stats.zoneTop || "Non définie"}
            </h3>
          </div>
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-xl z-10">
            <MapPin size={24} strokeWidth={1.5} />
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-all" />
        </div>

      </div>

      {/* BLOCS DE GRAPHIQUES & CLASSEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne 1 & 2 : Les Produits Tendances (Ventes & Favoris) */}
        <div className="bg-slate-900 border border-slate-800/60 p-6 rounded-2xl shadow-xl lg:col-span-2 space-y-6">
          
          {/* Section: Les plus vendus */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Trophy size={16} className="text-amber-400" />
              <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400">Les Joyaux les Plus Vendus</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.produitsPlusVendus.map((bijou, idx) => (
                <div key={idx} className="flex items-center space-x-4 bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all">
                  <span className="font-serif text-lg font-bold text-amber-500/50 w-6">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{bijou.nom}</p>
                    <p className="text-xs text-slate-500">{bijou.ventes} unités vendues</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {bijou.totalGenere.toLocaleString('fr-FR')} F
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Les plus mis en favoris */}
          <div className="pt-4 border-t border-slate-800/60">
            <div className="flex items-center space-x-2 mb-2">
              <Heart size={16} className="text-rose-400" />
              <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400">Coups de Cœur & Listes d'envies</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.produitsPlusFavoris.map((bijou, idx) => (
                <div key={idx} className="flex items-center space-x-4 bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-rose-500/40 transition-all">
                  <span className="font-serif text-lg font-bold text-rose-500/40 w-6">#{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{bijou.nom}</p>
                    <p className="text-xs text-slate-500">{bijou.categorie}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-rose-400 bg-rose-500/5 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-500/20">
                    <span>{bijou.favorisCount}</span>
                    <Heart size={12} fill="currentColor" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Colonne 3 : Analyse Géographique (Zones les plus demandées) */}
        <div className="bg-slate-900 border border-slate-800/60 p-6 rounded-2xl shadow-xl lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <MapPin size={16} className="text-sky-400" />
              <h2 className="text-xs uppercase font-bold tracking-widest text-slate-400">Zones à Forte Demande</h2>
            </div>
            <p className="text-[11px] text-slate-500">Classement des régions ou villes générant le plus de flux.</p>
          </div>
          
          <div className="h-64 relative my-6">
            <Bar data={geoChartData} options={geoChartOptions} />
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center italic">
            💡 Utilisez ces données pour cibler vos prochaines campagnes de livraison ou publicités.
          </div>
        </div>

      </div>

    </div>
  );
}