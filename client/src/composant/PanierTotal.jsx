import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';

const PanierTotal = () => {
    const {
        monnaie,
        getPanierMontant,
        seuilReduction = 25000,
        tauxReduction = 0.1,
        calculerReduction,
    } = useContext(ShopContext);

    const sousTotal = Number(getPanierMontant()) || 0;
    const reduction = typeof calculerReduction === 'function'
        ? calculerReduction(sousTotal)
        : (sousTotal >= seuilReduction ? Math.round(sousTotal * tauxReduction) : 0);
    const aReduction = reduction > 0;
    const totalAchat = Math.max(0, sousTotal - reduction);
    const manquePourReduction = Math.max(0, seuilReduction - sousTotal);
    const pourcentage = Math.round(tauxReduction * 100);

    return (
        <div className='w-full px-1 sm:px-3'>
            <div className='text-xl sm:text-2xl font-light'>
                <Titre text1='' text2={'Total Achat'} />
            </div>

            {sousTotal > 0 && (
                <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center justify-between ${
                    aReduction
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border border-amber-200/60'
                }`}>
                    {aReduction ? (
                        <span className="font-medium">
                            Félicitations ! -{pourcentage}% de réduction appliquée sur votre commande.
                        </span>
                    ) : (
                        <span>
                            Plus que <strong className="font-semibold">{manquePourReduction.toLocaleString()} {monnaie || 'FCFA'}</strong> pour profiter de <strong className="font-semibold">-{pourcentage}%</strong> sur votre achat !
                        </span>
                    )}
                </div>
            )}

            <div className='flex flex-col gap-3 mt-4 text-sm font-dmsans'>
                <div className='flex justify-between text-stone-600'>
                    <p>Sous-total</p>
                    <p className='font-medium text-stone-900'>
                        {sousTotal.toLocaleString()} {monnaie || 'FCFA'}
                    </p>
                </div>
                {aReduction && (
                    <>
                        <hr className='border-stone-200' />
                        <div className='flex justify-between text-emerald-700 items-center'>
                            <p>Réduction (-{pourcentage}%)</p>
                            <p className='font-semibold'>
                                -{reduction.toLocaleString()} {monnaie || 'FCFA'}
                            </p>
                        </div>
                    </>
                )}
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
