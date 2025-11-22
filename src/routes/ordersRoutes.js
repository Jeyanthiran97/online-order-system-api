import express from 'express';
import {
  createOrder,
  getOrders,
  updateOrder
} from '../controllers/ordersController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authenticate, requireRole('customer'), createOrder);
router.get('/', authenticate, getOrders);
router.patch('/:id', authenticate, updateOrder);

export default router;

