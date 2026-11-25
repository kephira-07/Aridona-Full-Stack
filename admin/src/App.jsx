import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import { backendUrl } from './config';

const Add = lazy(() => import('./pages/Add'));
const Orders = lazy(() => import('./pages/Orders'));
const Edit = lazy(() => import('./pages/Edit'));
const Categories = lazy(() => import('./pages/Categories'));
const DashboardStats = lazy(() => import('./pages/DashboardStats'));
const Utilisateurs = lazy(() => import('./pages/Utilisateurs'));
const ListeProduits = lazy(() => import('./pages/ListeProduits'));
const Avis = lazy(() => import('./pages/Avis'));
const Articles = lazy(() => import('./pages/Articles'));
const Packs = lazy(() => import('./pages/Packs'));

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [badges, setBadges] = useState({ commandesEnAttente: 0, rupturesStock: 0 });
  const location = useLocation();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const refreshBadges = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${backendUrl}/api/produit/stats-dashboard`, {
        headers: { token, Authorization: `Bearer ${token}` },
      });
      if (response.data?.success && response.data.stats) {
        setBadges({
          commandesEnAttente: Number(response.data.stats.commandesEnAttente) || 0,
          rupturesStock: Number(response.data.stats.rupturesStock) || 0,
        });
      }
    } catch {
      // Silencieux : les badges restent non bloquants
    }
  }, [token]);

  useEffect(() => {
    refreshBadges();
  }, [refreshBadges, location.pathname]);

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div className="bg-slate-50/50 min-h-screen text-slate-900 font-sans antialiased">
      <Navbar
        setToken={setToken}
        onToggleMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      <div className="flex w-full">
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          badges={badges}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8">
          <Suspense fallback={<div className="flex min-h-40 items-center justify-center text-slate-500 text-sm">Chargement...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashbord" replace />} />
              <Route path="/dashbord" element={<DashboardStats token={token} />} />
              <Route path="/add" element={<Add token={token} />} />
              <Route path="/orders" element={<Orders token={token} />} />
              <Route path="/edit/:id" element={<Edit token={token} />} />
              <Route path="/categories" element={<Categories token={token} />} />
              <Route path="/listeProduits" element={<ListeProduits token={token} />} />
              <Route path="/avis" element={<Avis token={token} />} />
              <Route path="/articles" element={<Articles token={token} />} />
              <Route path="/packs" element={<Packs token={token} />} />
              <Route path="/utilisateurs" element={<Utilisateurs token={token} />} />
              <Route path="*" element={<Navigate to="/dashbord" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default App;
