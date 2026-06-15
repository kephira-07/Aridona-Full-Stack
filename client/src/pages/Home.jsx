import React from 'react'

import DerniereCollection from '../composant/DerniereCollection';
import MeilleurVente from '../composant/MeilleurVente';
import Hero from '../composant/Hero';
import Categorybar from '../composant/Categorybar';
export default function Home() {
  return (
    <div> 
      <Hero/>
      <Categorybar/>
      <DerniereCollection/>  
      <MeilleurVente />     
      
     
     </div>
    )
 }
 
