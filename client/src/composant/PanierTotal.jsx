import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Titre from './Titre';

const PanierTotal = () => {
    const { monnaie, delivery_free, seuilLivraisonGratuite = 25000, getPanierMontant } = useContext(ShopContext);

    const sousTotal = Number(getPanierMontant()) || 0;
    const estGratuit = sousTotal >= seuilLivraisonGratuite;
    const fraisLivraison = sousTotal === 0 ? 0 : (estGratuit ? 0 : (Number(delivery_free) || 1000));
    const totalAchat = sousTotal === 0 ? 0 : sousTotal + fraisLivraison;
    const manquePourGratuit = Math.max(0, seuilLivraisonGratuite - sousTotal);

    return (
        <div className='w-full px-1 sm:px-3'>
            <div className='text-xl sm:text-2xl font-light'>
                <Titre text1='' text2={'Total Achat'} />
            </div>

            {/* Notification incitative livraison offerte dès 25.000 FCFA */}
            {sousTotal > 0 && (
                <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center justify-between ${
                    estGratuit 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-900 border border-amber-200/60'
                }`}>
                    {estGratuit ? (
                        <span className="font-medium">Félicitations ! Livraison offerte sur votre commande.</span>
                    ) : (
                        <span>
                            Plus que <strong className="font-semibold">{manquePourGratuit.toLocaleString()} {monnaie || 'FCFA'}</strong> pour la <strong className="font-semibold">livraison offerte</strong> !
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
                <hr className='border-stone-200' />
                <div className='flex justify-between text-stone-600 items-center'>
                    <p>Frais de livraison</p>
                    <p className='font-medium text-stone-900'>
                        {sousTotal === 0 ? (
                            `0 ${monnaie || 'FCFA'}`
                        ) : estGratuit ? (
                            <span className='text-emerald-700 font-semibold uppercase tracking-wider text-xs bg-emerald-50 px-2 py-0.5 rounded'>
                                Offerte
                            </span>
                        ) : (
                            `${fraisLivraison.toLocaleString()} ${monnaie || 'FCFA'}`
                        )}
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
