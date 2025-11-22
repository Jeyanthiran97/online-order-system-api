import express from "express";
import {
  getMe,
  updateMe,
} from "../controllers/usersController.js";
import {
  getAllUsers,
  getUserById,
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// User profile routes (authenticated users)
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);

// Admin only routes
router.get("/", authenticate, requireRole("admin"), getAllUsers);
router.get("/:id", authenticate, requireRole("admin"), getUserById);

export default router;

