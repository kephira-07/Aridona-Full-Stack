import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import BoutonRetour from '../composant/BoutonRetour';
import { Bell, LogOut, CheckCircle, Sparkles, User, MapPin, Phone, Mail, ShieldCheck, Edit3 } from 'lucide-react';

const Login = () => {
  const [etatactuel, setEtatactuel] = useState('Inscription'); 
  const [loading, setLoading] = useState(false);

  const { token, setToken, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 🌟 NOUVEAUX ÉTATS POUR LA GESTION DU COMPTE BENTO
  const [profil, setProfil] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formProfil, setFormProfil] = useState({ name: '', telephone: '', adresse: '', ville: 'Lomé' });

  const navigate = useNavigate(); 

  // Charger le profil si le token est présent
  const chargerProfil = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/utilisateur/profil`, {}, { headers: { token } });
      if (response.data.success) {
        setProfil(response.data.utilisateur);
        setFormProfil({
          name: response.data.utilisateur.name,
          telephone: response.data.utilisateur.telephone || '',
          adresse: response.data.utilisateur.adresse || '',
          ville: response.data.utilisateur.ville || 'Lomé'
        });
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  useEffect(() => {
    if (token) {
      chargerProfil();
    }
  }, [token]);

  // Sauvegarder les modifications du profil
  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${backendUrl}/api/utilisateur/modifier-profil`, formProfil, { headers: { token } });
      if (response.data.success) {
        setProfil(response.data.utilisateur);
        setIsEditing(false);
        toast.success("Votre profil de conciergerie a été mis à jour. ✨", { theme: "dark" });
      } else {
        toast.error(response.data.message, { theme: "dark" });
      }
    } catch (error) {
      toast.error("Erreur lors de la modification.", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setProfil(null);
    localStorage.removeItem('token');
    toast.info("Vous avez été déconnecté de votre espace Aura Héritage. ✨", { theme: "dark" });
    setEtatactuel('Connexion'); 
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (etatactuel === 'Inscription') {
        const response = await axios.post(`${backendUrl}/api/utilisateur/register`, { name, email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success("Bienvenue au Club Aura Héritage ! ✨", { theme: "dark" });
        } else {
          toast.error(response.data.message, { theme: "dark" });
        }
      } else if (etatactuel === 'Connexion') {
        const response = await axios.post(`${backendUrl}/api/utilisateur/login`, { email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success("Heureux de vous revoir parmi nous ! ✨", { theme: "dark" });
        } else {
          toast.error(response.data.message, { theme: "dark" });
        }
      } else {
        toast.info("Un lien de récupération a été envoyé sur votre boîte mail.", { theme: "dark" });
        setEtatactuel('Connexion');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Une erreur réseau est survenue.", { theme: "dark" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col pt-28 pb-12 bg-[#FAF9F6] px-4">
      
      <div className="max-w-[450px] w-full mx-auto mb-4">
        <BoutonRetour />
      </div>

      {/* Ajustement dynamique de la largeur : Plus large (max-w-4xl) si connecté pour le Bento Grid */}
      <div className={`w-full mx-auto bg-white shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-stone-100 rounded-3xl p-6 md:p-10 transition-all duration-500 ${token ? 'max-w-4xl' : 'max-w-[450px]'}`}>
        
        {token && profil ? (
          /* ================= ÉTAT CONNECTÉ : DASHBOARD BENTO PREMIUM ================= */
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Header du Dashboard */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-100">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-600 flex items-center gap-1">
                  <Sparkles size={12} /> Votre Écrin Personnel
                </span>
                <h1 className="font-serif text-2xl text-stone-900 mt-1">Maison Aura Héritage</h1>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-xl text-xs font-medium text-stone-600 bg-stone-50 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
              >
                <LogOut size={13} />
                <span>Quitter l'espace</span>
              </button>
            </div>

            {/* GRILLE STYLE BENTO (Architecture Asymétrique) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* BLOC BENTO 1 : Carte d'identité Privilège (Noir profond) */}
              <div className="bg-stone-950 text-white p-6 rounded-2xl flex flex-col justify-between shadow-sm border border-stone-900">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center text-amber-400">
                    <User size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-stone-400">Statut Client</p>
                    <h3 className="font-serif text-base text-amber-400 mt-0.5">Membre Club Privé</h3>
                    <p className="text-xl font-light tracking-wide mt-2">{profil.name}</p>
                  </div>
                  <div className="space-y-2 text-[11px] text-stone-300 font-light pt-2 border-t border-stone-900">
                    <div className="flex items-center gap-2"><Mail size={12} className="text-stone-500" /> {profil.email}</div>
                    <div className="flex items-center gap-2"><Phone size={12} className="text-stone-500" /> {profil.telephone || "Aucun contact WhatsApp"}</div>
                    <div className="flex items-center gap-2"><MapPin size={12} className="text-stone-500" /> {profil.adresse ? `${profil.adresse}, ${profil.ville}` : "Aucune adresse enregistrée"}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest text-stone-500 pt-6 mt-4">
                  <ShieldCheck size={12} className="text-amber-500" />
                  <span>Données de conciergerie protégées</span>
                </div>
              </div>

              {/* BLOC BENTO 2 & 3 COMBINÉS : Formulaire dynamique de profil */}
              <div className="bg-stone-50/60 border border-stone-100 p-6 rounded-2xl md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-base text-stone-900 tracking-wide">Coordonnées de Livraison Privée</h3>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-[10px] uppercase font-bold tracking-wider text-amber-700 hover:text-stone-950 transition-colors flex items-center gap-1"
                    >
                      <Edit3 size={12} />
                      {isEditing ? "Annuler" : "Modifier mes fiches"}
                    </button>
                  </div>

                  {!isEditing ? (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3.5 border border-stone-100 rounded-xl">
                          <span className="text-[9px] uppercase font-semibold text-stone-400">Nom de Réception</span>
                          <p className="text-xs font-medium text-stone-800 mt-0.5">{profil.name}</p>
                        </div>
                        <div className="bg-white p-3.5 border border-stone-100 rounded-xl">
                          <span className="text-[9px] uppercase font-semibold text-stone-400">Contact d'Expédition (WhatsApp)</span>
                          <p className="text-xs font-medium text-stone-800 mt-0.5">{profil.telephone || "Non renseigné"}</p>
                        </div>
                      </div>
                      <div className="bg-white p-3.5 border border-stone-100 rounded-xl">
                        <span className="text-[9px] uppercase font-semibold text-stone-400">Adresse Résidentielle pour vos Colis</span>
                        <p className="text-xs font-medium text-stone-800 mt-0.5">
                          {profil.adresse ? `${profil.adresse}, ${profil.ville}` : "Veuillez configurer une adresse pour faciliter vos futurs emballages et livraisons sur Lomé ou à l'intérieur."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleUpdateProfil} className="space-y-3.5 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] uppercase font-semibold text-stone-400 mb-1">Nom Complet</label>
                          <input 
                            type="text" 
                            value={formProfil.name} 
                            onChange={(e) => setFormProfil({...formProfil, name: e.target.value})}
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-semibold text-stone-400 mb-1">Téléphone / WhatsApp</label>
                          <input 
                            type="text" 
                            value={formProfil.telephone} 
                            onChange={(e) => setFormProfil({...formProfil, telephone: e.target.value})}
                            placeholder="Ex: +228 90 00 00 00"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[9px] uppercase font-semibold text-stone-400 mb-1">Adresse (Quartier, Rue, Maison)</label>
                          <input 
                            type="text" 
                            value={formProfil.adresse} 
                            onChange={(e) => setFormProfil({...formProfil, adresse: e.target.value})}
                            placeholder="Ex: Adidogomé, Face Cité"
                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-stone-900"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-stone-950 text-white text-[9px] uppercase tracking-widest font-bold px-4 py-2.5 rounded-xl hover:bg-stone-900 transition-colors"
                      >
                        {loading ? 'Sauvegarde...' : 'Enregistrer le profil'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Bloc Alerte Privilège d'origine intégré proprement en bas de colonne */}
                <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-start gap-2.5 text-[11px] text-stone-500 leading-relaxed font-light">
                  <CheckCircle size={14} className="text-green-600 shrink-0 mt-0.5" />
                  <p>
                    Abonnement actif aux alertes joaillères. Vous avez la priorité sur nos prochaines collections capsules éphémères.
                  </p>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* ================= ÉTAT DÉCONNECTÉ : FORMULAIRES DE CONNEXION / INSCRIPTION ================= */
          <div>
            <div className="mx-auto flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 w-fit rounded-full font-medium tracking-wider mb-4 uppercase">
              <Bell size={10} /> Alerte Nouveautés Aura
            </div>

            <div className="text-center mb-8">
              <h1 className="font-serif text-2xl text-stone-800 tracking-wide transition-all">
                {etatactuel === 'Connexion' ? 'Se connecter' : etatactuel === 'Inscription' ? 'Créer un compte club' : 'Récupération'}
              </h1>
              <p className="text-xs text-stone-400 mt-2 px-4 leading-relaxed">
                {etatactuel === 'Inscription' 
                  ? 'Inscrivez-vous pour être informé(e) en exclusivité du lancement de nos prochains bijoux.' 
                  : 'Accédez à votre espace membre Aura Héritage.'}
              </p>
            </div>

            <form className="space-y-5" onSubmit={onSubmitHandler}>
              {etatactuel === 'Inscription' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 ml-1">Nom Complet</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 text-stone-700 transition-colors bg-transparent text-sm"
                    placeholder="Ex: Sophie Aura"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 ml-1">Adresse Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 text-stone-700 transition-colors bg-transparent text-sm"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              {etatactuel !== 'Oubli' && (
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 ml-1">Mot de passe</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 text-stone-700 transition-colors bg-transparent text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}

              {etatactuel === 'Connexion' && (
                <div className="text-right">
                  <button 
                    type="button"
                    onClick={() => setEtatactuel('Oubli')}
                    className="text-[10px] uppercase tracking-widest font-medium text-stone-400 hover:text-stone-900 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              <button 
                disabled={loading}
                type="submit"
                className="w-full bg-stone-950 text-white py-4 mt-6 rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-300 active:scale-[0.99] hover:bg-stone-900 hover:shadow-md disabled:bg-stone-200 disabled:text-stone-400"
              >
                {loading ? 'Traitement...' : etatactuel === 'Connexion' ? 'Se Connecter' : etatactuel === 'Inscription' ? 'S\'abonner aux nouveautés' : 'Envoyer le lien'}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-stone-100 pt-6">
              {etatactuel === 'Connexion' ? (
                <p className="text-xs text-stone-500 italic">
                  Pas encore inscrit(e) ?{' '}
                  <button 
                    type="button"
                    onClick={() => { setEtatactuel('Inscription'); }}
                    className="text-amber-800 not-italic font-semibold uppercase tracking-widest ml-1 hover:text-amber-900 transition-colors"
                  >
                    Créer un compte
                  </button>
                </p>
              ) : (
                <p className="text-xs text-stone-500 italic">
                  Déjà membre ?{' '}
                  <button 
                    type="button"
                    onClick={() => { setEtatactuel('Connexion'); }}
                    className="text-amber-800 not-italic font-semibold uppercase tracking-widest ml-1 hover:text-amber-900 transition-colors"
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
  );
};

export default Login;