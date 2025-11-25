import express from "express";
import authRoutes from "./authRoutes.js";
import productsRoutes from "./productsRoutes.js";
import ordersRoutes from "./ordersRoutes.js";
import deliveriesRoutes from "./deliveriesRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import usersRoutes from "./usersRoutes.js";
import customersRoutes from "./customersRoutes.js";
import sellersRoutes from "./sellersRoutes.js";
import deliverersRoutes from "./deliverersRoutes.js";
import categoriesRoutes from "./categoriesRoutes.js";

const router = express.Router();

// Auth routes
router.use("/auth", authRoutes);

// Product routes
router.use("/products", productsRoutes);

// Order routes
router.use("/orders", ordersRoutes);

// Delivery routes
router.use("/deliveries", deliveriesRoutes);

// User routes
router.use("/users", usersRoutes);

// Customer routes (admin only)
router.use("/customers", customersRoutes);

// Seller routes (admin only)
router.use("/sellers", sellersRoutes);

// Deliverer routes (admin only)
router.use("/deliverers", deliverersRoutes);

// Analytics routes (admin only)
router.use("/analytics", analyticsRoutes);

// Category routes
router.use("/categories", categoriesRoutes);

export default router;

