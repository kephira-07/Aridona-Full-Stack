import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BoutonRetour = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)} // -1 permet de revenir exactement à la page précédente
     className='inline-flex items-center justify-center gap-2 px-6 py-3 ml-7 border border-stone-900 hover:text-stone-900 hover:bg-white bg-stone-900 text-white font-semibold text-[11px] tracking-widest uppercase transition-all duration-300 rounded-lg shadow-sm hover:shadow active:scale-[0.98] select-none touch-manipulation group font-sans'
    >
      <ArrowLeft 
        size={16} 
        className='transition-transform duration-200 group-hover:-translate-x-1' 
      />
      <span>Retour</span>
    </button>
  );
};

export default BoutonRetour;