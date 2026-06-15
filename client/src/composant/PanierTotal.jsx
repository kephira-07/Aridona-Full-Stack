import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Titre from './Titre'

const CartTotal = () => {
    const { monnaie, delivery_free, getPanierMontant } = useContext(ShopContext);

    return (
        <div className='w-full px-5'>
            <div className='text-2xl'>
                <Titre text1={'Total'} text2={'Achat'} />
            </div>

            <div className='flex flex-col gap-2 mt-2 text-sm'>
                <div className='flex justify-between'>
                    <p>Sous-total</p>
                    <p>{getPanierMontant()}{monnaie}</p>
                </div>
                <hr />
                <div className='flex justify-between'>
                    <p>Frais de livraison</p>
                    <p>{delivery_free} {monnaie}</p>
                </div>
                <hr />
                <div className='flex justify-between'>
                    <b>Total</b>
                    <b>{getPanierMontant() === 0 ? 0 : getPanierMontant() + delivery_free}{monnaie}</b>
                </div>
            </div>
        </div>
    )
}

export default CartTotal