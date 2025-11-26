import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Category from "../models/Category.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category, rating, mainImageIndex } = req.body;

    // Validate category exists and is active (category is required)
    if (!category) {
      return res.status(400).json({
        success: false,
        error: "Category is required",
      });
    }

    const categoryDoc = await Category.findOne({ 
      name: category.toLowerCase().trim(),
      isActive: true 
    });
    
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        error: "Invalid category. Please select a valid category.",
      });
    }

    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    // Validate mainImageIndex
    let mainIdx = mainImageIndex ? parseInt(mainImageIndex, 10) : 0;
    if (imageUrls.length > 0 && (mainIdx < 0 || mainIdx >= imageUrls.length)) {
      mainIdx = 0; // Default to first image if invalid
    }

    const product = await Product.create({
      sellerId: req.seller._id,
      name,
      description,
      price,
      stock,
      category: category ? category.toLowerCase().trim() : category,
      rating: rating || 0,
      images: imageUrls,
      mainImageIndex: mainIdx,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(e => e.message).join(', '),
      });
    }
    next(error);
  }
};

const buildProductQuery = async (req) => {
  const {
    category,
    minPrice,
    maxPrice,
    minRating,
    maxRating,
    availability,
    stockStatus,
    search,
    sellerId,
  } = req.query;

  const filter = {};

  // Role-based filtering
  if (req.user) {
    if (req.user.role === "seller") {
      // Sellers only see their own products
      // Fetch seller profile if not already set (for GET route with authOptional)
      if (!req.seller) {
        const seller = await Seller.findOne({ userId: req.user._id });
        if (seller) {
          req.seller = seller;
        }
      }
      if (req.seller) {
        filter.sellerId = req.seller._id;
      }
    }
    // Admin can see all products (no sellerId filter unless ?sellerId= is provided)
    // Customer can see all products (no sellerId filter)
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Rating range filter
  if (minRating || maxRating) {
    filter.rating = {};
    if (minRating) filter.rating.$gte = Number(minRating);
    if (maxRating) filter.rating.$lte = Number(maxRating);
  }

  // Availability filter (for customers)
  if (availability === "inStock") {
    filter.stock = { $gt: 0 };
  } else if (availability === "outOfStock") {
    filter.stock = { $eq: 0 };
  }

  // Stock status filter (for sellers)
  if (stockStatus === "low") {
    filter.stock = { $lte: 10 };
  } else if (stockStatus === "inStock") {
    filter.stock = { $gt: 0 };
  } else if (stockStatus === "outOfStock") {
    filter.stock = { $eq: 0 };
  }

  // Search by name or description
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // Seller ID filter (admin can filter by seller, or public can filter)
  if (sellerId) {
    // Admin can filter by any sellerId
    // Public/unauthenticated users can also filter by sellerId
    // But if user is seller, we already filtered by their sellerId above, so ignore this
    if (req.user?.role !== "seller") {
      filter.sellerId = sellerId;
    }
  }

  return filter;
};

const buildSortQuery = (sortParam) => {
  if (!sortParam) return { updatedAt: -1 };

  const sortFields = {};
  const fields = sortParam.split(",");

  fields.forEach((field) => {
    const trimmedField = field.trim();
    if (trimmedField.startsWith("-")) {
      sortFields[trimmedField.substring(1)] = -1;
    } else {
      sortFields[trimmedField] = 1;
    }
  });

  return sortFields;
};

export const getProducts = async (req, res, next) => {
  try {
    const filter = await buildProductQuery(req);
    const sort = buildSortQuery(req.query.sort);

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Product.countDocuments(filter);

    // Get products with pagination
    const products = await Product.find(filter)
      .populate("sellerId", "shopName")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: page,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "sellerId",
      "shopName"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Admin can update any product, seller can only update their own
    if (req.user.role !== "admin") {
      // For sellers, check ownership
      if (!req.seller) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to update this product",
        });
      }
      if (product.sellerId.toString() !== req.seller._id.toString()) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to update this product",
        });
      }
    }

    // Validate category if provided
    if (req.body.category) {
      const categoryDoc = await Category.findOne({ 
        name: req.body.category.toLowerCase().trim(),
        isActive: true 
      });
      
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          error: "Invalid category. Please select a valid category.",
        });
      }
      
      // Normalize category name
      req.body.category = req.body.category.toLowerCase().trim();
    }

    // Process uploaded images
    const oldImages = [...(product.images || [])];
    let imageUrls = [...oldImages];
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/products/${file.filename}`);
      // If existingImages is provided in body, it means we're replacing images
      // Otherwise, append new images (up to 5 total)
      if (req.body.existingImages) {
        // Parse existing images from body (comma-separated string or array)
        const existingImages = Array.isArray(req.body.existingImages) 
          ? req.body.existingImages 
          : req.body.existingImages.split(',').filter(Boolean);
        imageUrls = [...existingImages, ...newImageUrls].slice(0, 5);
      } else {
        // Append new images to existing ones
        imageUrls = [...imageUrls, ...newImageUrls].slice(0, 5);
      }
    } else if (req.body.existingImages) {
      // No new files, but existing images were updated (removed some)
      const existingImages = Array.isArray(req.body.existingImages) 
        ? req.body.existingImages 
        : req.body.existingImages.split(',').filter(Boolean);
      imageUrls = existingImages;
    }

    // Delete removed image files from filesystem
    const removedImages = oldImages.filter(img => !imageUrls.includes(img));
    if (removedImages.length > 0) {
      const uploadsDir = path.join(__dirname, '../../uploads/products');
      removedImages.forEach(imageUrl => {
        // Extract filename from URL (e.g., /uploads/products/filename.jpg -> filename.jpg)
        const filename = imageUrl.replace('/uploads/products/', '');
        const filePath = path.join(uploadsDir, filename);
        
        // Delete file if it exists
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`Deleted image file: ${filename}`);
          } catch (error) {
            console.error(`Error deleting image file ${filename}:`, error);
            // Don't fail the request if file deletion fails
          }
        }
      });
    }

    // Handle mainImageIndex
    if (req.body.mainImageIndex !== undefined) {
      const mainIdx = parseInt(req.body.mainImageIndex, 10);
      if (mainIdx >= 0 && mainIdx < imageUrls.length) {
        req.body.mainImageIndex = mainIdx;
      } else if (imageUrls.length > 0) {
        req.body.mainImageIndex = 0; // Default to first image if invalid
      }
    }

    // Update images in request body
    req.body.images = imageUrls;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(e => e.message).join(', '),
      });
    }
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Admin can delete any product, seller can only delete their own
    if (req.user.role !== "admin") {
      // For sellers, check ownership
      if (!req.seller) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to delete this product",
        });
      }
      if (product.sellerId.toString() !== req.seller._id.toString()) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to delete this product",
        });
      }
    }

    // Delete all product images from filesystem
    if (product.images && product.images.length > 0) {
      const uploadsDir = path.join(__dirname, '../../uploads/products');
      product.images.forEach(imageUrl => {
        // Extract filename from URL (e.g., /uploads/products/filename.jpg -> filename.jpg)
        const filename = imageUrl.replace('/uploads/products/', '');
        const filePath = path.join(uploadsDir, filename);
        
        // Delete file if it exists
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`Deleted image file: ${filename}`);
          } catch (error) {
            console.error(`Error deleting image file ${filename}:`, error);
            // Don't fail the request if file deletion fails
          }
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
