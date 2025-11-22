import Analytics from '../models/Analytics.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Seller from '../models/Seller.js';

export const getAnalytics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'delivered' });
    
    const totalSales = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const salesBySeller = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.sellerId',
          totalSales: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
        }
      },
      {
        $lookup: {
          from: 'sellers',
          localField: '_id',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' },
      {
        $project: {
          sellerId: '$_id',
          shopName: '$seller.shopName',
          totalSales: 1,
          _id: 0
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    const analytics = {
      totalOrders,
      completedOrders,
      totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
      salesBySeller
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

