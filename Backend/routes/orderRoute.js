import express from 'express';
import { placeOrder, allOrders, updateStatus } from '../controller/orderController.js';
import authUser from '../middleware/authUser.js'; 
import adminAuth from '../middleware/adminAuth.js'; // 🌟 Import de la sécurité Admin si elle existe

const orderRouter = express.Router();

// 🛒 ROUTE BOUTIQUE CLIENT (POST & authUser)
orderRouter.post('/place', authUser, placeOrder);  

// 👑 ROUTES PANEL ADMIN (POST pour correspondre à ton Axios frontend !)
// Si tu n'as pas de middleware adminAuth, retire-le temporairement pour tester : (ex: orderRouter.post('/list', allOrders))
orderRouter.post('/list', adminAuth, allOrders);   
orderRouter.post('/status', adminAuth, updateStatus); 

export default orderRouter;