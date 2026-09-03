import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';

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
  // Récupération du token sauvegardé dans le navigateur pour éviter de se reconnecter après un F5
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Dès que le token change, on met à jour le localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // En attente du composant Login complet, voici un écran de connexion temporaire épuré
  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <div className="bg-slate-50/50 min-h-screen text-slate-900 font-sans antialiased">
      {/* Barre supérieure */}
      <Navbar setToken={setToken} />
      
      {/* Structure globale (Sidebar fixe à gauche + Contenu déroulant à droite) */}
      <div className="flex w-full">
        
        {/* Menu latéral gauche */}
        <Sidebar />
        
        {/* Contenu principal de la page courante */}
        <main className="w-[82%] p-6 md:p-10 max-h-[calc(100vh-80px)] overflow-y-auto">
          <Suspense fallback={<div className="flex min-h-40 items-center justify-center text-slate-500">Chargement...</div>}>
            <Routes>
            {/* Redirection automatique de la racine (/) vers la liste des produits */}
            <Route path="/" element={<Navigate to="/listeProduits" replace />} />
            <Route path='/dashbord' element={<DashboardStats token={token} />} /> 
            <Route path="/add" element={<Add token={token} />} />
           
            <Route path="/orders" element={<Orders token={token} />} />
            <Route path="/edit/:id" element={<Edit token={token} />} />
            <Route path="/categories" element={<Categories token={token} />} />
            <Route path="/listeProduits" element={<ListeProduits token={token} />} />
            <Route path="/avis" element={<Avis token={token} />} />
            <Route path="/articles" element={<Articles token={token} />} />
            <Route path="/packs" element={<Packs token={token} />} />
            
            {/* 🌟 PASSAGE DU TOKEN ET DU BACKENDURL POUR CHARGER LES EMAILS SANS ERREUR */}
            <Route path="/utilisateurs" element={<Utilisateurs token={token}  />} />
            
            <Route path="*" element={<Navigate to="/listeProduits" replace />} />
            </Routes>
          </Suspense>
        </main>

      </div>
    </div>
  );
};

export default App;