import Seller from '../models/Seller.js';
import Deliverer from '../models/Deliverer.js';

export const approveSeller = async (req, res, next) => {
  try {
    const seller = await Seller.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        error: 'Seller not found'
      });
    }

    seller.status = 'approved';
    seller.verifiedAt = new Date();
    seller.reason = undefined;
    await seller.save();

    res.json({
      success: true,
      data: seller
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
        error: 'Seller not found'
      });
    }

    seller.status = 'rejected';
    seller.reason = reason || 'Rejected by admin';
    await seller.save();

    res.json({
      success: true,
      data: seller
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
        error: 'Deliverer not found'
      });
    }

    deliverer.status = 'approved';
    deliverer.verifiedAt = new Date();
    deliverer.reason = undefined;
    await deliverer.save();

    res.json({
      success: true,
      data: deliverer
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
        error: 'Deliverer not found'
      });
    }

    deliverer.status = 'rejected';
    deliverer.reason = reason || 'Rejected by admin';
    await deliverer.save();

    res.json({
      success: true,
      data: deliverer
    });
  } catch (error) {
    next(error);
  }
};

