import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be positive']
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
    unique: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0,
    min: [0, 'Total price must be positive']
  }
}, {
  timestamps: true
});

// Calculate total price before saving
cartSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalPrice = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  } else {
    this.totalPrice = 0;
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;

