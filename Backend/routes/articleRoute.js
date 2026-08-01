import express from 'express';
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

// --- Routes Publiques ---
articleRouter.get('/list', listerArticles);
articleRouter.get('/single/:slug', getArticleParSlug);

// --- Routes Protégées Administrateur ---
articleRouter.get('/admin', auth(['admin']), listerArticlesAdmin);
articleRouter.post('/add', auth(['admin']), upload.single('image'), ajouterArticle);
articleRouter.put('/update/:id', auth(['admin']), upload.single('image'), modifierArticle);
articleRouter.delete('/remove/:id', auth(['admin']), supprimerArticle);

export default articleRouter;
