import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";
import Delivery from "../models/Delivery.js";
import Cart from "../models/Cart.js";
import Payment from "../models/Payment.js";

export const createOrder = async (req, res, next) => {
  try {
    const { products, paymentMethod = 'dummy', fromCart = false } = req.body;

    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: "Customer profile not found",
      });
    }

    let orderProducts = [];
    let totalPrice = 0;

    // If creating from cart, get items from cart
    if (fromCart) {
      const cart = await Cart.findOne({ customerId: customer._id })
        .populate('items.productId');
      
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Cart is empty",
        });
      }

      // Convert cart items to order products
      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            error: `Product ${cartItem.productId} not found`,
          });
        }

        // Verify product belongs to an approved seller
        const seller = await Seller.findById(product.sellerId);
        if (!seller || seller.status !== "approved") {
          return res.status(400).json({
            success: false,
            error: `Product ${product.name} is not available (seller not approved)`,
          });
        }

        if (product.stock < cartItem.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
          });
        }

        orderProducts.push({
          productId: product._id,
          quantity: cartItem.quantity,
          price: product.price,
        });

        totalPrice += product.price * cartItem.quantity;
      }
    } else {
      // Create order from provided products array
      if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Products array is required",
        });
      }

      for (const item of products) {
        if (!item.productId || !item.quantity || item.quantity < 1) {
          return res.status(400).json({
            success: false,
            error: "Each product must have a valid productId and quantity (min: 1)",
          });
        }

        const product = await Product.findById(item.productId).populate("sellerId");
        if (!product) {
          return res.status(404).json({
            success: false,
            error: `Product ${item.productId} not found`,
          });
        }

        // Verify product belongs to an approved seller
        const seller = await Seller.findById(product.sellerId);
        if (!seller || seller.status !== "approved") {
          return res.status(400).json({
            success: false,
            error: `Product ${product.name} is not available (seller not approved)`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            error: `Insufficient stock for product ${product.name}. Available: ${product.stock}`,
          });
        }

        const itemTotal = product.price * item.quantity;
        totalPrice += itemTotal;

        orderProducts.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price,
        });
      }
    }

    // Create order
    const order = await Order.create({
      customerId: customer._id,
      products: orderProducts,
      totalPrice,
    });

    // Process payment (dummy payment - always succeeds)
    const payment = await Payment.create({
      orderId: order._id,
      customerId: customer._id,
      amount: totalPrice,
      paymentMethod: paymentMethod || 'dummy',
      paymentStatus: 'completed',
      paymentDate: new Date(),
    });

    // Decrement stock for all products
    for (const item of orderProducts) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Clear cart if order was created from cart
    if (fromCart) {
      const cart = await Cart.findOne({ customerId: customer._id });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate("products.productId", "name description price")
      .populate("customerId", "fullName phone address");

    res.status(201).json({
      success: true,
      data: {
        ...populatedOrder.toObject(),
        payment: {
          transactionId: payment.transactionId,
          paymentStatus: payment.paymentStatus,
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const buildOrderQuery = async req => {
  const {
    status,
    customerId,
    sellerId,
    minTotalPrice,
    maxTotalPrice,
    startDate,
    endDate,
    search,
  } = req.query;

  let filter = {};

  // Role-based filtering
  if (req.user) {
    if (req.user.role === "customer") {
      // Customers only see their own orders
      const customer = await Customer.findOne({ userId: req.user._id });
      if (customer) {
        filter.customerId = customer._id;
      } else {
        // Return empty result if customer profile not found
        filter.customerId = null;
      }
    } else if (req.user.role === "seller") {
      // Sellers see orders containing their products
      const seller = await Seller.findOne({ userId: req.user._id });
      if (seller) {
        const sellerProducts = await Product.find({
          sellerId: seller._id,
        }).select("_id");
        const productIds = sellerProducts.map(p => p._id);
        filter["products.productId"] = { $in: productIds };
      } else {
        // Return empty result if seller profile not found
        filter._id = null;
      }
    } else if (req.user.role === "deliverer") {
      // Deliverers see only assigned orders
      const deliverer = await Deliverer.findOne({ userId: req.user._id });
      if (deliverer) {
        const deliveries = await Delivery.find({
          delivererId: deliverer._id,
        }).select("orderId");
        const orderIds = deliveries.map(d => d.orderId);
        filter._id = { $in: orderIds };
      } else {
        // Return empty result if deliverer profile not found
        filter._id = null;
      }
    }
    // Admin can see all orders (no role-based filter)
  }

  // Status filter
  if (status) {
    const statusArray = Array.isArray(status) ? status : status.split(",");
    if (statusArray.length === 1) {
      filter.status = statusArray[0];
    } else {
      filter.status = { $in: statusArray };
    }
  }

  // Customer ID filter (admin only)
  if (customerId && req.user?.role === "admin") {
    filter.customerId = customerId;
  }

  // Seller ID filter (admin only - orders containing seller's products)
  if (sellerId && req.user?.role === "admin") {
    const sellerProducts = await Product.find({ sellerId }).select("_id");
    const productIds = sellerProducts.map(p => p._id);
    if (productIds.length > 0) {
      filter["products.productId"] = { $in: productIds };
    } else {
      filter._id = null; // No products = no orders
    }
  }

  // Total price range filter
  if (minTotalPrice || maxTotalPrice) {
    filter.totalPrice = {};
    if (minTotalPrice) filter.totalPrice.$gte = Number(minTotalPrice);
    if (maxTotalPrice) filter.totalPrice.$lte = Number(maxTotalPrice);
  }

  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      filter.createdAt.$lte = end;
    }
  }

  // Search by customer name or order ID
  if (search) {
    if (req.user?.role === "admin") {
      // Admin can search by customer name
      const customers = await Customer.find({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      const customerIds = customers.map(c => c._id);
      if (customerIds.length > 0) {
        filter.customerId = { $in: customerIds };
      } else {
        // Also try to search by order ID
        if (mongoose.Types.ObjectId.isValid(search)) {
          filter.$or = [{ _id: search }];
        } else {
          filter._id = null; // No matches
        }
      }
    } else {
      // For non-admin, try order ID search
      if (mongoose.Types.ObjectId.isValid(search)) {
        filter._id = search;
      }
    }
  }

  return filter;
};

const buildSortQuery = sortParam => {
  if (!sortParam) return { updatedAt: -1 };

  const sortFields = {};
  const fields = sortParam.split(",");

  fields.forEach(field => {
    const trimmedField = field.trim();
    if (trimmedField.startsWith("-")) {
      sortFields[trimmedField.substring(1)] = -1;
    } else {
      sortFields[trimmedField] = 1;
    }
  });

  return sortFields;
};

export const getOrders = async (req, res, next) => {
  try {
    const filter = await buildOrderQuery(req);
    const sort = buildSortQuery(req.query.sort);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Order.countDocuments(filter);

    // Determine populate fields based on role
    let populateFields = [
      { path: "products.productId", select: "name description price" },
    ];

    if (req.user?.role === "customer") {
      populateFields.push({ path: "assignedDelivererId", select: "fullName" });
    } else if (req.user?.role === "seller") {
      populateFields.push(
        { path: "customerId", select: "fullName phone address" },
        { path: "assignedDelivererId", select: "fullName" }
      );
    } else if (req.user?.role === "deliverer") {
      populateFields.push({
        path: "customerId",
        select: "fullName phone address",
      });
    } else if (req.user?.role === "admin") {
      populateFields.push(
        { path: "customerId", select: "fullName phone address" },
        { path: "assignedDelivererId", select: "fullName" }
      );
    }

    // Get orders with pagination
    let query = Order.find(filter).sort(sort).skip(skip).limit(limit);

    populateFields.forEach(populate => {
      query = query.populate(populate);
    });

    const orders = await query;

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: orders.length,
      total,
      totalPages,
      currentPage: page,
      data: orders,
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
        error: "Order not found",
      });
    }

    if (req.user.role === "customer") {
      if (order.status === "pending" && status === "cancelled") {
        const customer = await Customer.findById(order.customerId);
        if (customer.userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            error: "Not authorized to cancel this order",
          });
        }

        for (const item of order.products) {
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }

        order.status = "cancelled";
        await order.save();

        return res.json({
          success: true,
          data: order,
        });
      } else {
        return res.status(403).json({
          success: false,
          error: "Customers can only cancel pending orders",
        });
      }
    }

    if (req.user.role === "seller") {
      // Sellers can only confirm pending orders containing their products
      if (status === "confirmed" && order.status === "pending") {
        // Verify seller owns at least one product in the order
        const seller = await Seller.findOne({ userId: req.user._id });
        if (!seller || seller.status !== "approved") {
          return res.status(403).json({
            success: false,
            error: "Seller account not approved",
          });
        }

        // Get seller's product IDs
        const sellerProducts = await Product.find({
          sellerId: seller._id,
        }).select("_id");
        const sellerProductIds = sellerProducts.map(p => p._id.toString());

        // Check if order contains at least one of seller's products
        const orderContainsSellerProducts = order.products.some(item =>
          sellerProductIds.includes(item.productId.toString())
        );

        if (!orderContainsSellerProducts) {
          return res.status(403).json({
            success: false,
            error: "Not authorized to confirm this order (order does not contain your products)",
          });
        }

        order.status = "confirmed";
        await order.save();

        const populatedOrder = await Order.findById(order._id)
          .populate("products.productId", "name description price")
          .populate("customerId", "fullName phone address")
          .populate("assignedDelivererId", "fullName");

        return res.json({
          success: true,
          data: populatedOrder,
        });
      }

      return res.status(403).json({
        success: false,
        error: "Sellers can only confirm pending orders containing their products",
      });
    }

    if (req.user.role === "admin") {
      let hasChanges = false;
      let newStatus = order.status;

      // Handle status change
      if (
        status &&
        ["pending", "confirmed", "shipped", "delivered", "cancelled"].includes(
          status
        )
      ) {
        // Validate status transitions
        const validTransitions = {
          pending: ["confirmed", "cancelled"],
          confirmed: ["shipped", "cancelled"],
          shipped: ["delivered", "cancelled"],
          delivered: [], // Final state
          cancelled: [], // Final state
        };

        if (!validTransitions[order.status]?.includes(status)) {
          return res.status(400).json({
            success: false,
            error: `Cannot change order status from ${order.status} to ${status}`,
          });
        }

        newStatus = status;
        hasChanges = true;

        // If cancelling, restore stock
        if (status === "cancelled") {
          for (const item of order.products) {
            const product = await Product.findById(item.productId);
            if (product) {
              product.stock += item.quantity;
              await product.save();
            }
          }
        }

        // If shipping, ensure deliverer is assigned
        if (status === "shipped") {
          if (!order.assignedDelivererId && !assignedDelivererId) {
            return res.status(400).json({
              success: false,
              error: "Cannot ship order without assigned deliverer",
            });
          }
        }
      }

      // Handle deliverer assignment (can be done independently of status change)
      if (assignedDelivererId) {
        // Allow changing deliverer if order is not delivered or cancelled
        if (order.status === "delivered" || order.status === "cancelled") {
          return res.status(400).json({
            success: false,
            error: "Cannot assign deliverer to delivered or cancelled orders",
          });
        }

        const deliverer = await Deliverer.findById(assignedDelivererId);

        if (!deliverer || deliverer.status !== "approved") {
          return res.status(400).json({
            success: false,
            error: "Invalid or unapproved deliverer",
          });
        }

        // Find or create delivery record
        let delivery = await Delivery.findOne({
          orderId: order._id,
        });

        if (delivery) {
          // Update existing delivery with new deliverer
          if (delivery.status === "delivered") {
            return res.status(400).json({
              success: false,
              error: "Cannot change deliverer for already delivered order",
            });
          }
          delivery.delivererId = assignedDelivererId;
          // Update delivery status based on order status
          if (newStatus === "shipped" || order.status === "shipped") {
            delivery.status = "in-transit";
          }
          await delivery.save();
        } else {
          // Create new delivery record
          delivery = await Delivery.create({
            orderId: order._id,
            delivererId: assignedDelivererId,
            status: newStatus === "shipped" || order.status === "shipped" ? "in-transit" : "pending",
          });
        }

        order.assignedDelivererId = assignedDelivererId;
        hasChanges = true;
      }

      // If status changed to shipped and deliverer is assigned, ensure delivery record exists and is in-transit
      if (newStatus === "shipped" && order.assignedDelivererId) {
        let delivery = await Delivery.findOne({
          orderId: order._id,
        });

        if (!delivery) {
          // Create delivery record if it doesn't exist
          delivery = await Delivery.create({
            orderId: order._id,
            delivererId: order.assignedDelivererId,
            status: "in-transit",
          });
        } else if (delivery.status !== "in-transit") {
          // Update delivery status to in-transit if order is being shipped
          delivery.status = "in-transit";
          await delivery.save();
        }
      }

      // Apply status change
      if (hasChanges && newStatus !== order.status) {
        order.status = newStatus;
      }

      // If no changes were made, return error
      if (!hasChanges) {
        return res.status(400).json({
          success: false,
          error: "No valid changes provided",
        });
      }

      await order.save();

      const populatedOrder = await Order.findById(order._id)
        .populate("products.productId", "name description price")
        .populate("customerId", "fullName phone address")
        .populate("assignedDelivererId", "fullName");

      return res.json({
        success: true,
        data: populatedOrder,
      });
    }

    return res.status(403).json({
      success: false,
      error: "Not authorized to update this order",
    });
  } catch (error) {
    next(error);
  }
};
