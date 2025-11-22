import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Seller from '../models/Seller.js';
import Deliverer from '../models/Deliverer.js';

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.roles.includes('customer')) {
      profile = await Customer.findOne({ userId: user._id });
    } else if (user.roles.includes('seller')) {
      profile = await Seller.findOne({ userId: user._id });
    } else if (user.roles.includes('deliverer')) {
      profile = await Deliverer.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          roles: user.roles,
          status: user.status
        },
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = req.user;
    const updateData = req.body;

    if (user.roles.includes('customer')) {
      const customer = await Customer.findOne({ userId: user._id });
      if (customer) {
        Object.assign(customer, updateData);
        await customer.save();
      } else {
        return res.status(404).json({
          success: false,
          error: 'Customer profile not found'
        });
      }
    } else if (user.roles.includes('seller')) {
      const seller = await Seller.findOne({ userId: user._id });
      if (seller) {
        if (updateData.shopName) seller.shopName = updateData.shopName;
        if (updateData.documents) seller.documents = updateData.documents;
        await seller.save();
      } else {
        return res.status(404).json({
          success: false,
          error: 'Seller profile not found'
        });
      }
    } else if (user.roles.includes('deliverer')) {
      const deliverer = await Deliverer.findOne({ userId: user._id });
      if (deliverer) {
        if (updateData.fullName) deliverer.fullName = updateData.fullName;
        if (updateData.licenseNumber) deliverer.licenseNumber = updateData.licenseNumber;
        if (updateData.NIC) deliverer.NIC = updateData.NIC;
        await deliverer.save();
      } else {
        return res.status(404).json({
          success: false,
          error: 'Deliverer profile not found'
        });
      }
    }

    const updatedProfile = user.roles.includes('customer')
      ? await Customer.findOne({ userId: user._id })
      : user.roles.includes('seller')
      ? await Seller.findOne({ userId: user._id })
      : await Deliverer.findOne({ userId: user._id });

    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

