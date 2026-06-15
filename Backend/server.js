import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import connectDB from './config/mongoosedb.js';
import utilisateurRouter from './routes/utilisateurRoute.js';
import produitRouter from './routes/produitRoute.js';
import connectCloudinary from './config/cloudinary.js';
import orderRouter from './routes/orderRoute.js';
import categorieRouter from './routes/categorieRoute.js'; // route pour les catégories


// Config App
const app = express();
const PORT = process.env.PORT || 4000;

// Connexion BDD
connectDB();
connectCloudinary();


// Middlewares
app.use(express.json());
app.use(cors());

// Connexions des Routes API
app.use('/api/utilisateur', utilisateurRouter);      
app.use('/api/produit', produitRouter); 
app.use('/api/order', orderRouter);
app.use('/api/categorie', categorieRouter); // route pour les catégories

app.get('/', (req, res) => {
    res.send("L'API d'Arilona Shop fonctionne parfaitement ! 🚀");
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur actif sur : http://localhost:${PORT}`);
    
});