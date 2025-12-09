import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All cart routes require customer authentication
router.use(authenticate);
router.use(requireRole('customer'));

router.get('/', getCart);
router.post('/items', addToCart);
router.patch('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeFromCart);
router.delete('/clear', clearCart);

export default router;

