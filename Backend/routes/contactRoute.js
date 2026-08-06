import express from 'express';
import rateLimit from 'express-rate-limit';
import { envoyerMessageContact } from '../controller/contactController.js';

const contactRouter = express.Router();

// Endpoint public non-authentifié envoyant un email à chaque appel : limité pour éviter
// qu'il ne soit utilisé comme relais de spam (5 messages / 15 min / IP).
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Trop de messages envoyés. Merci de réessayer plus tard." },
});

contactRouter.post('/envoyer', contactLimiter, envoyerMessageContact);

export default contactRouter;
