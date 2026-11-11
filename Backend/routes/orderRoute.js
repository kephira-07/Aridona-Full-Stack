import express from 'express';
import {
	placeOrder,
	userOrders,
	allOrders,
	updateStatus
} from '../controller/orderController.js';
import auth from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const orderRouter = express.Router();

const orderLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 15,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { success: false, message: 'Trop de commandes envoyées. Réessayez plus tard.' },
});

// Client
orderRouter.post('/place', orderLimiter, placeOrder);
orderRouter.get('/userorders', auth(), userOrders);

// Admin
orderRouter.get('/list', auth(['admin']), allOrders);
orderRouter.post('/list', auth(['admin']), allOrders);
orderRouter.put('/status', auth(['admin']), updateStatus);
orderRouter.post('/status', auth(['admin']), updateStatus);

export default orderRouter;
