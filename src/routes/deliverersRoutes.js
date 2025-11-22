import express from "express";
import {
  getAllDeliverers,
  getDelivererById,
} from "../controllers/delivererController.js";
import {
  approveDeliverer,
  rejectDeliverer,
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin only routes
router.get("/", authenticate, requireRole("admin"), getAllDeliverers);
router.get("/:id", authenticate, requireRole("admin"), getDelivererById);
router.patch("/:id/approve", authenticate, requireRole("admin"), approveDeliverer);
router.patch("/:id/reject", authenticate, requireRole("admin"), rejectDeliverer);

export default router;

