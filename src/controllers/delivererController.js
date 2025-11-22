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

export const approveDeliverer = async (req, res, next) => {
  try {
    const deliverer = await Deliverer.findById(req.params.id);

    if (!deliverer) {
      return res.status(404).json({
        success: false,
        error: "Deliverer not found",
      });
    }

    deliverer.status = "approved";
    deliverer.verifiedAt = new Date();
    deliverer.reason = undefined;
    await deliverer.save();

    const populatedDeliverer = await Deliverer.findById(deliverer._id).populate(
      "userId",
      "email role status createdAt"
    );

    res.json({
      success: true,
      data: populatedDeliverer,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectDeliverer = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const deliverer = await Deliverer.findById(req.params.id);

    if (!deliverer) {
      return res.status(404).json({
        success: false,
        error: "Deliverer not found",
      });
    }

    deliverer.status = "rejected";
    deliverer.reason = reason || "Rejected by admin";
    await deliverer.save();

    const populatedDeliverer = await Deliverer.findById(deliverer._id).populate(
      "userId",
      "email role status createdAt"
    );

    res.json({
      success: true,
      data: populatedDeliverer,
    });
  } catch (error) {
    next(error);
  }
};

