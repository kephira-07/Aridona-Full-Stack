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
  getUtilisateurPanier,
  ajouterAuPanier,
  updatePanier,
  deletePanier,
  ajouterPackAuPanier,
  updatePanierPack,
  deletePanierPack
} from '../controller/utilisateurController.js';

// Importation du middleware d'authentification RBAC
import auth from '../middleware/auth.js'; 
import rateLimit from 'express-rate-limit';

const utilisateurRouter = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives. Réessayez plus tard.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes. Réessayez plus tard.' },
});

// --- 1. Routes Publiques (Sans authentification) ---
utilisateurRouter.post('/register', authLimiter, registerutilisateur);
utilisateurRouter.post('/login', authLimiter, loginutilisateur);
utilisateurRouter.post('/admin', authLimiter, adminLogin);
utilisateurRouter.post('/google-login', authLimiter, googleLogin);
utilisateurRouter.post('/mot-de-passe-oublie', authLimiter, motDePasseOublie);
utilisateurRouter.post('/reinitialiser-mot-de-passe', authLimiter, reinitialiserMotDePasse);

// --- 2. Routes Protégées Client (Accessible à tout utilisateur connecté) ---
utilisateurRouter.get('/profil', apiLimiter, auth(), getProfilUtilisateur); // Passage en GET recommandé
utilisateurRouter.post('/profil', apiLimiter, auth(), getProfilUtilisateur); // Conservé en POST si votre frontend l'exige
utilisateurRouter.put('/modifier-profil', apiLimiter, auth(), updateProfilUtilisateur); // PUT ou POST selon votre frontend
utilisateurRouter.get('/panier', apiLimiter, auth(), getUtilisateurPanier);
utilisateurRouter.post('/panier/ajouter', apiLimiter, auth(), ajouterAuPanier);
utilisateurRouter.post('/panier/update', apiLimiter, auth(), updatePanier);
utilisateurRouter.post('/panier/supprimer', apiLimiter, auth(), deletePanier);
utilisateurRouter.delete('/panier/supprimer', apiLimiter, auth(), deletePanier); // Le client appelle axios.delete() sur cette route
utilisateurRouter.post('/panier/pack/ajouter', apiLimiter, auth(), ajouterPackAuPanier);
utilisateurRouter.post('/panier/pack/update', apiLimiter, auth(), updatePanierPack);
utilisateurRouter.post('/panier/pack/supprimer', apiLimiter, auth(), deletePanierPack);
// --- 3. Routes Protégées Administrateur ---
// Utilisation directe du contrôle de rôle intégré dans auth(['admin'])
utilisateurRouter.get('/liste', apiLimiter, auth(['admin']), listerUtilisateurs);

export default utilisateurRouter;