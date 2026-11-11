import express from 'express';
import rateLimit from 'express-rate-limit';
import { getConfig } from '../controller/configController.js';

const configRouter = express.Router();

const configLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Trop de requêtes. Réessayez plus tard.' },
});

configRouter.get('/', configLimiter, getConfig);

export default configRouter;
