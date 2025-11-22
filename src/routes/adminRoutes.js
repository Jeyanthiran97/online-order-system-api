import express from 'express';
import {
  approveSeller,
  rejectSeller,
  approveDeliverer,
  rejectDeliverer
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.patch('/sellers/:id/approve', authenticate, requireRole('admin'), approveSeller);
router.patch('/sellers/:id/reject', authenticate, requireRole('admin'), rejectSeller);
router.patch('/deliverers/:id/approve', authenticate, requireRole('admin'), approveDeliverer);
router.patch('/deliverers/:id/reject', authenticate, requireRole('admin'), rejectDeliverer);

export default router;

