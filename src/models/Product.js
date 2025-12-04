import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller ID is required']
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock must be positive'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be between 0 and 5'],
    max: [5, 'Rating must be between 0 and 5'],
    default: 0
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 images allowed per product'
    }
  },
  mainImageIndex: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: function(v) {
        // Allow mainImageIndex when images array is empty or when index is within bounds
        if (!this.images || this.images.length === 0) {
          return true;
        }
        return v < this.images.length;
      },
      message: 'Main image index must be within the images array bounds'
    }
  }
}, {
  timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;

