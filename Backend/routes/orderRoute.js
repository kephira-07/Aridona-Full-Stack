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

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: { success: false, message: 'Trop de requêtes. Réessayez plus tard.' },
});

// Client
orderRouter.post('/place', orderLimiter, placeOrder);
orderRouter.get('/userorders', apiLimiter, auth(), userOrders);

// Admin
orderRouter.get('/list', apiLimiter, auth(['admin']), allOrders);
orderRouter.post('/list', apiLimiter, auth(['admin']), allOrders);
orderRouter.put('/status', apiLimiter, auth(['admin']), updateStatus);
orderRouter.post('/status', apiLimiter, auth(['admin']), updateStatus);

export default orderRouter;
