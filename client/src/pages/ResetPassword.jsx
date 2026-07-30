import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import backendUrl from '../config';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [nouveauPassword, setNouveauPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (nouveauPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.", { theme: "dark" });
      return;
    }
    if (nouveauPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.", { theme: "dark" });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/utilisateur/reinitialiser-mot-de-passe`, {
        token,
        nouveauPassword
      });

      if (response.data.success) {
        toast.success("Votre mot de passe a été mis à jour ! Redirection...", { theme: "dark" });
        setTimeout(() => navigate('/login'), 3000);
      } else {
        toast.error(response.data.message || "Impossible de réinitialiser le mot de passe.", { theme: "dark" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de la réinitialisation.", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-stone-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] text-center space-y-8">
        <div>
          <span className="font-caveat text-2xl text-amber-800">Sécurité</span>
          <h2 className="font-serif text-3xl text-stone-900 tracking-wide font-alice mt-1">Nouveau départ</h2>
          <p className="text-xs text-stone-400 font-light mt-2">Choisissez votre nouveau mot de passe secret.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <input 
            type="password" 
            placeholder="Nouveau mot de passe"
            aria-label="Nouveau mot de passe"
            value={nouveauPassword}
            onChange={(e) => setNouveauPassword(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-full px-5 py-3.5 text-xs outline-none focus:border-stone-900 focus:bg-white transition-all text-stone-800"
            required
          />
          <input 
            type="password" 
            placeholder="Confirmez le mot de passe"
            aria-label="Confirmez le mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-full px-5 py-3.5 text-xs outline-none focus:border-stone-900 focus:bg-white transition-all text-stone-800"
            required
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1C1A17] hover:bg-stone-800 text-white py-3.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 disabled:bg-stone-200 disabled:text-stone-400 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Modification...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;