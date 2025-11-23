import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwtConfig.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";

const generateToken = userId => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const registerCustomer = async (req, res, next) => {
  try {
    const { email, password, fullName, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const user = await User.create({
      email,
      password,
      role: "customer",
    });

    await Customer.create({
      userId: user._id,
      fullName,
      phone,
      address,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerSeller = async (req, res, next) => {
  try {
    const { email, password, shopName, documents } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingSeller = await Seller.findOne({ userId: existingUser._id });
      if (existingSeller && existingSeller.status === "pending") {
        return res.status(400).json({
          success: false,
          error: "Seller registration already pending",
        });
      }
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const user = await User.create({
      email,
      password,
      role: "seller",
    });

    await Seller.create({
      userId: user._id,
      shopName,
      documents: documents || [],
    });

    res.status(201).json({
      success: true,
      message: "Seller registration submitted. Waiting for admin approval.",
    });
  } catch (error) {
    next(error);
  }
};

export const registerDeliverer = async (req, res, next) => {
  try {
    const { email, password, fullName, licenseNumber, NIC } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingDeliverer = await Deliverer.findOne({
        userId: existingUser._id,
      });
      if (existingDeliverer && existingDeliverer.status === "pending") {
        return res.status(400).json({
          success: false,
          error: "Deliverer registration already pending",
        });
      }
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    const user = await User.create({
      email,
      password,
      role: "deliverer",
    });

    await Deliverer.create({
      userId: user._id,
      fullName,
      licenseNumber,
      NIC,
    });

    res.status(201).json({
      success: true,
      message: "Deliverer registration submitted. Waiting for admin approval.",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: "Account is inactive",
      });
    }

    if (user.role === "seller") {
      const seller = await Seller.findOne({ userId: user._id });
      if (seller && seller.status !== "approved") {
        return res.status(403).json({
          success: false,
          error: "Seller account not approved",
        });
      }
    }

    if (user.role === "deliverer") {
      const deliverer = await Deliverer.findOne({ userId: user._id });
      if (deliverer && deliverer.status !== "approved") {
        return res.status(403).json({
          success: false,
          error: "Deliverer account not approved",
        });
      }
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
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
        },
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = req.user;
    const updateData = req.body;

    if (user.role === "customer") {
      const customer = await Customer.findOne({ userId: user._id });
      if (customer) {
        Object.assign(customer, updateData);
        await customer.save();
      } else {
        return res.status(404).json({
          success: false,
          error: "Customer profile not found",
        });
      }
    } else if (user.role === "seller") {
      const seller = await Seller.findOne({ userId: user._id });
      if (seller) {
        if (updateData.shopName) seller.shopName = updateData.shopName;
        if (updateData.documents) seller.documents = updateData.documents;
        await seller.save();
      } else {
        return res.status(404).json({
          success: false,
          error: "Seller profile not found",
        });
      }
    } else if (user.role === "deliverer") {
      const deliverer = await Deliverer.findOne({ userId: user._id });
      if (deliverer) {
        if (updateData.fullName) deliverer.fullName = updateData.fullName;
        if (updateData.licenseNumber)
          deliverer.licenseNumber = updateData.licenseNumber;
        if (updateData.NIC) deliverer.NIC = updateData.NIC;
        await deliverer.save();
      } else {
        return res.status(404).json({
          success: false,
          error: "Deliverer profile not found",
        });
      }
    }

    const updatedProfile =
      user.role === "customer"
        ? await Customer.findOne({ userId: user._id })
        : user.role === "seller"
        ? await Seller.findOne({ userId: user._id })
        : await Deliverer.findOne({ userId: user._id });

    res.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};
