import express from 'express';
import { ajouterAvis, listAvisProduit, listAvisAdmin, approuverAvis, supprimerAvis } from '../controller/avisController.js';
import auth from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const avisRouter = express.Router();

const avisLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { success: false, message: 'Trop d’avis envoyés. Réessayez plus tard.' },
});

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 200,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { success: false, message: 'Trop de requêtes. Réessayez plus tard.' },
});

// --- Routes Publiques ---
avisRouter.post('/ajouter', avisLimiter, ajouterAvis);
avisRouter.get('/produit/:produitId', apiLimiter, listAvisProduit);

// --- Routes Protégées Administrateur (modération) ---
avisRouter.get('/admin', apiLimiter, auth(['admin']), listAvisAdmin);
avisRouter.put('/approuver/:id', apiLimiter, auth(['admin']), approuverAvis);
avisRouter.delete('/supprimer/:id', apiLimiter, auth(['admin']), supprimerAvis);

export default avisRouter;
