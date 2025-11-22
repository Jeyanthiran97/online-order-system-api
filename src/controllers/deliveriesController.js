import Delivery from '../models/Delivery.js';
import Order from '../models/Order.js';
import Deliverer from '../models/Deliverer.js';

export const getDeliveries = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find({ delivererId: req.deliverer._id })
      .populate('orderId', 'totalPrice status products customerId')
      .populate({
        path: 'orderId',
        populate: {
          path: 'customerId',
          select: 'fullName phone address'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    next(error);
  }
};

export const updateDelivery = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in-transit', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid delivery status'
      });
    }

    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        error: 'Delivery not found'
      });
    }

    if (delivery.delivererId.toString() !== req.deliverer._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this delivery'
      });
    }

    delivery.status = status;
    if (status === 'delivered') {
      delivery.deliveryTime = new Date();

      const order = await Order.findById(delivery.orderId);
      if (order) {
        order.status = 'delivered';
        await order.save();
      }
    }

    await delivery.save();

    res.json({
      success: true,
      data: delivery
    });
  } catch (error) {
    next(error);
  }
};

