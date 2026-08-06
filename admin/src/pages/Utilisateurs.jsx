import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, User, Phone, Calendar, ShieldCheck } from 'lucide-react';
import { backendUrl } from '../config';

const Utilisateurs = ({ token: propToken }) => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      // Récupération du token d'administration (priorité prop > localStorage, seule clé utilisée)
      const adminToken = propToken || localStorage.getItem('token');

      const response = await axios.get(`${backendUrl}/api/utilisateur/liste`, {
        headers: {
          token: adminToken,
          Authorization: `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        setUtilisateurs(response.data.utilisateurs || response.data.users || []);
      } else {
        toast.error(response.data.message || "Erreur lors du chargement des membres.");
      }
    } catch (error) {
      console.error("Erreur fetchUtilisateurs:", error);
      toast.error(error.response?.data?.message || "Impossible de charger la liste des membres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilisateurs();
  }, [propToken]);

  return (
    <div className="p-6 md:p-8 font-sans max-w-6xl mx-auto">
      {/* En-tête de la page */}
      <div className="mb-8 flex justify-between items-end border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Membres & Clients
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Repertoire complet des comptes inscrits sur Aridona Bijoux.
          </p>
        </div>
        <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/60 px-3 py-1.5 rounded-full">
          {utilisateurs.length} {utilisateurs.length > 1 ? 'inscrits' : 'inscrit'}
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-48 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <span className="text-xs text-slate-500 font-medium">Chargement de la base membres...</span>
        </div>
      ) : utilisateurs.length === 0 ? (
        <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 text-sm">Aucun utilisateur enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-[10px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-4 px-6 font-bold">Nom & Prénom</th>
                  <th className="py-4 px-6 font-bold">Adresse Email</th>
                  <th className="py-4 px-6 font-bold">Rôle</th>
                  <th className="py-4 px-6 font-bold">Téléphone / WhatsApp</th>
                  <th className="py-4 px-6 font-bold">Date d'inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {utilisateurs.map((user) => {
                  const dateInscription = user.createdAt || user.date;
                  const userRole = user.role || 'client';

                  return (
                    <tr key={user._id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Nom */}
                      <td className="py-4 px-6 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold">
                            <User size={14} />
                          </div>
                          <span>{user.nom || user.name || 'Membre'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={13} className="text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Rôle */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          userRole === 'admin' 
                            ? 'bg-amber-50 text-amber-900 border-amber-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {userRole === 'admin' && <ShieldCheck size={11} className="text-amber-700" />}
                          {userRole}
                        </span>
                      </td>

                      {/* Téléphone */}
                      <td className="py-4 px-6">
                        {user.telephone || user.phone ? (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone size={13} className="text-emerald-600" />
                            <span>{user.telephone || user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Non renseigné</span>
                        )}
                      </td>

                      {/* Date d'inscription */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={13} className="text-slate-400" />
                          {dateInscription && !isNaN(Date.parse(dateInscription)) ? (
                            <span>
                              {new Date(dateInscription).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Récemment</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilisateurs;