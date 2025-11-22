import Seller from "../models/Seller.js";
import User from "../models/User.js";

export const getAllSellers = async (req, res, next) => {
  try {
    const { approvalStatus } = req.query;
    const filter = approvalStatus ? { approvalStatus } : {};

    const sellers = await Seller.find(filter)
      .populate("userId", "email role isActive createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sellers.length,
      data: sellers,
    });
  } catch (error) {
    next(error);
  }
};

export const getSellerById = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id).populate(
      "userId",
      "email role isActive createdAt"
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    res.json({
      success: true,
      data: seller,
    });
  } catch (error) {
    next(error);
  }
};

export const approveSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    seller.approvalStatus = "approved";
    seller.verifiedAt = new Date();
    seller.reason = undefined;
    await seller.save();

    const populatedSeller = await Seller.findById(seller._id).populate(
      "userId",
      "email role isActive createdAt"
    );

    res.json({
      success: true,
      data: populatedSeller,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectSeller = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    seller.approvalStatus = "rejected";
    seller.reason = reason || "Rejected by admin";
    await seller.save();

    const populatedSeller = await Seller.findById(seller._id).populate(
      "userId",
      "email role isActive createdAt"
    );

    res.json({
      success: true,
      data: populatedSeller,
    });
  } catch (error) {
    next(error);
  }
};
