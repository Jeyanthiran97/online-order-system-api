import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import Seller from '../models/Seller.js';

export const getCart = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found',
      });
    }

    let cart = await Cart.findOne({ customerId: customer._id })
      .populate('items.productId', 'name description price stock images category sellerId');

    if (!cart) {
      cart = await Cart.create({
        customerId: customer._id,
        items: [],
        totalPrice: 0,
      });
    }

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and quantity (min: 1) are required',
      });
    }

    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Verify product belongs to an approved seller
    const seller = await Seller.findById(product.sellerId);
    if (!seller || seller.status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'Product is not available (seller not approved)',
      });
    }

    // Check stock availability
    let cart = await Cart.findOne({ customerId: customer._id });
    if (!cart) {
      cart = await Cart.create({
        customerId: customer._id,
        items: [],
        totalPrice: 0,
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    const requestedQuantity = existingItemIndex >= 0
      ? cart.items[existingItemIndex].quantity + quantity
      : quantity;

    if (product.stock < requestedQuantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = product.price; // Update price in case it changed
    } else {
      // Add new item
      cart.items.push({
        productId: product._id,
        quantity,
        price: product.price,
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name description price stock images category sellerId');

    res.json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1',
      });
    }

    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found',
      });
    }

    const cart = await Cart.findOne({ customerId: customer._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart',
      });
    }

    // Check stock availability
    const product = await Product.findById(cart.items[itemIndex].productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price; // Update price in case it changed
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name description price stock images category sellerId');

    res.json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found',
      });
    }

    const cart = await Cart.findOne({ customerId: customer._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === req.params.productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart',
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate('items.productId', 'name description price stock images category sellerId');

    res.json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer profile not found',
      });
    }

    const cart = await Cart.findOne({ customerId: customer._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found',
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

