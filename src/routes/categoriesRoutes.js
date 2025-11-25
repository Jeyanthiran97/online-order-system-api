import express from 'express';
import {
  getCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoriesController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { authOptional } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - get active categories
router.get('/public', authOptional, getCategories);

// Admin routes
router.get('/', authenticate, requireRole('admin'), getAllCategories);
router.get('/:id', authenticate, requireRole('admin'), getCategoryById);
router.post('/', authenticate, requireRole('admin'), createCategory);
router.patch('/:id', authenticate, requireRole('admin'), updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), deleteCategory);

export default router;

