import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import BoutonRetour from '../composant/BoutonRetour';
import { Bell, LogOut, CheckCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const [etatactuel, setEtatactuel] = useState('Inscription'); // 'Connexion', 'Inscription', 'Oubli'
  const [loading, setLoading] = useState(false);

  // Récupération du token, de la fonction de modification et de l'URL du backend depuis le contexte
  const { token, setToken, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate(); 

  // Fonction de déconnexion personnalisée
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
    toast.info("Vous avez été déconnecté de votre espace Arilona. ✨", { theme: "dark" });
    setEtatactuel('Connexion'); // On le remet sur la page de connexion après déconnexion
  };

  // Gestion de la soumission du formulaire (Connexion & Inscription)
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (etatactuel === 'Inscription') {
        const response = await axios.post(`${backendUrl}/api/utilisateur/register`, { name, email, password });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success("Bienvenue au Club Arilona ! Vous serez notifié(e) de nos nouveautés. ✨", { theme: "dark" });
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
    <div className="min-h-[90vh] flex flex-col pt-28 pb-12 bg-[#fdfdfd] px-4">
      
      <div className="max-w-[450px] w-full mx-auto mb-4">
        <BoutonRetour />
      </div>

      <div className="w-full max-w-[450px] mx-auto bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-stone-100 rounded-2xl p-8 md:p-10 transition-all duration-500">
        
        {token ? (
          /* ÉTAT 1 : L'UTILISATEUR EST DÉJÀ CONNECTÉ (Espace Privé) */
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-amber-50 rounded-full border border-amber-100 text-amber-800">
              <Sparkles size={28} />
            </div>

            <div>
              <h1 className="font-serif text-2xl text-stone-800 tracking-wide">
                Votre Espace Privé
              </h1>
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-[0.2em] mt-1.5">
                Membre Privilège Arilona
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-100 rounded-xl p-5 text-left space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-600 leading-relaxed">
                  Votre abonnement aux alertes est <strong>actif</strong>. Vous recevrez un e-mail dès la mise en ligne de nos nouvelles pièces exclusives de joaillerie.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-600 leading-relaxed">
                  Accès prioritaire à nos collections capsules et ventes privées éphémères avant le grand public.
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-400 px-4 italic">
              Merci pour votre confiance et votre fidélité à la maison Arilona.
            </p>

            <div className="pt-4 border-t border-stone-100">
              <button 
                type="button"
                onClick={handleLogout}
                className="w-full border border-stone-200 text-stone-600 py-3.5 rounded-xl text-xs font-semibold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 hover:bg-stone-50 hover:text-red-600 hover:border-red-100"
              >
                <LogOut size={14} />
                Se déconnecter de mon compte
              </button>
            </div>
          </div>
        ) : (
          /* ÉTAT 2 : L'UTILISATEUR N'EST PAS CONNECTÉ (Formulaire d'Inscription / Connexion) */
          <div>
            {/* Petit badge marketing au-dessus du titre */}
            <div className="mx-auto flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1 w-fit rounded-full font-medium tracking-wider mb-4 uppercase">
              <Bell size={10} /> Alerte Nouveautés Arilona
            </div>

            {/* Titre Dynamique */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-2xl text-stone-800 tracking-wide transition-all">
                {etatactuel === 'Connexion' ? 'Se connecter' : etatactuel === 'Inscription' ? 'Créer un compte club' : 'Récupération'}
              </h1>
              <p className="text-xs text-stone-400 mt-2 px-4 leading-relaxed">
                {etatactuel === 'Inscription' 
                  ? 'Inscrivez-vous pour être informé(e) en exclusivité du lancement de nos prochains bijoux.' 
                  : 'Accédez à votre espace membre Arilona.'}
              </p>
            </div>

            <form className="space-y-5" onSubmit={onSubmitHandler}>
              
              {/* Champ Nom (Inscription) */}
              {etatactuel === 'Inscription' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 ml-1">Nom Complet</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-b border-stone-200 py-3 outline-none focus:border-stone-900 text-stone-700 transition-colors bg-transparent text-sm"
                    placeholder="Ex: Sophie Arilona"
                    required
                  />
                </div>
              )}

              {/* Champ Email */}
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

              {/* Champ Mot de Passe */}
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

              {/* Mot de passe oublié */}
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

            {/* Pied de page de la carte */}
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