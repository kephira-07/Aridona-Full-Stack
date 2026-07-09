import React from 'react'

const Titre = ({ text1, text2 }) => {
  return (
    <div className='max-w-max mx-auto text-center my-8 px-4 select-none'>
      {/* Surtitre discret et aéré */}
      {text1 && (
        <span className='block text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-amber-600 font-caveat mb-2 transition-all duration-300'>
          {text1}
        </span>
      )}
      
      {/* Titre principal fluide et élégant */}
      <h2 className=' text-2xl sm:text-3xl md:text-4xl text-gray-900 font-ebgaramond tracking-wide leading-relaxed'>
        {text2}
      </h2>
      
      {/* Ligne d'accentuation horizontale ultra-fine et centrée */}
      <div className='w-18 h-[1.5px] bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-2'></div>
    </div>
  )
}

export default Titre