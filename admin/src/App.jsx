import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Add from './pages/Add';
import List from './pages/List';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Edit from './pages/Edit';
import Categories from './pages/Categories';
import DashboardStats from './pages/DashboardStats';

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
          <Routes>
            {/* Redirection automatique de la racine (/) vers la liste des produits */}
           <Route path="/" element={<Navigate to="/list" replace />} />
                  <Route path='/dashbord'element={<DashboardStats token={token} />} /> 
                  <Route path="/add" element={<Add token={token} />} />
                  <Route path="/list" element={<List token={token} />} />
                  <Route path="/orders" element={<Orders token={token} />} />
                  <Route path="/edit/:id" element={<Edit token={token} />} />
                  <Route path="/categories" element={<Categories token={token} />} />
                  <Route path="*" element={<Navigate to="/list" replace />} />
          </Routes>
        </main>

      </div>
    </div>
  );
};

export default App;