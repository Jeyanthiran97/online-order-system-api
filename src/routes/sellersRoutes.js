import express from "express";
import {
  getAllSellers,
  getSellerById,
  approveSeller,
  rejectSeller,
} from "../controllers/sellerController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin only routes
// GET /sellers?approvalStatus=pending&isActive=true&search=shop&sort=-createdAt&page=1&limit=20
router.get("/", authenticate, requireRole("admin"), getAllSellers);
router.get("/:id", authenticate, requireRole("admin"), getSellerById);

// Approval workflow routes
router.patch("/:id/approve", authenticate, requireRole("admin"), approveSeller);
router.patch("/:id/reject", authenticate, requireRole("admin"), rejectSeller);

export default router;

