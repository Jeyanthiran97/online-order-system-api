import express from "express";
import {
  getAllDeliverers,
  getDelivererById,
  approveDeliverer,
  rejectDeliverer,
} from "../controllers/delivererController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin only routes
router.get("/", authenticate, requireRole("admin"), getAllDeliverers);
router.get("/:id", authenticate, requireRole("admin"), getDelivererById);

// Approval workflow routes
router.patch("/:id/approve", authenticate, requireRole("admin"), approveDeliverer);
router.patch("/:id/reject", authenticate, requireRole("admin"), rejectDeliverer);

export default router;

