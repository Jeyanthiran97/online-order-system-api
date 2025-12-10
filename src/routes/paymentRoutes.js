import express from 'express';
import { createCheckoutSession, handleWebhook, verifyPayment } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.post('/verify-session', authenticate, verifyPayment);

export default router;
