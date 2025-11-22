import express from "express";
import {
  getAllSellers,
  getSellerById,
} from "../controllers/sellerController.js";
import {
  approveSeller,
  rejectSeller,
} from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin only routes
router.get("/", authenticate, requireRole("admin"), getAllSellers);
router.get("/:id", authenticate, requireRole("admin"), getSellerById);
router.patch("/:id/approve", authenticate, requireRole("admin"), approveSeller);
router.patch("/:id/reject", authenticate, requireRole("admin"), rejectSeller);

export default router;

