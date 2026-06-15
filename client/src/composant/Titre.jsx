import React from 'react'

const Titre = ({ text1, text2 }) => {
  return (
    <div className='flex items-stretch justify-center gap-4 my-6 pl-2'>
      {/* Barre verticale élégante */}
      <div className='w-[2px] bg-gradient-to-b from-amber-500 to-amber-700/20 rounded-full'></div>
      
      <div className='flex flex-col justify-center'>
        <span className='text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold mb-1 block'>
          {text1}
        </span>
        <h2 className='text-2xl md:text-3xl items-center font-alice text-gray-900 font-light tracking-wide'>
          {text2}
        </h2>
      </div>
    </div>
  )
}

export default Titre