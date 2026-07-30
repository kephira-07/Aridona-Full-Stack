import express from 'express';
import { ajouterAvis, listAvisProduit, listAvisAdmin, approuverAvis, supprimerAvis } from '../controller/avisController.js';
import auth from '../middleware/auth.js';

const avisRouter = express.Router();

// --- Routes Publiques ---
avisRouter.post('/ajouter', ajouterAvis);
avisRouter.get('/produit/:produitId', listAvisProduit);

// --- Routes Protégées Administrateur (modération) ---
avisRouter.get('/admin', auth(['admin']), listAvisAdmin);
avisRouter.put('/approuver/:id', auth(['admin']), approuverAvis);
avisRouter.delete('/supprimer/:id', auth(['admin']), supprimerAvis);

export default avisRouter;
