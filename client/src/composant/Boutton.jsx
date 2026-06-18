import { ShoppingBag } from 'lucide-react'
import React from 'react'

const Boutton = ({ textb, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className='group relative flex items-center justify-center px-8 py-4 bg-amber-50 border border-amber-500/30 text-amber-900 transition-all duration-300 overflow-hidden cursor-pointer active:scale-98 rounded-xl w-full sm:w-auto'
    >
      {/* 🌟 EFFET DE SHIMMER (Balayage lumineux argent/or au survol) */}
      <span className='absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent z-10'></span>

      {/* Les coins intérieurs stylisés de Haute Joaillerie */}
      <span className='absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-amber-400/60 transition-all duration-300 group-hover:top-3 group-hover:left-3 group-hover:border-amber-400'></span>
      <span className='absolute bottom-2 right-2 w-1.5 h-1.5 border-b border-r border-amber-400/60 transition-all duration-300 group-hover:bottom-3 group-hover:right-3 group-hover:border-amber-400'></span>

      {/* Effet de fond Premium au survol (Transition vers un or/ambre profond texturé) */}
      <span className='absolute inset-0 w-full h-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out'></span>

      {/* Contenu du bouton */}
      <div className='flex items-center gap-3 relative z-20 font-medium tracking-[0.2em] text-xs uppercase transition-colors duration-300 group-hover:text-white'>
        <ShoppingBag className='w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:scale-110 group-hover:text-white' />
        <span className='font-sans'>{textb}</span>
      </div>

      {/* Ligne décorative dorée sous le bouton qui s'illumine à 100% */}
      <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-500 ease-in-out group-hover:w-full'></span>
    </button>
  )
}

export default Boutton