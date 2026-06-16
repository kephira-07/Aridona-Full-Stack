import express from 'express';
import { registerutilisateur, loginutilisateur ,adminLogin} from '../controller/utilisateurController.js';
import { getProfilUtilisateur, updateProfilUtilisateur } from '../controller/utilisateurController.js';
import authUser from '../middleware/authUser.js';

const utilisateurRouter = express.Router();

utilisateurRouter.post('/register', registerutilisateur);
utilisateurRouter.post('/login', loginutilisateur);
utilisateurRouter.post('/admin',adminLogin)
utilisateurRouter.get('/profil', authUser, getProfilUtilisateur)
utilisateurRouter.put('/modifier-profil', authUser, updateProfilUtilisateur)

export default utilisateurRouter;