import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Composants de structure (gardés en synchrone pour éviter un flash d'interface)
import Navbar from './composant/Navbar';
import SidebarPanier from './composant/SidebarPanier';
import Footer from './composant/Footer';
import ScrollToTop from './composant/ScrollToTop';

// Chargement paresseux (Lazy Loading) des pages
const Home = lazy(() => import('./pages/Home'));
const Collection = lazy(() => import('./pages/Collection'));
const PageProduit = lazy(() => import('./pages/PageProduit'));
const Panier = lazy(() => import('./pages/Panier'));
const PasserCommande = lazy(() => import('./pages/PasserCommande'));
const Login = lazy(() => import('./pages/Login'));
const PageFavoris = lazy(() => import('./pages/PageFavoris'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Apropos = lazy(() => import('./pages/Apropos'));
const Erreur404 = lazy(() => import('./pages/Erreur404'));
const ConditionUtilisation = lazy(() => import('./pages/ConitionUtilisation'));
const Contact = lazy(() => import('./pages/Contact'));
const PolitiqueConfidentialite = lazy(() => import('./pages/PolitiqueConfidentialite'));

// Composant de chargement pendant le passage d'une page à une autre
const PageLoader = () => (
  <div className="flex justify-center items-center h-64 text-amber-700">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/conditions-utilisation" element={<ConditionUtilisation />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Capture des URLs inconnues */}
            <Route path="*" element={<Erreur404 />} />
          </Routes>
        </Suspense>
      </main>

      {/* Pied de page */}
      <Footer />
    </div>
  );
}

export default App;