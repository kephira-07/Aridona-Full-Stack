import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import EventEmitter from 'events';

import connectDB from './config/mongoosedb.js';
import connectCloudinary from './config/cloudinary.js';
import utilisateurRouter from './routes/utilisateurRoute.js';
import produitRouter from './routes/produitRoute.js';
import orderRouter from './routes/orderRoute.js';
import categorieRouter from './routes/categorieRoute.js';
import avisRouter from './routes/avisRoute.js';
import articleRouter from './routes/articleRoute.js';
import contactRouter from './routes/contactRoute.js';
import configRouter from './routes/configRoute.js';
import packRouter from './routes/packRoute.js';
import produitModel from './models/produitModel.js';
import articleModel from './models/articleModel.js';

EventEmitter.defaultMaxListeners = 25;

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

// Config synchrone de Cloudinary
connectCloudinary();

// Middlewares
app.use(helmet());

// ⚠️ Correction : Augmentation de la limite à 10mb pour accepter les images en Base64 (IA)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Origines autorisées : client et dashboard admin en production + ports de dev locaux.
const defaultOrigins = [
  'https://aridona.store',
  'https://aridona-bijoux-admin.onrender.com',
  'http://localhost:5173',
  'http://localhost:5174',
];
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : defaultOrigins;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origine non autorisée par CORS.'));
  },
  credentials: true,
}));

// Routes API
app.use('/api/utilisateur', utilisateurRouter);
app.use('/api/produit', produitRouter);
app.use('/api/order', orderRouter);
app.use('/api/categorie', categorieRouter);
app.use('/api/avis', avisRouter);
app.use('/api/article', articleRouter);
app.use('/api/contact', contactRouter);
app.use('/api/config', configRouter);
app.use('/api/packs', packRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.send("L'API d'Aridona Shop fonctionne parfaitement !");
});

// Gestionnaire d'erreurs d'upload (Multer)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image trop lourde (5 Mo maximum).'
      : `Erreur d'upload : ${err.message}`;
    return res.status(400).json({ success: false, message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

// Démarrage de la BDD et du serveur
connectDB()
  .then(async () => {
    await produitModel.syncIndexes();
    await articleModel.syncIndexes();
    app.listen(PORT, () => console.log(`Serveur actif sur : http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Connexion BDD échouée :', err);
    process.exit(1);
  });