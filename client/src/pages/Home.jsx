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
        <title>Aridona Bijoux | Bijoux en Acier Inoxydable à Lomé</title>
        <meta name="description" content="Bagues, colliers et bracelets en acier inoxydable 316L : ne noircissent pas, ne provoquent aucune allergie, résistent à l'eau. Livraison rapide à Lomé et partout au Togo." />
        <link rel="canonical" href="https://aridona.store/" />
        <meta property="og:title" content="Aridona Bijoux | Bijoux en Acier Inoxydable à Lomé" />
        <meta property="og:description" content="Des bijoux en acier inoxydable 316L pensés pour votre quotidien : waterproof, sans nickel, et qui gardent leur éclat des années. Livraison rapide à Lomé et partout au Togo." />
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

