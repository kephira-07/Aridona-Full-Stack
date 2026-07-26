import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Composants de structure
import Navbar from './composant/Navbar';
import SidebarPanier from './composant/SidebarPanier';
import Footer from './composant/Footer';
import ScrollToTop from './composant/ScrollToTop';

// Pages
import Home from './pages/Home';
import Collection from './pages/Collection';
import PageProduit from './pages/PageProduit';
import Panier from './pages/Panier';
import PasserCommande from './pages/PasserCommande';
import Login from './pages/Login';
import PageFavoris from './pages/PageFavoris';
import ResetPassword from './pages/ResetPassword';
import Apropos from './pages/Apropos';
import Erreur404 from './pages/Erreur404';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-dmsans bg-white text-stone-800">
      <ScrollToTop />
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* En-tête fixe */}
      <Navbar />
      
      {/* Tiroir Panier Global */}
      <SidebarPanier />

      {/* Zone de contenu dynamique avec compensation de la Navbar fixe */}
      <main className="flex-1 pt-24 md:pt-28">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          
          <Route path="/collection" element={<Collection />} />
          <Route path="/produit/:slug" element={<PageProduit />} />
          
          <Route path="/panier" element={<Panier />} />
          <Route path="/commander" element={<PasserCommande />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/favoris" element={<PageFavoris />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          <Route path="/a-propos" element={<Apropos />} />
          
          {/* Capture des URLs inconnues */}
          <Route path="*" element={<Erreur404 />} />
        </Routes>
      </main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}

export default App;