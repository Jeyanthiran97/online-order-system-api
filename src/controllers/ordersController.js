import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Seller from '../models/Seller.js';
import Delivery from '../models/Delivery.js';

export const createOrder = async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Products array is required'
      });
    }

    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found'
      });
    }

    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      customerId: customer._id,
      products: orderProducts,
      totalPrice
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('products.productId', 'name description price')
      .populate('customerId', 'fullName phone address');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    let orders;

    if (req.user.role === 'customer') {
      const customer = await Customer.findOne({ userId: req.user._id });
      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer profile not found'
        });
      }
      orders = await Order.find({ customerId: customer._id })
        .populate('products.productId', 'name description price')
        .populate('assignedDelivererId', 'fullName')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'seller') {
      const seller = await Seller.findOne({ userId: req.user._id });
      if (!seller) {
        return res.status(404).json({
          success: false,
          error: 'Seller profile not found'
        });
      }

      const sellerProducts = await Product.find({ sellerId: seller._id }).select('_id');
      const productIds = sellerProducts.map(p => p._id);

      orders = await Order.find({
        'products.productId': { $in: productIds }
      })
        .populate('products.productId', 'name description price')
        .populate('customerId', 'fullName phone address')
        .populate('assignedDelivererId', 'fullName')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'deliverer') {
      const deliverer = await Deliverer.findOne({ userId: req.user._id });
      if (!deliverer) {
        return res.status(404).json({
          success: false,
          error: 'Deliverer profile not found'
        });
      }

      const deliveries = await Delivery.find({ delivererId: deliverer._id }).select('orderId');
      const orderIds = deliveries.map(d => d.orderId);

      orders = await Order.find({ _id: { $in: orderIds } })
        .populate('products.productId', 'name description price')
        .populate('customerId', 'fullName phone address')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { status, assignedDelivererId } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (req.user.role === 'customer') {
      if (order.status === 'pending' && status === 'cancelled') {
        const customer = await Customer.findById(order.customerId);
        if (customer.userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to cancel this order'
          });
        }

        for (const item of order.products) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }

        order.status = 'cancelled';
        await order.save();

        return res.json({
          success: true,
          data: order
        });
      } else {
        return res.status(403).json({
          success: false,
          error: 'Customers can only cancel pending orders'
        });
      }
    }

    if (req.user.role === 'seller' || req.user.role === 'admin') {
      if (status === 'confirmed' && order.status === 'pending') {
        order.status = 'confirmed';
        await order.save();

        return res.json({
          success: true,
          data: order
        });
      }
    }

    if (req.user.role === 'admin') {
      if (status && ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        order.status = status;
        
        if (assignedDelivererId && !order.assignedDelivererId) {
          const Deliverer = (await import('../models/Deliverer.js')).default;
          const deliverer = await Deliverer.findById(assignedDelivererId);
          
          if (!deliverer || deliverer.status !== 'approved') {
            return res.status(400).json({
              success: false,
              error: 'Invalid or unapproved deliverer'
            });
          }
          
          order.assignedDelivererId = assignedDelivererId;
          
          const existingDelivery = await Delivery.findOne({ orderId: order._id });
          if (!existingDelivery) {
            await Delivery.create({
              orderId: order._id,
              delivererId: assignedDelivererId,
              status: 'pending'
            });
          }
        }
        
        await order.save();

        const populatedOrder = await Order.findById(order._id)
          .populate('products.productId', 'name description price')
          .populate('customerId', 'fullName phone address')
          .populate('assignedDelivererId', 'fullName');

        return res.json({
          success: true,
          data: populatedOrder
        });
      }
    }

    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this order'
    });
  } catch (error) {
    next(error);
  }
};

