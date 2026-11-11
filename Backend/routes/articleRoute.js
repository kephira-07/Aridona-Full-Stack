import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  ajouterArticle,
  listerArticles,
  listerArticlesAdmin,
  getArticleParSlug,
  modifierArticle,
  supprimerArticle
} from '../controller/articleController.js';
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';

const articleRouter = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes. Réessayez plus tard.' },
});

// --- Routes Publiques ---
articleRouter.get('/list', apiLimiter, listerArticles);
articleRouter.get('/single/:slug', apiLimiter, getArticleParSlug);

// --- Routes Protégées Administrateur ---
articleRouter.get('/admin', apiLimiter, auth(['admin']), listerArticlesAdmin);
articleRouter.post('/add', apiLimiter, auth(['admin']), upload.single('image'), ajouterArticle);
articleRouter.put('/update/:id', apiLimiter, auth(['admin']), upload.single('image'), modifierArticle);
articleRouter.delete('/remove/:id', apiLimiter, auth(['admin']), supprimerArticle);

export default articleRouter;
