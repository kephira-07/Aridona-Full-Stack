import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer'; // nécessaire pour le gestionnaire d'erreurs d'upload plus bas
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

// ⚠️ TODO : ce bump MASQUE un MaxListenersExceededWarning au lieu de le régler.
// Le warning t'indique quel émetteur et quel événement s'accumulent — c'est
// presque toujours un `.on(...)` ajouté à chaque requête sans être retiré.
// Traque la source et corrige-la ; ne garde cette ligne que si la concurrence
// est réellement légitime.
EventEmitter.defaultMaxListeners = 25;

const app = express();
const PORT = process.env.PORT || 4000;

// Config synchrone de Cloudinary
connectCloudinary();

// Middlewares
app.use(helmet());
app.use(express.json({ limit: '100kb' }));

// Origines autorisées : domaine de prod (client + admin servi sous /admin sur le même domaine)
// + ports de dev locaux. Personnalisable via CORS_ORIGIN (liste séparée par des virgules) sans
// avoir à retoucher le code si l'admin finit un jour sur un sous-domaine séparé.
const defaultOrigins = ['https://aridona.store', 'http://localhost:5173', 'http://localhost:5174'];
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : defaultOrigins;

app.use(cors({
  origin: (origin, callback) => {
    // Requêtes sans en-tête Origin (ex: appels serveur-à-serveur, curl, Merchant Center) : autorisées.
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
  res.send("L'API d'Arilona Shop fonctionne parfaitement !");
});

// Gestionnaire d'erreurs — À PLACER APRÈS LES ROUTES.
// En multer 2.x, les erreurs de fileFilter et de limite de taille se déclenchent
// dans le middleware (avant tes contrôleurs), donc les try/catch des contrôleurs
// ne les attrapent pas. Ce handler les renvoie en JSON propre plutôt qu'en page HTML.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Image trop lourde (5 Mo maximum).'
      : `Erreur d'upload : ${err.message}`;
    return res.status(400).json({ success: false, message });
  }
  if (err) {
    // rejet du fileFilter (mauvais format), etc.
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
});

// Démarrage : on attend la connexion BDD AVANT d'écouter, et on coupe net si elle échoue.
// ⚠️ Prérequis : connectDB doit RETOURNER la promesse de mongoose.connect
//    (dans config/mongoosedb.js : `return mongoose.connect(process.env.MONGO_URI)`).
connectDB()
  .then(async () => {
    // Aligne les index Mongo sur le schéma courant (ex : langue de l'index texte).
    // Idempotent — ne fait rien si les index sont déjà à jour.
    await produitModel.syncIndexes();
    await articleModel.syncIndexes();
    app.listen(PORT, () => console.log(`Serveur actif sur : http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Connexion BDD échouée :', err);
    process.exit(1);
  });