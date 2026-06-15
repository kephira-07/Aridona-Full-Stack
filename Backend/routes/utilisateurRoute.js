import express from 'express';
import { registerutilisateur, loginutilisateur ,adminLogin} from '../controller/utilisateurController.js';

const utilisateurRouter = express.Router();

utilisateurRouter.post('/register', registerutilisateur);
utilisateurRouter.post('/login', loginutilisateur);
utilisateurRouter.post('/admin',adminLogin)

export default utilisateurRouter;