import express from 'express';
import {
  getMe,
  updateMe
} from '../controllers/usersController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);

export default router;

