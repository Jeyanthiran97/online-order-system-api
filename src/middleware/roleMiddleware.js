export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions'
      });
    }

    next();
  };
};

export const requireApprovedSeller = async (req, res, next) => {
  try {
    if (!req.user.roles.includes('seller')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Seller role required'
      });
    }

    const Seller = (await import('../models/Seller.js')).default;
    const seller = await Seller.findOne({ userId: req.user._id });

    if (!seller || seller.status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'Seller account not approved'
      });
    }

    req.seller = seller;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error checking seller status'
    });
  }
};

export const requireApprovedDeliverer = async (req, res, next) => {
  try {
    if (!req.user.roles.includes('deliverer')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Deliverer role required'
      });
    }

    const Deliverer = (await import('../models/Deliverer.js')).default;
    const deliverer = await Deliverer.findOne({ userId: req.user._id });

    if (!deliverer || deliverer.status !== 'approved') {
      return res.status(403).json({
        success: false,
        error: 'Deliverer account not approved'
      });
    }

    req.deliverer = deliverer;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error checking deliverer status'
    });
  }
};

