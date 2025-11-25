import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Seller from '../models/Seller.js';
import Deliverer from '../models/Deliverer.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Delivery from '../models/Delivery.js';
import Analytics from '../models/Analytics.js';
import Category from '../models/Category.js';

dotenv.config();

const clearAllData = async () => {
  try {
    await connectDB();

    console.log('Starting data cleanup...');

    // Delete in order to respect foreign key constraints
    await Delivery.deleteMany({});
    console.log('Cleared deliveries');

    await Order.deleteMany({});
    console.log('Cleared orders');

    await Product.deleteMany({});
    console.log('Cleared products');

    await Category.deleteMany({});
    console.log('Cleared categories');

    await Deliverer.deleteMany({});
    console.log('Cleared deliverers');

    await Seller.deleteMany({});
    console.log('Cleared sellers');

    await Customer.deleteMany({});
    console.log('Cleared customers');

    await Analytics.deleteMany({});
    console.log('Cleared analytics');

    await User.deleteMany({});
    console.log('Cleared users');

    console.log('\nAll data cleared successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error clearing data:', error);
    process.exit(1);
  }
};

clearAllData();

