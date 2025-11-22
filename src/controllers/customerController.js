import Customer from "../models/Customer.js";
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

export const getAllCustomers = async (req, res, next) => {
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

    // Search filter (by fullName, phone, address)
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort query
    const sortQuery = buildSortQuery(sort);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Customer.countDocuments(filter);

    // Get customers with pagination
    let query = Customer.find(filter)
      .populate({
        path: "userId",
        match: Object.keys(userFilter).length > 0 ? userFilter : undefined,
        select: "email role isActive createdAt",
      })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const customers = await query;

    // Filter out null userIds (when user filter doesn't match)
    const filteredCustomers = customers.filter((c) => c.userId !== null);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: filteredCustomers.length,
      total,
      totalPages,
      currentPage: page,
      data: filteredCustomers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "userId",
      "email role isActive createdAt"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};
