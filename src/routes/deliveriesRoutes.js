import express from 'express';
import {
  getDeliveries,
  updateDelivery
} from '../controllers/deliveriesController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireApprovedDeliverer } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', authenticate, requireApprovedDeliverer, getDeliveries);
router.patch('/:id', authenticate, requireApprovedDeliverer, updateDelivery);

export default router;

