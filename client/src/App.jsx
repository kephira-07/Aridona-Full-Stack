import React from 'react'
import Hero from './composant/Hero'  

import Home from './pages/Home'

import Collection from './pages/Collection'
import Navbar from './composant/Navbar'
import { Route, Routes } from 'react-router-dom'

import Footer from './composant/Footer'
import PageProduit from './pages/PageProduit'
  import { ToastContainer} from 'react-toastify';
import Panier from './pages/Panier'



import Erreur404 from './pages/Erreur404'

import ScrollToTop from './composant/ScrollToTop'
import Login from './pages/Login'
import PageFavoris from './pages/PageFavoris'
import PasserCommande from './pages/PasserCommande'


function App() {
  

  return (
    <>
      <ScrollToTop/>
       <ToastContainer />
     <Navbar/>

     <Routes> 
        <Route path='/' element={<Home />} />
        
      
        <Route path='/collection' element={<Collection />} />
        <Route path='/produit/:slug' element={<PageProduit />} />  
        <Route path='/panier' element={<Panier/>}/>
         
        <Route path='/passercommande' element={<PasserCommande/>}/>
        
        <Route path='/login' element={<Login />} />
         <Route path='/favoris' element={<PageFavoris />} />
         <Route path='*' element={<Erreur404 />} />
      </Routes>
      <Footer/>
    </>
  )
}

export default App
