import express from 'express';
import { 
  registerutilisateur, 
  loginutilisateur, 
  adminLogin, 
  googleLogin,
  getProfilUtilisateur, 
  updateProfilUtilisateur, 
  listerUtilisateurs,
  getUtilisateurPanier,
  ajouterAuPanier,
  updatePanier,
  deletePanier,
  ajouterPackAuPanier,
  updatePanierPack,
  deletePanierPack
} from '../controller/utilisateurController.js';

import auth from '../middleware/auth.js'; 
import rateLimit from 'express-rate-limit';

const utilisateurRouter = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
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

// --- 1. Routes Publiques ---
utilisateurRouter.post('/register', authLimiter, registerutilisateur);
utilisateurRouter.post('/login', authLimiter, loginutilisateur);
utilisateurRouter.post('/admin', authLimiter, adminLogin);
utilisateurRouter.post('/google-login', authLimiter, googleLogin);

// --- 2. Routes Protégées Client ---
utilisateurRouter.get('/profil', apiLimiter, auth(), getProfilUtilisateur);
utilisateurRouter.post('/profil', apiLimiter, auth(), getProfilUtilisateur);
utilisateurRouter.put('/modifier-profil', apiLimiter, auth(), updateProfilUtilisateur);
utilisateurRouter.get('/panier', apiLimiter, auth(), getUtilisateurPanier);
utilisateurRouter.post('/panier/ajouter', apiLimiter, auth(), ajouterAuPanier);
utilisateurRouter.post('/panier/update', apiLimiter, auth(), updatePanier);
utilisateurRouter.post('/panier/supprimer', apiLimiter, auth(), deletePanier);
utilisateurRouter.delete('/panier/supprimer', apiLimiter, auth(), deletePanier);
utilisateurRouter.post('/panier/pack/ajouter', apiLimiter, auth(), ajouterPackAuPanier);
utilisateurRouter.post('/panier/pack/update', apiLimiter, auth(), updatePanierPack);
utilisateurRouter.post('/panier/pack/supprimer', apiLimiter, auth(), deletePanierPack);

// --- 3. Routes Protégées Administrateur ---
utilisateurRouter.get('/liste', apiLimiter, auth(['admin']), listerUtilisateurs);

export default utilisateurRouter;
