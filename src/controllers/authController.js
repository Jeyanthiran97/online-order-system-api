import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwtConfig.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Seller from '../models/Seller.js';
import Deliverer from '../models/Deliverer.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const registerCustomer = async (req, res, next) => {
  try {
    const { email, password, fullName, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    const user = await User.create({
      email,
      password,
      role: 'customer'
    });

    await Customer.create({
      userId: user._id,
      fullName,
      phone,
      address
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      }
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
      if (existingSeller && existingSeller.status === 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Seller registration already pending'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    const user = await User.create({
      email,
      password,
      role: 'seller'
    });

    await Seller.create({
      userId: user._id,
      shopName,
      documents: documents || []
    });

    res.status(201).json({
      success: true,
      message: 'Seller registration submitted. Waiting for admin approval.'
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
      const existingDeliverer = await Deliverer.findOne({ userId: existingUser._id });
      if (existingDeliverer && existingDeliverer.status === 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Deliverer registration already pending'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    const user = await User.create({
      email,
      password,
      role: 'deliverer'
    });

    await Deliverer.create({
      userId: user._id,
      fullName,
      licenseNumber,
      NIC
    });

    res.status(201).json({
      success: true,
      message: 'Deliverer registration submitted. Waiting for admin approval.'
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
        error: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive'
      });
    }

    if (user.role === 'seller') {
      const seller = await Seller.findOne({ userId: user._id });
      if (seller && seller.status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: 'Seller account not approved'
        });
      }
    }

    if (user.role === 'deliverer') {
      const deliverer = await Deliverer.findOne({ userId: user._id });
      if (deliverer && deliverer.status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: 'Deliverer account not approved'
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
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

