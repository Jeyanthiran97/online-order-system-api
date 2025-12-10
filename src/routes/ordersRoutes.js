import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder
} from '../controllers/ordersController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authenticate, requireRole('customer'), createOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrder);
router.patch('/:id', authenticate, updateOrder);

export default router;

