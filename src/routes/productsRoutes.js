import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productsController.js';
import { authenticate, authOptional } from '../middleware/authMiddleware.js';
import { requireApprovedSeller, requireAdminOrApprovedSeller } from '../middleware/roleMiddleware.js';
import { uploadProductImages, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', authenticate, requireApprovedSeller, uploadProductImages, handleUploadError, createProduct);
router.get('/', authOptional, getProducts);
router.get('/:id', authOptional, getProductById);
router.patch('/:id', authenticate, requireAdminOrApprovedSeller, uploadProductImages, handleUploadError, updateProduct);
router.delete('/:id', authenticate, requireAdminOrApprovedSeller, deleteProduct);

export default router;

