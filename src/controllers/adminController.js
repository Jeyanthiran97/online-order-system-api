import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";

export const approveSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: "Seller not found",
      });
    }

    seller.status = "approved";
    seller.verifiedAt = new Date();
    seller.reason = undefined;
    await seller.save();

    res.json({
      success: true,
      data: seller,
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

    seller.status = "rejected";
    seller.reason = reason || "Rejected by admin";
    await seller.save();

    res.json({
      success: true,
      data: seller,
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

    res.json({
      success: true,
      data: deliverer,
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

    res.json({
      success: true,
      data: deliverer,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profile = null;

        if (user.role === "customer") {
          profile = await Customer.findOne({ userId: user._id });
        } else if (user.role === "seller") {
          profile = await Seller.findOne({ userId: user._id });
        } else if (user.role === "deliverer") {
          profile = await Deliverer.findOne({ userId: user._id });
        }

        return {
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          profile,
        };
      })
    );

    res.json({
      success: true,
      count: usersWithProfiles.length,
      data: usersWithProfiles,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    let profile = null;

    if (user.role === "customer") {
      profile = await Customer.findOne({ userId: user._id });
    } else if (user.role === "seller") {
      profile = await Seller.findOne({ userId: user._id });
    } else if (user.role === "deliverer") {
      profile = await Deliverer.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};


