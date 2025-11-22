import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, approvalStatus } = req.query;
    const filter = {};

    // Filter by user role
    if (role) filter.role = role;

    // Filter by user status (active/inactive)
    if (status) filter.status = status;

    // Get all users matching the filter
    let users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    // Get profiles for all users
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

    // Apply approval status filter if provided
    let filteredUsers = usersWithProfiles;
    if (approvalStatus) {
      if (approvalStatus === "pending") {
        // Filter for sellers/deliverers with pending status
        filteredUsers = usersWithProfiles.filter((item) => {
          if (item.user.role === "seller" || item.user.role === "deliverer") {
            return item.profile && item.profile.status === "pending";
          }
          return false;
        });
      } else if (approvalStatus === "approved") {
        // Filter for sellers/deliverers with approved status
        filteredUsers = usersWithProfiles.filter((item) => {
          if (item.user.role === "seller" || item.user.role === "deliverer") {
            return item.profile && item.profile.status === "approved";
          }
          return false;
        });
      } else if (approvalStatus === "rejected") {
        // Filter for sellers/deliverers with rejected status
        filteredUsers = usersWithProfiles.filter((item) => {
          if (item.user.role === "seller" || item.user.role === "deliverer") {
            return item.profile && item.profile.status === "rejected";
          }
          return false;
        });
      }
    }

    res.json({
      success: true,
      count: filteredUsers.length,
      data: filteredUsers,
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
