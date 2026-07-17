import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, User, Phone, Calendar } from 'lucide-react';
import { backendUrl } from '../config';

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('token'); // Récupération de ton token admin

      const response = await axios.get(`${backendUrl}/api/utilisateur/liste`, {
        headers: {
          token: adminToken,
          Authorization: `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        setUtilisateurs(response.data.utilisateurs);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      toast.error("Impossible de charger la liste des abonnés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  return (
    <div className="p-6 md:p-10 font-sans max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-stone-900 font-alice tracking-wide">
          Membres Enregistrés
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Liste complète des comptes clients créés sur Aridona Héritage.
        </p>
        <div className="h-[2px] w-12 bg-amber-800 mt-3"></div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
        </div>
      ) : utilisateurs.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100">
          <p className="text-stone-500 text-sm">Aucun utilisateur enregistré pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-600 text-[10px] uppercase tracking-wider border-b border-stone-100">
                  <th className="py-4 px-6 font-semibold">Nom</th>
                  <th className="py-4 px-6 font-semibold">Adresse Email</th>
                  <th className="py-4 px-6 font-semibold">Téléphone / WhatsApp</th>
                  <th className="py-4 px-6 font-semibold">Date d'inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 text-xs">
                {utilisateurs.map((user) => (
                  <tr key={user._id} className="hover:bg-stone-50/50 transition-colors">
                    {/* Nom */}
                    <td className="py-4 px-6 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
                        <User size={13} />
                      </div>
                      <span className="font-medium text-stone-900">{user.name}</span>
                    </td>
                    {/* Email */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-stone-600">
                        <Mail size={13} className="text-stone-400" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    {/* Téléphone */}
                    <td className="py-4 px-6">
                      {user.telephone ? (
                        <div className="flex items-center gap-2 text-stone-600">
                          <Phone size={13} className="text-emerald-600" />
                          <span>{user.telephone}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic text-[11px]">Non renseigné</span>
                      )}
                    </td>
                    {/* Date d'inscription */}
                    <td className="py-4 px-6 text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-stone-400" />
                        <span>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilisateurs;