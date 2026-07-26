import express from 'express';
import { 
  registerutilisateur, 
  loginutilisateur, 
  adminLogin, 
  googleLogin,
  getProfilUtilisateur, 
  updateProfilUtilisateur, 
  motDePasseOublie, 
  reinitialiserMotDePasse,
  listerUtilisateurs

} from '../controller/utilisateurController.js';

// Importation du middleware unique d'authentification
import auth from '../middleware/auth.js'; 

const utilisateurRouter = express.Router();

// --- Routes Publiques (pas besoin de middleware) ---
utilisateurRouter.post('/register', registerutilisateur);
utilisateurRouter.post('/login', loginutilisateur);
utilisateurRouter.post('/admin', adminLogin); // RETIRÉ: adminAuth (l'admin doit pouvoir se connecter sans token préalable)
utilisateurRouter.post('/google-login', googleLogin);
utilisateurRouter.post('/mot-de-passe-oublie', motDePasseOublie);
utilisateurRouter.post('/reinitialiser-mot-de-passe', reinitialiserMotDePasse);

// --- Routes Protégées Utilisateur Client ---
utilisateurRouter.post('/profil', auth, getProfilUtilisateur);
utilisateurRouter.post('/modifier-profil', auth, updateProfilUtilisateur);

// --- Routes Protégées Administrateur ---
utilisateurRouter.get('/liste', auth, (req, res, next) => {
  // Vérification directe du rôle administrateur
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: "Accès refusé. Droits administrateur requis." });
  }
  next();
}, listerUtilisateurs);

export default utilisateurRouter;