import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Récupérer TOUTES les commandes depuis le Backend
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      // Requête POST conforme à ton orderRouter.js sécurisé
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } });
      
      if (response.data.success) {
        // Sécurité : On vérifie que orders existe et est bien un tableau avant de le manipuler
        const listeCommandes = response.data.orders || [];
        setOrders([...listeCommandes]); // Ton backend fait déjà le .sort({ date: -1 }), donc pas besoin de reverse !
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Erreur fetchAllOrders:", error);
      alert(error.response?.data?.message || "Impossible de charger les commandes : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Mettre à jour le statut logistique d'une commande
  const statusHandler = async (e, orderId) => {
    const newStatus = e.target.value;
    try {
      // Envoi de la modification vers /api/order/status
      const response = await axios.post(
        `${backendUrl}/api/order/status`, 
        { orderId, status: newStatus }, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        await fetchAllOrders(); // Rafraîchit instantanément la liste après modification
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Erreur statusHandler:", error);
      alert(error.response?.data?.message || "Erreur lors du changement de statut.");
    }
  };

  // Enclencher le chargement dès que le token admin est disponible
  useEffect(() => {
    if (token) {
      fetchAllOrders();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-3 text-gray-500 text-sm font-medium">Chargement des commandes...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Suivi des Commandes Client</h2>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
          {orders.length} {orders.length > 1 ? 'commandes' : 'commande'}
        </span>
      </div>
      
      {orders.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-12 bg-slate-50/50 rounded-xl border border-dashed">
          Aucune commande enregistrée pour le moment.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div 
              key={order._id} 
              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 border border-gray-100 rounded-xl hover:shadow-sm transition-all items-center bg-slate-50/30"
            >
              
              {/* 📦 Colonne 1 : Articles commandés */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Articles commandés</p>
                
                <div className="space-y-2">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100">
                      
                      {/* Image de l'article avec filet de sécurité */}
                      <img 
                        src={(Array.isArray(item.image) ? item.image[0] : item.image) || 'https://via.placeholder.com/60'} 
                        alt={item.nom} 
                        className="w-14 h-14 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                      />
                      
                      <div className="text-sm">
                        <p className="font-semibold text-slate-800">{item.nom}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Taille : <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{item.size}</span> 
                          <span className="mx-2">|</span> 
                          Qté : <span className="font-bold text-slate-700">{item.quantity}</span>
                        </p>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* 📍 Colonne 2 : Infos Client & Livraison */}
              <div className="text-sm space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Livraison</p>
                {order.address ? (
                  <>
                    <p className="font-semibold text-slate-900">{order.address.firstName} {order.address.lastName}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">
                      {order.address.street}, {order.address.zipcode} {order.address.city}
                    </p>
                    <p className="text-gray-600 font-medium text-xs pt-1">📞 {order.address.phone}</p>
                  </>
                ) : (
                  <p className="text-red-500 text-xs">Adresse non renseignée</p>
                )}
              </div>

              {/* 💳 Colonne 3 : Paiement et Prix total */}
              <div className="text-sm space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Détails</p>
                <p className="font-bold text-slate-800 text-base">{order.amount} €</p>
                <p className="text-gray-500 text-xs">Méthode : <span className="font-medium">{order.paymentMethod}</span></p>
                <div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    order.payment ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {order.payment ? 'Payé ✅' : 'En attente ⏳'}
                  </span>
                </div>
              </div>

              {/* ⚙️ Colonne 4 : Action / Statut */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Statut logistique :</label>
                <select 
                  onChange={(e) => statusHandler(e, order._id)} 
                  value={order.status} 
                  className="p-2.5 border border-gray-200 rounded-xl bg-white text-sm outline-none focus:border-amber-600 font-medium shadow-sm cursor-pointer transition-colors"
                >
                  <option value="Commande passée">Commande passée</option>
                  <option value="En cours de préparation">En cours de préparation</option>
                  <option value="Expédié">Expédié</option>
                  <option value="Livré">Livré</option>
                </select>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;