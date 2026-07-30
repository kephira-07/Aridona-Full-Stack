import React from 'react'
import { Helmet } from 'react-helmet-async';

import DerniereCollection from '../composant/DerniereCollection';
import MeilleurVente from '../composant/MeilleurVente';
import Hero from '../composant/Hero';
import Categorybar from '../composant/Categorybar';
import AboutSection from '../composant/AboutSection';
export default function Home() {
  return (
    <div>
      <Helmet>
        <title>ARIDONA Bijoux | Bijoux en Acier Inoxydable</title>
        <meta name="description" content="Aridona Bijoux — bagues, colliers et bracelets en acier inoxydable 316L waterproof et hypoallergénique. Livraison rapide à domicile." />
        <link rel="canonical" href="https://aridona.store/" />
        <meta property="og:title" content="ARIDONA Bijoux | Bijoux en Acier Inoxydable" />
        <meta property="og:description" content="Bagues, colliers et bracelets en acier inoxydable 316L waterproof et hypoallergénique. Livraison rapide à domicile." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aridona.store/" />
      </Helmet>

      <Hero/>
      <Categorybar/>
      <DerniereCollection/>
      <MeilleurVente />
      <AboutSection/>


     </div>
    )
 }

