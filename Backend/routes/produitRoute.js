import express from 'express';
import { addproduit, listproduits,removeproduit,singleproduit,updateproduit } from '../controller/produitController.js';
import upload from '../middleware/multer.js';
import { searchProduits } from '../controller/produitController.js';


const produitRouter = express.Router();

produitRouter.post('/add', upload.fields([{name:'image1', maxCount:1}, {name:'image2', maxCount:1}, {name:'image3', maxCount:1}, {name:'image4', maxCount:1}]), addproduit);
produitRouter.get('/list', listproduits);
produitRouter.get('/single/:id', singleproduit);    
produitRouter.delete('/remove/:id',removeproduit); 
produitRouter.put('/update/:id', upload.fields([{name:'image1', maxCount:1}, {name:'image2', maxCount:1}, {name:'image3', maxCount:1}, {name:'image4', maxCount:1}]), updateproduit);
produitRouter.get('/search', searchProduits);


export default produitRouter;