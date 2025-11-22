import Seller from "../models/Seller.js";
import User from "../models/User.js";

export const getAllSellers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const sellers = await Seller.find(filter)
      .populate("userId", "email role status createdAt")
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
      "email role status createdAt"
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

