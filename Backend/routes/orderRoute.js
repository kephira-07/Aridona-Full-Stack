import express from 'express';
import { placeOrder, userOrders, allOrders, updateStatus } from '../controller/orderController.js';
import auth from '../middleware/auth.js'; 

const orderRouter = express.Router();



// Client
orderRouter.post('/place', placeOrder);
orderRouter.get('/userorders', auth(), userOrders);

// Admin
orderRouter.get('/list', auth(['admin']), allOrders);
orderRouter.post('/list', auth(['admin']), allOrders);
orderRouter.put('/status', auth(['admin']), updateStatus);
orderRouter.post('/status', auth(['admin']), updateStatus);

export default orderRouter;