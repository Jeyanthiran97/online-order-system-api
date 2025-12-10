import express from "express";
import {
  getAllUsers,
  getUserById,
} from "../controllers/usersController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

import {
  addAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

// Address management routes
router.post("/address", authenticate, addAddress);
router.get("/address", authenticate, getAddresses);
router.put("/address/:addressId", authenticate, updateAddress);
router.delete("/address/:addressId", authenticate, deleteAddress);
router.patch("/address/:addressId/default", authenticate, setDefaultAddress);

// Admin only routes - User management with filtering
router.get("/", authenticate, requireRole("admin"), getAllUsers);
router.get("/:id", authenticate, requireRole("admin"), getUserById);

export default router;

