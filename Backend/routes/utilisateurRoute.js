import express from 'express';
import { registerutilisateur, loginutilisateur ,adminLogin} from '../controller/utilisateurController.js';
import { getProfilUtilisateur, updateProfilUtilisateur } from '../controller/utilisateurController.js';


const utilisateurRouter = express.Router();

utilisateurRouter.post('/register', registerutilisateur);
utilisateurRouter.post('/login', loginutilisateur);
utilisateurRouter.post('/admin',adminLogin)
utilisateurRouter.get('/profil',  getProfilUtilisateur)
utilisateurRouter.put('/modifier-profil', updateProfilUtilisateur)

export default utilisateurRouter;