import Deliverer from "../models/Deliverer.js";
import User from "../models/User.js";

const buildSortQuery = sortParam => {
  if (!sortParam) return { updatedAt: -1 };

  const sortFields = {};
  const fields = sortParam.split(",");

  fields.forEach(field => {
    const trimmedField = field.trim();
    if (trimmedField.startsWith("-")) {
      sortFields[trimmedField.substring(1)] = -1;
    } else {
      sortFields[trimmedField] = 1;
    }
  });

  return sortFields;
};

export const getAllDeliverers = async (req, res, next) => {
  try {
    const { status, isActive, search, sort } = req.query;
    const filter = {};

    // Filter by approval status
    if (status) {
      filter.status = status;
    }

    // Filter by user active status (via populate filter)
    let userFilter = {};
    if (isActive !== undefined) {
      userFilter.isActive = isActive === "true" || isActive === true;
    }

    // Search filter (by fullName, licenseNumber, NIC)
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { licenseNumber: { $regex: search, $options: "i" } },
        { NIC: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort query
    const sortQuery = buildSortQuery(sort);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Deliverer.countDocuments(filter);

    // Get deliverers with pagination
    let query = Deliverer.find(filter)
      .populate({
        path: "userId",
        match: Object.keys(userFilter).length > 0 ? userFilter : undefined,
        select: "email role isActive createdAt",
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const deliverers = await query;

    // Filter out null userIds (when user filter doesn't match)
    const filteredDeliverers = deliverers.filter(d => d.userId !== null);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: filteredDeliverers.length,
      total,
      totalPages,
      currentPage: page,
      data: filteredDeliverers,
    });
  } catch (error) {
    next(error);
  }
};

export const getDelivererById = async (req, res, next) => {
  try {
    const deliverer = await Deliverer.findById(req.params.id).populate(
      "userId",
      "email role isActive createdAt"
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
      "email role isActive createdAt"
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
      "email role isActive createdAt"
    );

    res.json({
      success: true,
      data: populatedDeliverer,
    });
  } catch (error) {
    next(error);
  }
};
