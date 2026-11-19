import React from 'react'
import { Helmet } from 'react-helmet-async';

import DerniereCollection from '../composant/DerniereCollection';
import MeilleurVente from '../composant/MeilleurVente';
import Hero from '../composant/Hero';
import Categorybar from '../composant/Categorybar';
import AboutSection from '../composant/AboutSection';
import PacksSection from '../composant/PacksSection';
export default function Home() {
  return (
    <div>
      <Helmet>
        <title>Aridona Bijoux | Boutique de Vente de Bijoux en Ligne à Lomé, Togo</title>
        <meta name="description" content="Acheter vos bijoux au Togo sur Aridona Bijoux : boutique de vente en ligne de bagues, colliers, bracelets et packs cadeaux en acier inoxydable 316L waterproof. Livraison rapide à Lomé et partout au Togo." />
        <link rel="canonical" href="https://aridona.store/" />
        <meta property="og:title" content="Aridona Bijoux | Boutique de Vente de Bijoux en Ligne à Lomé, Togo" />
        <meta property="og:description" content="Acheter vos bijoux en ligne au Togo : bagues, colliers, bracelets et coffrets en acier inoxydable 316L waterproof et sans nickel. Livraison rapide à Lomé et partout au Togo." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aridona.store/" />
      </Helmet>

      <Hero/>
      <Categorybar/>
      <PacksSection />
      <DerniereCollection/>
      <MeilleurVente />
      <AboutSection/>


     </div>
    )
 }
