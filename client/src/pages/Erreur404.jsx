import React from 'react';
import { Link } from 'react-router-dom';
import BoutonRetour from '../composant/BoutonRetour';

const Erreur404 = () => {
  return (
    <div className='min-h-[70vh] flex flex-col items-center justify-center text-center px-4 mt-10'>

      
      {/* Le chiffre 404 avec un style épuré */}
      <h1 className='text-9xl font-serif text-gray-200 tracking-tighter'>
        404
      </h1>
      
      {/* Ligne de séparation dorée pour le rappel du design Arilona */}
      <div className='w-16 h-[2px] bg-amber-500 my-6'></div>
      
      <h2 className='text-2xl md:text-3xl font-light text-gray-800 uppercase tracking-[0.2em] mb-4'>
        Page Introuvable
      </h2>
      
      <p className='text-gray-500 max-w-md mb-10 font-light leading-relaxed'>
        Le bijou ou la page que vous recherchez semble avoir été déplacé ou n'existe plus. 
        Laissez-nous vous guider vers nos collections.
      </p>

      {/* Bouton de retour avec effet hover */}
      <Link 
        to="/" 
        className='bg-black text-white px-10 py-3 text-sm uppercase tracking-widest hover:bg-gray-800 transition-all duration-300 active:scale-95'
      >
        Retour à l'accueil
      </Link>

      {/* Optionnel : un lien vers le contact si l'utilisateur est vraiment perdu */}
      <Link 
        to="/contact" 
        className='mt-6 text-xs text-gray-400 hover:text-amber-600 transition-colors uppercase tracking-widest'
      >
        Besoin d'aide ? Contactez-nous
      </Link>
    </div>
  );
};

export default Erreur404;