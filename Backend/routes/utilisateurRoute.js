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
  listerUtilisateurs,
  getUtilisateurPanier
} from '../controller/utilisateurController.js';

// Importation du middleware d'authentification RBAC
import auth from '../middleware/auth.js'; 

const utilisateurRouter = express.Router();

// --- 1. Routes Publiques (Sans authentification) ---
utilisateurRouter.post('/register', registerutilisateur);
utilisateurRouter.post('/login', loginutilisateur);
utilisateurRouter.post('/admin', adminLogin);
utilisateurRouter.post('/google-login', googleLogin);
utilisateurRouter.post('/mot-de-passe-oublie', motDePasseOublie);
utilisateurRouter.post('/reinitialiser-mot-de-passe', reinitialiserMotDePasse);

// --- 2. Routes Protégées Client (Accessible à tout utilisateur connecté) ---
utilisateurRouter.get('/profil', auth(), getProfilUtilisateur); // Passage en GET recommandé
utilisateurRouter.post('/profil', auth(), getProfilUtilisateur); // Conservé en POST si votre frontend l'exige
utilisateurRouter.put('/modifier-profil', auth(), updateProfilUtilisateur); // PUT ou POST selon votre frontend
utilisateurRouter.post('/panier', auth(), getUtilisateurPanier);

// --- 3. Routes Protégées Administrateur ---
// Utilisation directe du contrôle de rôle intégré dans auth(['admin'])
utilisateurRouter.get('/liste', auth(['admin']), listerUtilisateurs);

export default utilisateurRouter;