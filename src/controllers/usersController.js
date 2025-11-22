import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";

const buildSortQuery = (sortParam) => {
  if (!sortParam) return { createdAt: -1 };

  const sortFields = {};
  const fields = sortParam.split(",");

  fields.forEach((field) => {
    const trimmedField = field.trim();
    if (trimmedField.startsWith("-")) {
      sortFields[trimmedField.substring(1)] = -1;
    } else {
      sortFields[trimmedField] = 1;
    }
  });

  return sortFields;
};

/**
 * Optional: Global aggregated overview for admin dashboards
 * Returns all users with their profiles aggregated together
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, approvalStatus, search, sort } = req.query;
    const filter = {};

    // Filter by user role
    if (role) {
      filter.role = role;
    }

    // Filter by user active status
    if (isActive !== undefined) {
      filter.isActive = isActive === "true" || isActive === true;
    }

    // Search filter (by email)
    if (search) {
      filter.email = { $regex: search, $options: "i" };
    }

    // Build sort query
    const sortQuery = buildSortQuery(sort);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get all users matching the filter
    const total = await User.countDocuments(filter);
    let users = await User.find(filter)
      .select("-password")
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

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
            isActive: user.isActive,
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
      filteredUsers = usersWithProfiles.filter((item) => {
        return item.profile && item.profile.approvalStatus === approvalStatus;
      });
    }

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: filteredUsers.length,
      total,
      totalPages,
      currentPage: page,
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
          isActive: user.isActive,
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
