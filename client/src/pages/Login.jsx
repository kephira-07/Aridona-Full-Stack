import React, { useState, useContext, useEffect, useCallback } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import BoutonRetour from '../composant/BoutonRetour';
import { LogOut, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import logo from '../assets/logo.png';

const Login = () => {
  const [etatactuel, setEtatactuel] = useState('Inscription'); 
  const [loading, setLoading] = useState(false);

  const { token, setToken, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [profil, setProfil] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formProfil, setFormProfil] = useState({ name: '', telephone: '', adresse: '', ville: 'Lomé' });

  const navigate = useNavigate(); 

  // ================= CHARGEMENT DU PROFIL =================
  const chargerProfil = useCallback(async () => {
    if (!token) return;
    try {
      // CORRECTION : axios.get au lieu de axios.post
      const response = await axios.get(`${backendUrl}/api/utilisateur/profil`, { 
        headers: { token } 
      });

      if (response.data.success) {
        const u = response.data.utilisateur;
        setProfil(u);
        setFormProfil({
          name: u.name || u.nom || '',
          telephone: u.telephone || '',
          adresse: u.adresse || '',
          ville: u.ville || 'Lomé'
        });
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  }, [backendUrl, token]);

  useEffect(() => {
    if (token) {
      chargerProfil();
    }
  }, [token, chargerProfil]);

  // ================= MODIFICATION DU PROFIL =================
  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.put(
        `${backendUrl}/api/utilisateur/modifier-profil`,
        formProfil,
        { headers: { token } }
      );
      if (response.data.success) {
        setProfil(response.data.utilisateur);
        setIsEditing(false);
        toast.success("Profil mis à jour avec succès !", { theme: "dark" });
      } else {
        toast.error(response.data.message || "Impossible de modifier le profil.", { theme: "dark" });
      }
    } catch (error) {
      toast.error("Erreur lors de la modification du profil.", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  // ================= DÉCONNEXION =================
  const handleLogout = () => {
    setToken('');
    setProfil(null);
    setFormProfil({ name: '', telephone: '', adresse: '', ville: 'Lomé' });
    localStorage.removeItem('token');
    setEtatactuel('Connexion'); 
    toast.info("Vous êtes déconnecté(e)", { theme: "dark" });
  };

  // ================= CONNEXION AVEC GOOGLE =================
  const loginAvecGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await axios.post(`${backendUrl}/api/utilisateur/google-login`, {
          access_token: tokenResponse.access_token,
        });
        if (res.data.success) {
          setToken(res.data.token);
          localStorage.setItem('token', res.data.token);
          toast.success("Connexion Google réussie !", { theme: "dark" });
        } else {
          toast.error(res.data.message, { theme: "dark" });
        }
      } catch (error) {
        console.error("Erreur Google Login:", error);
        toast.error("Échec de l'authentification Google.", { theme: "dark" });
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("La connexion Google a échoué.", { theme: "dark" }),
  });

  // ================= SOUMISSION DES FORMULAIRES =================
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (etatactuel === 'Inscription') {
        const response = await axios.post(`${backendUrl}/api/utilisateur/register`, { name, email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success("Bienvenue chez Aridona !", { theme: "dark" });
        } else {
          toast.error(response.data.message, { theme: "dark" });
        }
      } 
      else if (etatactuel === 'Connexion') {
        const response = await axios.post(`${backendUrl}/api/utilisateur/login`, { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success("Heureux de vous revoir !", { theme: "dark" });
        } else {
          toast.error(response.data.message, { theme: "dark" });
        }
      } 
      else if (etatactuel === 'Oubli') {
        const response = await axios.post(`${backendUrl}/api/utilisateur/mot-de-passe-oublie`, { email });
        
        if (response.data.success) {
          toast.success("Un lien de réinitialisation vous a été envoyé par e-mail.", { theme: "dark" });
          setEtatactuel('Connexion');
        } else {
          toast.error(response.data.message || "Une erreur est survenue.", { theme: "dark" });
        }
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Une erreur réseau est survenue.", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9F6] flex items-center justify-center font-sans relative overflow-hidden py-12">
      
      {/* Bouton Retour Flottant */}
      <div className="absolute top-6 left-6 z-20">
        <BoutonRetour />
      </div>

      {/* Grand Container Split Screen */}
      <div className="w-full min-h-screen lg:min-h-[50vh] lg:max-w-[1100px] lg:rounded-3xl lg:shadow-[0_20px_50px_rgba(28,26,23,0.08)] bg-white flex flex-col lg:flex-row overflow-hidden border border-stone-100">
        
        {/* PANNEAU DE GAUCHE : IDENTITÉ DE MAISON */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#301c0cee] relative p-12 flex-col justify-between overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-amber-600/55 blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10">
            <span className="font-caveat text-2xl text-amber-400 tracking-wide block">Maison</span>
            <div className="flex items-center cursor-pointer h-15 w-35" onClick={() => navigate('/')}>
              <img src={logo} alt="Logo Aridona Bijoux" className="object-contain w-full h-full" />
            </div>
          </div>

          <div className="relative z-10 my-auto space-y-6 max-w-[340px]">
            <p className="font-serif text-3xl text-stone-100 leading-relaxed font-alice font-light">
              "Des lignes pures nées de l’éclat de l’or, façonnées pour votre peau."
            </p>
            <div className="h-[1px] w-20 bg-amber-400"></div>
            <p className="text-xs text-stone-400 font-light leading-relaxed">
              Chaque écrin ouvert raconte une histoire de patience, de beauté et d'éternité. Rejoignez le club pour accéder à vos sélections privées.
            </p>
          </div>
        </div>

        {/* PANNEAU DE DROITE : FORMULAIRES & PROFIL */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-12 flex flex-col justify-center bg-[#FAF9F6] lg:bg-white relative">
          
          {token && profil ? (
            /* DESIGN PROFIL VIP */
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-2">
                <span className="font-caveat text-2xl text-amber-800">Mon doux espace secret</span>
                <h1 className="font-serif text-4xl text-stone-900 tracking-wide font-alice">Bonjour, {profil.name || profil.nom}</h1>
                <div className="h-[2px] w-12 bg-amber-800 mt-2"></div>
              </div>

              <div className="space-y-6 font-dmsans">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100 space-y-3.5">
                      <div className="flex items-center gap-3 text-stone-700 text-sm">
                        <Mail size={16} className="text-amber-800 shrink-0" />
                        <span className="font-medium">{profil.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-stone-700 text-sm">
                        <Phone size={16} className="text-amber-800 shrink-0" />
                        <span>{profil.telephone || "Aucun numéro WhatsApp lié"}</span>
                      </div>
                      <div className="flex items-start gap-3 text-stone-700 text-sm">
                        <MapPin size={16} className="text-amber-800 shrink-0 mt-0.5" />
                        <span>{profil.adresse ? `${profil.adresse}, ${profil.ville || 'Lomé'}` : "Aucune adresse enregistrée"}</span>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full py-3.5 bg-transparent border border-stone-900 text-stone-900 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-stone-950 hover:text-white transition-all duration-300 cursor-pointer"
                    >
                      Mettre à jour mes coordonnées
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfil} className="space-y-3 animate-in fade-in duration-300">
                    <div className="space-y-2 font-dmsans">
                      <input 
                        type="text" 
                        placeholder="Votre Nom Complet"
                        aria-label="Votre Nom Complet"
                        value={formProfil.name} 
                        onChange={(e) => setFormProfil({...formProfil, name: e.target.value})}
                        className="w-full bg-white border border-stone-200 rounded-full px-5 py-3 text-xs outline-none focus:border-amber-800 transition-all text-stone-800"
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="Téléphone / WhatsApp (ex: +228 90 00 00 00)"
                        aria-label="Téléphone ou WhatsApp"
                        value={formProfil.telephone} 
                        onChange={(e) => setFormProfil({...formProfil, telephone: e.target.value})}
                        className="w-full bg-white border border-stone-200 rounded-full px-5 py-3.5 text-xs outline-none focus:border-amber-800 transition-all text-stone-800"
                      />
                      <input 
                        type="text" 
                        placeholder="Adresse (Quartier, Rue, Maison)"
                        aria-label="Adresse"
                        value={formProfil.adresse} 
                        onChange={(e) => setFormProfil({...formProfil, adresse: e.target.value})}
                        className="w-full bg-white border border-stone-200 rounded-full px-5 py-3.5 text-xs outline-none focus:border-amber-800 transition-all text-stone-800"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 transition-all cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1 py-3 bg-[#1C1A17] text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all cursor-pointer disabled:bg-stone-200 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Enregistrement...' : 'Confirmer'}
                      </button>
                    </div>
                  </form>
                )}

                <button 
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-stone-50 border border-stone-200 rounded-full text-[11px] font-semibold uppercase tracking-wider text-stone-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all duration-300 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          ) : (
            /* FORMULAIRE (CONNEXION/INSCRIPTION/OUBLI) */
            <div className="animate-in fade-in duration-500 space-y-8">
              
              <div className="space-y-3">
                <span className="font-caveat text-2xl text-amber-800 block">Bienvenue chez vous</span>
                <h1 className="font-serif text-4xl text-stone-900 tracking-wide font-alice">
                  {etatactuel === 'Connexion' ? 'Connexion' : etatactuel === 'Inscription' ? 'Devenir Membre' : 'Récupération'}
                </h1>
                <p className="text-xs text-stone-500 font-dmsans leading-relaxed">
                  {etatactuel === 'Inscription' 
                    ? 'Inscrivez-vous pour composer votre collection et commander par WhatsApp.' 
                    : etatactuel === 'Connexion' 
                    ? 'Accédez à votre espace pour finaliser vos réservations précieuses.'
                    : 'Un e-mail vous sera transmis pour créer un nouveau mot de passe.'}
                </p>
              </div>

              <form onSubmit={onSubmitHandler} className="space-y-4">
                {etatactuel === 'Inscription' && (
                  <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] uppercase tracking-widest font-semibold text-stone-700 ml-1">Nom Complet</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white lg:bg-stone-50/50 border border-stone-200/80 rounded-xl px-5 py-3.5 text-xs outline-none focus:border-stone-950 focus:bg-white transition-all text-stone-800"
                      placeholder="Sophie Aura"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-stone-700 ml-1">Adresse Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white lg:bg-stone-50/50 border border-stone-200/80 rounded-xl px-5 py-3.5 text-xs outline-none focus:border-stone-950 focus:bg-white transition-all text-stone-800"
                    placeholder="sophie@example.com"
                    required
                  />
                </div>

                {etatactuel !== 'Oubli' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] uppercase tracking-widest font-semibold text-stone-700">Mot de passe</label>
                      {etatactuel === 'Connexion' && (
                        <button 
                          type="button"
                          onClick={() => setEtatactuel('Oubli')}
                          className="text-[10px] uppercase tracking-widest font-semibold text-amber-800 hover:text-stone-900 transition-all cursor-pointer"
                        >
                          Oublié ?
                        </button>
                      )}
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white lg:bg-stone-50/50 border border-stone-200/80 rounded-xl px-5 py-3.5 text-xs outline-none focus:border-stone-950 focus:bg-white transition-all text-stone-800"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                )}

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[#1C1A17] hover:bg-stone-800 text-stone-100 py-4 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-stone-950/5 active:scale-[0.98] disabled:bg-stone-200 disabled:text-stone-400 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Traitement...' : etatactuel === 'Connexion' ? 'Se Connecter' : etatactuel === 'Inscription' ? 'Rejoindre le Club' : 'Recevoir le lien'}</span>
                  {!loading && <ArrowRight size={13} className="text-amber-400" />}
                </button>
              </form>

              {/* Séparateur pour Google */}
              {etatactuel !== 'Oubli' && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex-1 border-t border-stone-200/60"></div>
                    <span className="px-3 text-[10px] text-stone-500 uppercase tracking-widest font-medium">ou</span>
                    <div className="flex-1 border-t border-stone-200/60"></div>
                  </div>

                  {/* Bouton Google */}
                  <button
                    type="button"
                    onClick={() => loginAvecGoogle()}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-stone-300 text-stone-700 py-3 px-6 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-stone-50 hover:border-amber-800/30 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.51 15 0 12 0 7.35 0 3.37 2.67 1.48 6.56l3.87 3a7.18 7.18 0 0 1 6.65-4.52z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46a5.54 5.54 0 0 1-2.4 3.64l3.73 2.9c2.18-2.01 3.7-4.97 3.7-8.69z" />
                      <path fill="#FBBC05" d="M5.35 14.56a7.12 7.12 0 0 1 0-4.12l-3.87-3A11.95 11.95 0 0 0 0 12c0 1.9.44 3.7 1.23 5.32l4.12-3.12l-.01-.64z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.73-2.9a7.14 7.14 0 0 1-11.02-3.84l-3.95 3.06C3.17 21.31 7.21 24 12 24z" />
                    </svg>
                    <span>Continuer avec Google</span>
                  </button>
                </div>
              )}

              {/* Navigation alternative */}
              <div className="text-center pt-2">
                {etatactuel === 'Connexion' ? (
                  <p className="text-xs text-stone-500 font-light">
                    Nouveau chez Aridona ?{' '}
                    <button 
                      type="button"
                      onClick={() => setEtatactuel('Inscription')}
                      className="text-amber-800 font-bold uppercase tracking-wider ml-1 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      Créer un compte
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-stone-500 font-light">
                    Déjà membre ?{' '}
                    <button 
                      type="button"
                      onClick={() => setEtatactuel('Connexion')}
                      className="text-amber-800 font-bold uppercase tracking-wider ml-1 hover:text-stone-900 transition-colors cursor-pointer"
                    >
                      Se connecter
                    </button>
                  </p>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Login;