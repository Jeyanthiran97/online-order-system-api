import express from 'express';
import authRoutes from './authRoutes.js';
import productsRoutes from './productsRoutes.js';
import ordersRoutes from './ordersRoutes.js';
import deliveriesRoutes from './deliveriesRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import usersRoutes from './usersRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/deliveries', deliveriesRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/analytics', analyticsRoutes);
router.use('/users', usersRoutes);

export default router;

