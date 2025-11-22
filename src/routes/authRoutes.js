import express from "express";
import {
  registerCustomer,
  registerSeller,
  registerDeliverer,
  login,
  getMe,
  updateMe,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Registration routes
router.post("/register/customer", registerCustomer);
router.post("/register/seller", registerSeller);
router.post("/register/deliverer", registerDeliverer);

// Authentication routes
router.post("/login", login);

// Authenticated user routes
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);

export default router;

