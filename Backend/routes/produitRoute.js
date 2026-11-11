import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  addproduit,
  listproduits,
  removeproduit,
  singleproduit,
  singleproduitBySlug,
  updateproduit,
  searchProduits,
  changerStatutStock,
  getProductFeed,
  analyzeProductImage,
  shareProduitSocial
} from '../controller/produitController.js';
import { getDashboardStats } from "../controller/dashbordController.js";
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';

const produitRouter = express.Router();

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes. Réessayez plus tard.' },
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes. Réessayez plus tard.' },
});

const uploadFields = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]);

// --- Routes Publiques (Catalogue du site) ---
produitRouter.get('/list', publicLimiter, listproduits);
produitRouter.get('/single/slug/:slug', publicLimiter, singleproduitBySlug);
produitRouter.get('/single/:id', publicLimiter, singleproduit);
produitRouter.get('/search', publicLimiter, searchProduits);
produitRouter.get('/feed.xml', publicLimiter, getProductFeed); // Google Merchant Center

// --- Routes Protégées Administrateur ---
produitRouter.post('/add', adminLimiter, auth(['admin']), uploadFields, addproduit);
produitRouter.put('/update/:id', adminLimiter, auth(['admin']), uploadFields, updateproduit);
produitRouter.delete('/remove/:id', adminLimiter, auth(['admin']), removeproduit);
produitRouter.put('/changer-stock/:id', adminLimiter, auth(['admin']), changerStatutStock);
produitRouter.get('/stats-dashboard', adminLimiter, auth(['admin']), getDashboardStats);
produitRouter.post('/ai-analyze', adminLimiter, auth(['admin']), analyzeProductImage);
produitRouter.post('/share-social/:id', adminLimiter, auth(['admin']), shareProduitSocial);

export default produitRouter;
