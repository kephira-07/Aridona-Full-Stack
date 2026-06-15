import { ShoppingBag } from 'lucide-react'
import React from 'react'

const Boutton = ({ textb, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className='group relative mt-10 mb-5 flex items-center justify-center px-8 py-4  bg-amber-50 border border-amber-700/40 text-amber-900 transition-all duration-300 overflow-hidden cursor-pointer active:scale-98'
    >
      {/* Les coins intérieurs stylisés (Touche personnalisée Haute Joaillerie) */}
      <span className='absolute top-1 left-1 w-2 h-2 border-t border-l border-amber-700 transition-all duration-300 group-hover:top-2 group-hover:left-2'></span>
      <span className='absolute bottom-1 right-1 w-2 h-2 border-b border-r border-amber-700 transition-all duration-300 group-hover:bottom-2 group-hover:right-2'></span>

      {/* Effet de fond Premium au survol (Glissement de l'or d'Arilona) */}
      <span className='absolute inset-0 w-0 h-full bg-amber-700/5 transition-all duration-300 ease-out group-hover:w-full'></span>

      {/* Contenu du bouton */}
      <div className='flex items-center gap-3 relative z-10 font-medium tracking-widest text-sm uppercase transition-transform duration-300 group-hover:translate-x-1'>
        <ShoppingBag className='w-4 h-4 text-amber-700 transition-transform duration-300 group-hover:scale-110' />
        <span className='font-sans'>{textb}</span>
      </div>

      {/* Ligne décorative asymétrique sous le bouton */}
      <span className='absolute bottom-0 left-0 w-12 h-[2px] bg-amber-700 transition-all duration-500 ease-in-out group-hover:w-full'></span>
    </button>
  )
}

export default Boutton