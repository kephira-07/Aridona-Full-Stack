import express from 'express';
import { registerutilisateur, loginutilisateur, adminLogin ,googleLogin} from '../controller/utilisateurController.js';
import { getProfilUtilisateur, updateProfilUtilisateur } from '../controller/utilisateurController.js';

import authUser from '../middleware/authUser.js';

const utilisateurRouter = express.Router();

utilisateurRouter.post('/register', registerutilisateur);
utilisateurRouter.post('/login', loginutilisateur);
utilisateurRouter.post('/admin', adminLogin);

// 🌟 CORRECTION : On passe en .post pour correspondre au axios.post du Frontend
utilisateurRouter.post('/profil', authUser, getProfilUtilisateur);
utilisateurRouter.post('/modifier-profil', authUser, updateProfilUtilisateur);
utilisateurRouter.post('/google-login', googleLogin);

export default utilisateurRouter;