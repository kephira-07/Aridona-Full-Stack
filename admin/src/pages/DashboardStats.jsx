import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';
import { Package, FolderHeart, ShieldAlert, Coins, RefreshCw } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Enregistrement des composants requis pour Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/produit/stats-dashboard`); // Ajuste la route si nécessaire
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
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin text-amber-500 w-10 h-10" />
      </div>
    );
  }

  if (!stats) return <p className="text-gray-500">Impossible de charger les statistiques.</p>;

  // Configuration des données du graphique en anneau (Doughnut)
  const doughnutData = {
    labels: stats.chartDataCategories.labels,
    datasets: [
      {
        data: stats.chartDataCategories.series,
        backgroundColor: [
          '#b45309', // Amber-700 (Luxe)
          '#d97706', // Amber-600
          '#f59e0b', // Amber-500
          '#1e293b', // Slate-800
          '#475569', // Slate-600
          '#94a3b8', // Slate-400
        ],
        borderWidth: 1,
        borderColor: '#ffffff',
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'serif', size: 12 },
          boxWidth: 12,
          padding: 15
        }
      }
    },
    cutout: '70%', // Rapproche du style épuré et fin
    maintainAspectRatio: false,
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto bg-stone-50/50 min-h-screen">
      
      {/* En-tête avec bouton d'actualisation */}
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <div>
          <h1 className="font-serif text-2xl tracking-wide text-slate-900">Vue d'ensemble</h1>
          <p className="text-xs text-gray-400 mt-1">Analyse des stocks et valorisation en temps réel de votre catalogue Aura Héritage.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-2 border border-stone-200 rounded-full hover:border-amber-500 hover:text-amber-600 bg-white transition-all shadow-xs"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* GRILLE BENTO : Les Indicateurs Clés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Carte 1 : Valeur du Stock */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Valeur Estimateur Stock</span>
            <h3 className="text-xl font-bold font-serif text-slate-900">
              {stats.valeurTotaleStock.toLocaleString('fr-FR')} <span className="text-xs text-amber-600">FCFA</span>
            </h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Coins size={22} strokeWidth={1.5} />
          </div>
        </div>

        {/* Carte 2 : Total Modèles */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Bijoux Référencés</span>
            <h3 className="text-xl font-bold font-serif text-slate-900">{stats.totalProduits} modèles</h3>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-slate-700">
            <Package size={22} strokeWidth={1.5} />
          </div>
        </div>

        {/* Carte 3 : Catégories actives */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Familles de Collections</span>
            <h3 className="text-xl font-bold font-serif text-slate-900">{stats.totalCategories} catégories</h3>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl text-slate-700">
            <FolderHeart size={22} strokeWidth={1.5} />
          </div>
        </div>

        {/* Carte 4 : Alertes de rupture */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400">Ruptures Imminentes</span>
            <h3 className={`text-xl font-bold font-serif ${stats.alertesStockCritique > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {stats.alertesStockCritique} {stats.alertesStockCritique > 1 ? 'alertes' : 'alerte'}
            </h3>
          </div>
          <div className={`p-3 rounded-xl ${stats.alertesStockCritique > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            <ShieldAlert size={22} strokeWidth={1.5} />
          </div>
        </div>

      </div>

      {/* DEUXIÈME LIGNE BENTO : Graphique & Détail des Stocks bas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Module de répartition par catégories (Graphique) */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">Parts des Collections</h2>
            <p className="text-[11px] text-gray-400">Nombre de modèles créés par catégorie.</p>
          </div>
          <div className="h-56 relative my-4">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Module d'alerte et gestion des stocks bas */}
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-xs lg:col-span-2">
          <div>
            <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">Contrôle des Stocks Sensibles</h2>
            <p className="text-[11px] text-gray-400 mb-4">Les 5 articles nécessitant un réapprovisionnement prioritaire.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 font-normal">Nom du bijou</th>
                  <th className="py-3 font-normal text-right">Prix Unitaire</th>
                  <th className="py-3 font-normal text-right">Quantité restante</th>
                  <th className="py-3 font-normal text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.produitsStockBas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-medium text-slate-800">{item.nom}</td>
                    <td className="py-3 text-right text-gray-500">{item.prix.toLocaleString('fr-FR')} F</td>
                    <td className="py-3 text-right font-semibold text-slate-900 pr-4">{item.stock}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        item.stock === 0 
                          ? 'bg-red-50 text-red-600' 
                          : item.stock <= 2 
                            ? 'bg-amber-50 text-amber-600' 
                            : 'bg-blue-50 text-blue-600'
                      }`}>
                        {item.stock === 0 ? 'Épuisé' : item.stock <= 2 ? 'Critique' : 'À surveiller'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}