import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  totalSales: {
    type: Number,
    default: 0,
    min: 0
  },
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  salesBySeller: [{
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seller'
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0
    }
  }]
}, {
  timestamps: true
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;

