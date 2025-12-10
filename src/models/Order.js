import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required']
  },
  products: [{
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
  }],
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price must be positive']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  assignedDelivererId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deliverer'
  },
  stripeSessionId: {
    type: String
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "Sri Lanka" }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cod'],
    required: true
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;

