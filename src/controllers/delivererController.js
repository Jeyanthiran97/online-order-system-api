import Deliverer from "../models/Deliverer.js";
import User from "../models/User.js";

export const getAllDeliverers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const deliverers = await Deliverer.find(filter)
      .populate("userId", "email role status createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: deliverers.length,
      data: deliverers,
    });
  } catch (error) {
    next(error);
  }
};

export const getDelivererById = async (req, res, next) => {
  try {
    const deliverer = await Deliverer.findById(req.params.id).populate(
      "userId",
      "email role status createdAt"
    );

    if (!deliverer) {
      return res.status(404).json({
        success: false,
        error: "Deliverer not found",
      });
    }

    res.json({
      success: true,
      data: deliverer,
    });
  } catch (error) {
    next(error);
  }
};

