import express from 'express';
import rateLimit from 'express-rate-limit';
import { listPacks, getPackBySlug, listPacksAdmin, createPack, updatePack, deletePack } from '../controller/packController.js';
import auth from '../middleware/auth.js';

const packRouter = express.Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes. Réessayez plus tard.' },
});

packRouter.get('/', apiLimiter, listPacks);
packRouter.get('/admin', apiLimiter, auth(['admin']), listPacksAdmin);
packRouter.get('/:slug', apiLimiter, getPackBySlug);
packRouter.post('/', apiLimiter, auth(['admin']), createPack);
packRouter.put('/:id', apiLimiter, auth(['admin']), updatePack);
packRouter.delete('/:id', apiLimiter, auth(['admin']), deletePack);

export default packRouter;
