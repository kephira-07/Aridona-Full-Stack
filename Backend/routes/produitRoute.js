import express from 'express';
import {
  addproduit,
  listproduits,
  removeproduit,
  singleproduit,
  singleproduitBySlug,
  updateproduit,
  searchProduits,
  changerStatutStock,
  getProductFeed
} from '../controller/produitController.js';
import { getDashboardStats } from "../controller/dashbordController.js";
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';

const produitRouter = express.Router();

const uploadFields = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]);

// --- Routes Publiques (Catalogue du site) ---
produitRouter.get('/list', listproduits);
produitRouter.get('/single/slug/:slug', singleproduitBySlug);
produitRouter.get('/single/:id', singleproduit);
produitRouter.get('/search', searchProduits);
produitRouter.get('/feed.xml', getProductFeed); // Google Merchant Center

// --- Routes Protégées Administrateur ---
// L'appel auth(['admin']) vérifie le JWT + le rôle 'admin' + l'email administrateur
produitRouter.post('/add', auth(['admin']), uploadFields, addproduit);
produitRouter.put('/update/:id', auth(['admin']), uploadFields, updateproduit);
produitRouter.delete('/remove/:id', auth(['admin']), removeproduit);
produitRouter.put('/changer-stock/:id', auth(['admin']), changerStatutStock);
produitRouter.get('/stats-dashboard', auth(['admin']), getDashboardStats);

export default produitRouter;