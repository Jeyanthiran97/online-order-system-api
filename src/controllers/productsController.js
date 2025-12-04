import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Category from "../models/Category.js";
import { extractPublicId, deleteImagesFromCloudinary, normalizeCloudinaryUrl } from "../config/cloudinary.js";

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

    // Process image URLs from request body (will come from Cloudinary)
    let imageUrls = [];
    if (req.body.images && Array.isArray(req.body.images)) {
      imageUrls = req.body.images;
    } else if (req.body.images && typeof req.body.images === 'string') {
      // Handle comma-separated string
      imageUrls = req.body.images.split(',').filter(Boolean);
    }

    // Deduplicate images by public ID (to prevent duplicate images)
    const seenPublicIds = new Set();
    const deduplicatedImages = [];
    
    for (const url of imageUrls) {
      if (!url) continue; // Skip empty URLs
      
      const publicId = extractPublicId(url);
      if (publicId) {
        // Use public ID for deduplication (most reliable)
        if (!seenPublicIds.has(publicId)) {
          seenPublicIds.add(publicId);
          deduplicatedImages.push(url);
        }
      } else {
        // If we can't extract public ID, use normalized URL-based deduplication
        const normalizedUrl = normalizeCloudinaryUrl(url);
        if (normalizedUrl) {
          const isDuplicate = deduplicatedImages.some(img => {
            const normalizedExisting = normalizeCloudinaryUrl(img);
            return normalizedExisting === normalizedUrl;
          });
          if (!isDuplicate) {
            deduplicatedImages.push(url);
          }
        } else {
          // Fallback: simple URL comparison
          if (!deduplicatedImages.includes(url)) {
            deduplicatedImages.push(url);
          }
        }
      }
    }
    
    imageUrls = deduplicatedImages;

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

    // Process image URLs from request body (will come from Cloudinary)
    let imageUrls = [];
    
    // If images field is explicitly provided (even if empty array), use it
    // This allows removing all images by sending an empty array
    if (req.body.hasOwnProperty('images')) {
      if (Array.isArray(req.body.images)) {
        imageUrls = req.body.images; // Can be empty array to remove all images
      } else if (typeof req.body.images === 'string') {
        // Handle comma-separated string
        imageUrls = req.body.images.split(',').filter(Boolean);
      }
    } else if (req.body.existingImages) {
      // Only use existingImages if images field was not provided
      if (Array.isArray(req.body.existingImages)) {
        imageUrls = req.body.existingImages;
      } else {
        imageUrls = req.body.existingImages.split(',').filter(Boolean);
      }
    } else {
      // Keep existing images only if images field was not provided at all
      imageUrls = [...(product.images || [])];
    }

    // Log received images for debugging
    console.log('Received images for update:', imageUrls.length, 'images');
    console.log('Existing product images:', (product.images || []).length, 'images');

    // Deduplicate images by public ID (to prevent duplicate images)
    // This is critical to prevent duplicates from multiplying on each update
    const seenPublicIds = new Set();
    const seenUrls = new Set(); // Also track URLs as fallback
    const deduplicatedImages = [];
    let duplicateCount = 0;
    
    for (const url of imageUrls) {
      if (!url || typeof url !== 'string' || url.trim() === '') continue; // Skip empty/invalid URLs
      
      const publicId = extractPublicId(url);
      const normalizedUrl = normalizeCloudinaryUrl(url);
      
      // Check for duplicates using public ID (most reliable)
      if (publicId) {
        if (!seenPublicIds.has(publicId)) {
          seenPublicIds.add(publicId);
          deduplicatedImages.push(url);
        } else {
          duplicateCount++;
          console.log('Duplicate image detected by public ID:', publicId, 'URL:', url);
        }
      } else if (normalizedUrl) {
        // Fallback: use normalized URL for deduplication
        if (!seenUrls.has(normalizedUrl)) {
          seenUrls.add(normalizedUrl);
          deduplicatedImages.push(url);
        } else {
          duplicateCount++;
          console.log('Duplicate image detected by normalized URL:', normalizedUrl);
        }
      } else {
        // Last resort: simple URL comparison
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          deduplicatedImages.push(url);
        } else {
          duplicateCount++;
          console.log('Duplicate image detected by URL:', url);
        }
      }
    }
    
    imageUrls = deduplicatedImages;
    
    if (duplicateCount > 0) {
      console.log(`Removed ${duplicateCount} duplicate image(s) during deduplication`);
    }
    console.log('After deduplication:', imageUrls.length, 'unique images (was', imageUrls.length + duplicateCount, 'before deduplication)');

    // Validate image count after deduplication
    if (imageUrls.length > 5) {
      return res.status(400).json({
        success: false,
        error: `Maximum 5 images allowed per product. You have ${imageUrls.length} unique images.`,
      });
    }

    // Delete removed images from Cloudinary
    const existingImages = product.images || [];
    
    // Extract public IDs for comparison (more reliable than URL comparison)
    const existingPublicIds = existingImages
      .map((url) => extractPublicId(url))
      .filter(Boolean);
    const finalPublicIds = imageUrls
      .map((url) => extractPublicId(url))
      .filter(Boolean);
    
    // Find images that were removed by comparing public IDs
    const publicIdsToDelete = existingPublicIds.filter(
      (publicId) => !finalPublicIds.includes(publicId)
    );
    
    // Also find the original URLs for logging purposes
    const imagesToDelete = existingImages.filter((img) => {
      const publicId = extractPublicId(img);
      return publicId && publicIdsToDelete.includes(publicId);
    });

    // Delete removed images from Cloudinary
    if (publicIdsToDelete.length > 0) {
      console.log(`Deleting ${publicIdsToDelete.length} image(s) from Cloudinary:`, publicIdsToDelete);
      console.log('Image URLs to delete:', imagesToDelete);
      
      // Delete images from Cloudinary (non-blocking)
      deleteImagesFromCloudinary(publicIdsToDelete)
        .then((result) => {
          if (result.success) {
            const deletedCount = Object.keys(result.deleted || {}).length;
            const notFoundCount = (result.notFound || []).length;
            console.log(`Successfully deleted ${deletedCount} image(s) from Cloudinary`);
            if (notFoundCount > 0) {
              console.log(`${notFoundCount} image(s) were not found in Cloudinary (may have been already deleted)`);
            }
          } else {
            console.error('Failed to delete images from Cloudinary:', result.error);
          }
        })
        .catch((error) => {
          console.error('Error deleting images from Cloudinary:', error);
          // Don't fail the update if image deletion fails
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

    // Update images in request body - explicitly set images array to ensure replacement
    req.body.images = imageUrls;
    
    // Remove existingImages from body if present (we only use images field)
    delete req.body.existingImages;

    // Use $set operator to ensure images array is replaced, not merged
    const updateData = {
      ...req.body,
      images: imageUrls, // Explicitly set images array
    };

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
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

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images
        .map((url) => extractPublicId(url))
        .filter(Boolean);
      
      if (publicIds.length > 0) {
        // Delete images from Cloudinary (non-blocking)
        deleteImagesFromCloudinary(publicIds).catch((error) => {
          console.error('Error deleting images from Cloudinary:', error);
          // Don't fail the deletion if image deletion fails
        });
      }
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
