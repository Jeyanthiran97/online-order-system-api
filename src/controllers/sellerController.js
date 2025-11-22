import Seller from "../models/Seller.js";
import User from "../models/User.js";

const buildSortQuery = (sortParam) => {
  if (!sortParam) return { updatedAt: -1 };

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

export const getAllSellers = async (req, res, next) => {
  try {
    const { approvalStatus, isActive, search, sort } = req.query;
    const filter = {};

    // Filter by approval status
    if (approvalStatus) {
      filter.approvalStatus = approvalStatus;
    }

    // Filter by user active status (via populate filter)
    let userFilter = {};
    if (isActive !== undefined) {
      userFilter.isActive = isActive === "true" || isActive === true;
    }

    // Search filter (by shopName)
    if (search) {
      filter.shopName = { $regex: search, $options: "i" };
    }

    // Build sort query
    const sortQuery = buildSortQuery(sort);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Seller.countDocuments(filter);

    // Get sellers with pagination
    let query = Seller.find(filter)
      .populate({
        path: "userId",
        match: Object.keys(userFilter).length > 0 ? userFilter : undefined,
        select: "email role isActive createdAt",
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const sellers = await query;

    // Filter out null userIds (when user filter doesn't match)
    const filteredSellers = sellers.filter((s) => s.userId !== null);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: filteredSellers.length,
      total,
      totalPages,
      currentPage: page,
      data: filteredSellers,
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
