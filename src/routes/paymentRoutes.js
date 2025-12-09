import express from 'express';
import { createCheckoutSession, handleWebhook } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-checkout-session', authenticate, createCheckoutSession);

export default router;
