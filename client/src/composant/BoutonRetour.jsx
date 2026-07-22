import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BoutonRetour = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="inline-flex items-center gap-1.5 ml-4 sm:ml-8 py-2 text-amber-800 hover:text-amber-900 text-xs font-medium tracking-wide transition-colors duration-200 group select-none touch-manipulation"
      aria-label="Revenir à la page précédente"
    >
      <ArrowLeft 
        size={15} 
        className="transition-transform duration-200 group-hover:-translate-x-1 text-amber-800 group-hover:text-amber-900" 
      />
      <span>Retour</span>
    </button>
  );
};

export default BoutonRetour;