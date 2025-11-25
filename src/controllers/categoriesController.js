import Category from "../models/Category.js";

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: name.toLowerCase().trim() 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: "Category with this name already exists",
      });
    }

    const category = await Category.create({
      name: name.toLowerCase().trim(),
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Category with this name already exists",
      });
    }
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Check if new name conflicts with existing category
    if (name && name.toLowerCase().trim() !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: name.toLowerCase().trim(),
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: "Category with this name already exists",
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.toLowerCase().trim();
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Category with this name already exists",
      });
    }
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found",
      });
    }

    // Check if category is used by any products
    const Product = (await import("../models/Product.js")).default;
    const productsCount = await Product.countDocuments({ category: category.name });

    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category. It is used by ${productsCount} product(s).`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

