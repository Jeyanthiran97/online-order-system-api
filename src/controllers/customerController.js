import Customer from "../models/Customer.js";
import User from "../models/User.js";

export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find()
      .populate("userId", "email role status createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "userId",
      "email role status createdAt"
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

