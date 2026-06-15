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
    setLoading(false);
    
    try {
      setLoading(true);
      // Remplace l'endpoint par ta vraie route de login admin (ex: /api/user/admin ou /api/admin/login)
      const response = await axios.post(`${backendUrl}/api/utilisateur/admin`, { email, password });
      
      if (response.data.success) {
        setToken(response.data.token);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif tracking-[0.2em] text-slate-900">ARILONA</h1>
          <p className="text-xs tracking-wider text-amber-600 uppercase mt-1">Espace Privé Admin</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmitHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Adresse Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@arilona.com" 
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-slate-900 transition-colors text-sm"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Mot de passe</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-slate-900 transition-colors text-sm"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-950 text-white p-3 rounded-xl font-medium text-sm tracking-wide hover:bg-slate-800 transition-all active:scale-[0.99] disabled:bg-slate-400"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;