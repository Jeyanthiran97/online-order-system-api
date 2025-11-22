import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productsController.js';
import { authenticate, authOptional } from '../middleware/authMiddleware.js';
import { requireApprovedSeller } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', authenticate, requireApprovedSeller, createProduct);
router.get('/', authOptional, getProducts);
router.get('/:id', authOptional, getProductById);
router.patch('/:id', authenticate, requireApprovedSeller, updateProduct);
router.delete('/:id', authenticate, requireApprovedSeller, deleteProduct);

export default router;

