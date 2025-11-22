import express from "express";
import {
  getAllUsers,
  getUserById,
} from "../controllers/usersController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin only routes - User management with filtering
router.get("/", authenticate, requireRole("admin"), getAllUsers);
router.get("/:id", authenticate, requireRole("admin"), getUserById);

export default router;

