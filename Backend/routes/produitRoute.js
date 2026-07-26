import express from 'express';
import { 
  addproduit, 
  listproduits, 
  removeproduit, 
  singleproduit, 
  updateproduit, 
  searchProduits, 
  changerStatutStock 
} from '../controller/produitController.js';
import { getDashboardStats } from "../controller/dashbordController.js";
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';

const produitRouter = express.Router();

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: "Accès refusé. Droits administrateur requis." });
  }
  next();
};

const uploadFields = upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]);

// Routes Publiques
produitRouter.get('/list', listproduits);
produitRouter.get('/single/:id', singleproduit);
produitRouter.get('/search', searchProduits);

// Routes Administrateur
produitRouter.post('/add', auth, adminOnly, uploadFields, addproduit);
produitRouter.put('/update/:id', auth, adminOnly, uploadFields, updateproduit);
produitRouter.delete('/remove/:id', auth, adminOnly, removeproduit);
produitRouter.put('/changer-stock/:id', auth, adminOnly, changerStatutStock);
produitRouter.get('/stats-dashboard', auth, adminOnly, getDashboardStats);

export default produitRouter;