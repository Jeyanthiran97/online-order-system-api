import express from "express";
import {
  getAllCustomers,
  getCustomerById,
} from "../controllers/customerController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin only routes
router.get("/", authenticate, requireRole("admin"), getAllCustomers);
router.get("/:id", authenticate, requireRole("admin"), getCustomerById);

export default router;

