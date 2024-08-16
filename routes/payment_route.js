import { Router } from 'express';
import { momoPaymentHandler, initializePayment, verifyPayment } from '../controllers/payment_controller.js';
import { checkAuth } from '../middlewares/auth.js';

export const paymentRouter = Router();

// Unified MoMo payment route
paymentRouter.post('/users/pay/momo', checkAuth, momoPaymentHandler);
paymentRouter.post ('/users/charge', checkAuth, initializePayment);
paymentRouter.post('/users/charge/submit_pin', verifyPayment);