import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../config';
import { Phone, CheckCircle2, Clock, Search, RefreshCw, MessageCircle } from 'lucide-react';

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('toutes'); // 'toutes' | 'a_traiter' | 'terminees' | 'annulees'
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const getImageUrl = (imgData) => {
    if (!imgData) return 'https://via.placeholder.com/60';
    const first = Array.isArray(imgData) ? imgData[0] : imgData;
    return typeof first === 'object' && first?.url ? first.url : (first || 'https://via.placeholder.com/60');
  };

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/order/list`, {}, { headers: { token } });
      if (response.data.success) {
        setOrders([...(response.data.orders || [])]);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Erreur fetchAllOrders:', error);
      toast.error(error.response?.data?.message || 'Impossible de charger les commandes.');
    } finally {
      setLoading(false);
    }
  };

  const statusHandler = async (e, orderId) => {
    const newStatus = e.target.value;
    try {
      setUpdatingId(orderId);
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success('Statut mis à jour');
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de statut.');
    } finally {
      setUpdatingId(null);
    }
  };

  const togglePayment = async (orderId, currentPayment) => {
    const nextPayment = !currentPayment;
    try {
      setUpdatingId(orderId);
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, payment: nextPayment },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(nextPayment ? 'Marquée comme payée' : 'Marquée en attente de paiement');
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, payment: nextPayment } : o)));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de modifier le paiement.');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (token) fetchAllOrders();
  }, [token]);

  const counts = {
    toutes: orders.length,
    a_traiter: orders.filter((o) => ['Commande passée', 'En cours de préparation'].includes(o.status)).length,
    terminees: orders.filter((o) => ['Expédié', 'Livré'].includes(o.status)).length,
    annulees: orders.filter((o) => o.status === 'Annulé').length,
  };

  const filteredOrders = orders.filter((order) => {
    if (tab === 'a_traiter' && !['Commande passée', 'En cours de préparation'].includes(order.status)) return false;
    if (tab === 'terminees' && !['Expédié', 'Livré'].includes(order.status)) return false;
    if (tab === 'annulees' && order.status !== 'Annulé') return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    const clientName = `${order.address?.firstName || ''} ${order.address?.lastName || ''}`.toLowerCase();
    const phone = String(order.address?.phone || '').toLowerCase();
    const street = String(order.address?.street || '').toLowerCase();
    const itemNames = (order.items || []).map((i) => String(i.nom || '').toLowerCase()).join(' ');
    return clientName.includes(q) || phone.includes(q) || street.includes(q) || itemNames.includes(q);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        <span className="ml-3 text-gray-500 text-sm font-medium">Chargement des commandes...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs w-full space-y-5">
      {/* En-tête + Recherche + Actualiser */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Suivi des Commandes</h2>
          <p className="text-xs text-slate-500">Filtrez vos commandes, encaissez en 1 clic et contactez le client si besoin.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Client, tél, bijou..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-slate-900"
            />
          </div>
          <button
            type="button"
            onClick={fetchAllOrders}
            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Actualiser"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Onglets de tri rapide */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
        {[
          { id: 'toutes', label: 'Toutes', count: counts.toutes },
          { id: 'a_traiter', label: 'À traiter', count: counts.a_traiter },
          { id: 'terminees', label: 'Expédiées / Livrées', count: counts.terminees },
          { id: 'annulees', label: 'Annulées', count: counts.annulees },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              tab === t.id
                ? 'bg-slate-950 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{t.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              tab === t.id ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
          Aucune commande ne correspond à ce filtre.
        </p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const rawPhone = String(order.address?.phone || '').replace(/\D/g, '');
            const hasRealPhone = rawPhone && rawPhone !== '0022800000000' && rawPhone.length >= 8;
            const waPhone = rawPhone.length === 8 ? `228${rawPhone}` : rawPhone;

            return (
              <div
                key={order._id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 sm:p-5 border border-slate-200/80 rounded-2xl hover:shadow-xs transition-all items-center bg-slate-50/40"
              >
                {/* Articles */}
                <div className="md:col-span-2 flex flex-col gap-2.5">
                  <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Articles commandés</p>
                  <div className="space-y-2">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.nom}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                        />
                        <div className="text-xs min-w-0">
                          <p className="font-semibold text-slate-800 flex items-center gap-1.5 truncate">
                            {item.type === 'pack' && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">
                                Pack
                              </span>
                            )}
                            <span className="truncate">{item.nom}</span>
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.type !== 'pack' && <>Taille: <span className="font-medium text-slate-700">{item.size}</span> • </>}
                            Qté: <span className="font-medium text-slate-700">{item.quantity}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Client & Paiement */}
                <div className="text-xs space-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Client</p>
                    {order.address ? (
                      <>
                        <p className="font-semibold text-slate-900 text-sm">{order.address.firstName} {order.address.lastName}</p>
                        <p className="text-slate-500 leading-relaxed">{order.address.street}, {order.address.city}</p>
                        {hasRealPhone && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-slate-700 font-medium flex items-center gap-1">
                              <Phone size={12} className="text-amber-700" /> {order.address.phone}
                            </span>
                            <a
                              href={`https://wa.me/${waPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-semibold"
                            >
                              <MessageCircle size={11} /> WhatsApp
                            </a>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-red-500">Adresse non renseignée</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 space-y-1">
                    <p className="font-bold text-slate-900 text-base">{Number(order.amount || 0).toLocaleString('fr-FR')} FCFA</p>
                    <p className="text-slate-500">Méthode : <span className="font-medium text-slate-700">{order.paymentMethod}</span></p>
                    {order.createdAt && (
                      <p className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    disabled={updatingId === order._id}
                    onClick={() => togglePayment(order._id, Boolean(order.payment))}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                      order.payment
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                    title="Cliquer pour basculer le statut de paiement"
                  >
                    {order.payment ? <><CheckCircle2 size={14} /> Payé (clic pour annuler)</> : <><Clock size={14} /> Marquer comme payé</>}
                  </button>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Statut logistique :</label>
                    <select
                      disabled={updatingId === order._id}
                      onChange={(e) => statusHandler(e, order._id)}
                      value={order.status}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:border-amber-700 font-semibold shadow-2xs cursor-pointer"
                    >
                      <option value="Commande passée">Commande passée</option>
                      <option value="En cours de préparation">En cours de préparation</option>
                      <option value="Expédié">Expédié</option>
                      <option value="Livré">Livré</option>
                      <option value="Annulé">Annulé</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
