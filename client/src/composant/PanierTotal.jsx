import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';

const PanierTotal = () => {
    const { monnaie, delivery_free, getPanierMontant } = useContext(ShopContext);

    const sousTotal = Number(getPanierMontant()) || 0;
    const fraisLivraison = sousTotal === 0 ? 0 : (Number(delivery_free) || 0);
    const totalAchat = sousTotal === 0 ? 0 : sousTotal + fraisLivraison;

    return (
        <div className='w-full px-1 sm:px-3'>
            <div className='text-xl sm:text-2xl font-light'>
                <Titre text1='' text2={'Total Achat'} />
            </div>

            <div className='flex flex-col gap-3 mt-4 text-sm font-dmsans'>
                <div className='flex justify-between text-stone-600'>
                    <p>Sous-total</p>
                    <p className='font-medium text-stone-900'>
                        {sousTotal.toLocaleString()} {monnaie || 'FCFA'}
                    </p>
                </div>
                <hr className='border-stone-200' />
                <div className='flex justify-between text-stone-600'>
                    <p>Frais de livraison</p>
                    <p className='font-medium text-stone-900'>
                        {fraisLivraison.toLocaleString()} {monnaie || 'FCFA'}
                    </p>
                </div>
                <hr className='border-stone-200' />
                <div className='flex justify-between text-base font-bold text-amber-950 pt-1'>
                    <p>Total</p>
                    <p>{totalAchat.toLocaleString()} {monnaie || 'FCFA'}</p>
                </div>
            </div>
        </div>
    );
};

export default PanierTotal;