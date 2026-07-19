import React, { useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../config';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${backendUrl}/api/utilisateur/admin`, { email, password });
      
      if (response.data.success) {
        const tokenRecu = response.data.token;
        
        // 💡 CRUCIAL : On stocke le token dans le localStorage pour éviter de le perdre au rafraîchissement
        localStorage.setItem('admin_token', tokenRecu); 
        
        // Mise à jour du state global
        setToken(tokenRecu);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <div className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800/60 w-full max-w-md relative overflow-hidden group">
        
        {/* Lueur dorée subtile en arrière-plan */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-700" />
        
        <div className="text-center mb-8 relative z-10">
          <h1 className="font-serif text-3xl tracking-[0.25em] bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent uppercase font-bold">
            ARIDONA
          </h1>
          <p className="text-[10px] tracking-widest text-amber-500/80 uppercase mt-1.5 font-semibold">
            Espace Privé Admin
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl mb-6 text-center font-medium shadow-inner">
            {error}
          </div>
        )}

        <form onSubmit={onSubmitHandler} className="space-y-5 relative z-10">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Adresse Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@arilona.com" 
              className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl outline-none focus:border-amber-500/60 transition-colors text-sm text-slate-100 placeholder:text-slate-600"
              required 
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Mot de passe
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-slate-950 border border-slate-800 p-3.5 rounded-xl outline-none focus:border-amber-500/60 transition-colors text-sm text-slate-100 placeholder:text-slate-600"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-3.5 rounded-xl font-bold text-sm tracking-wide hover:from-amber-400 hover:to-amber-500 transition-all active:scale-[0.99] disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 shadow-lg shadow-amber-500/10 mt-2"
          >
            {loading ? 'Vérification...' : 'Accéder au Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;