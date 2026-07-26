import express from 'express';
import { placeOrder, userOrders, allOrders, updateStatus } from '../controller/orderController.js';
import auth from '../middleware/auth.js'; 

const orderRouter = express.Router();

const adminOnly = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: "Accès refusé. Droits administrateur requis." });
  }
  next();
};

// Client
orderRouter.post('/place', placeOrder);
orderRouter.get('/userorders', auth, userOrders);

// Admin
orderRouter.get('/list', auth, adminOnly, allOrders);
orderRouter.post('/list', auth, adminOnly, allOrders);
orderRouter.put('/status', auth, adminOnly, updateStatus);
orderRouter.post('/status', auth, adminOnly, updateStatus);

export default orderRouter;