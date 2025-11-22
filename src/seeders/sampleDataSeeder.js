import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Seller from '../models/Seller.js';
import Deliverer from '../models/Deliverer.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Delivery from '../models/Delivery.js';

dotenv.config();

const seedSampleData = async () => {
  try {
    await connectDB();

    console.log('Starting sample data seeding...');

    // Create sample customers
    const customer1 = await User.create({
      email: 'customer1@example.com',
      password: 'Customer@123',
      role: 'customer',
      isActive: true
    });

    const customer2 = await User.create({
      email: 'customer2@example.com',
      password: 'Customer@123',
      role: 'customer',
      isActive: true
    });

    const customerProfile1 = await Customer.create({
      userId: customer1._id,
      fullName: 'John Doe',
      phone: '+1234567890',
      address: '123 Main St, City, Country'
    });

    const customerProfile2 = await Customer.create({
      userId: customer2._id,
      fullName: 'Jane Smith',
      phone: '+0987654321',
      address: '456 Oak Ave, City, Country'
    });

    console.log('Created 2 customers');

    // Create sample sellers
    const seller1 = await User.create({
      email: 'seller1@example.com',
      password: 'Seller@123',
      role: 'seller',
      isActive: true
    });

    const seller2 = await User.create({
      email: 'seller2@example.com',
      password: 'Seller@123',
      role: 'seller',
      isActive: true
    });

    const sellerProfile1 = await Seller.create({
      userId: seller1._id,
      shopName: 'Tech Store',
      documents: ['license1.pdf', 'certificate1.pdf'],
      approvalStatus: 'approved',
      verifiedAt: new Date()
    });

    const sellerProfile2 = await Seller.create({
      userId: seller2._id,
      shopName: 'Fashion Boutique',
      documents: ['license2.pdf', 'certificate2.pdf'],
      approvalStatus: 'approved',
      verifiedAt: new Date()
    });

    console.log('Created 2 approved sellers');

    // Create sample deliverers
    const deliverer1 = await User.create({
      email: 'deliverer1@example.com',
      password: 'Deliverer@123',
      role: 'deliverer',
      isActive: true
    });

    const deliverer2 = await User.create({
      email: 'deliverer2@example.com',
      password: 'Deliverer@123',
      role: 'deliverer',
      isActive: true
    });

    const delivererProfile1 = await Deliverer.create({
      userId: deliverer1._id,
      fullName: 'Mike Johnson',
      licenseNumber: 'DL123456',
      NIC: 'NIC123456789',
      approvalStatus: 'approved',
      verifiedAt: new Date()
    });

    const delivererProfile2 = await Deliverer.create({
      userId: deliverer2._id,
      fullName: 'Sarah Williams',
      licenseNumber: 'DL789012',
      NIC: 'NIC987654321',
      approvalStatus: 'approved',
      verifiedAt: new Date()
    });

    console.log('Created 2 approved deliverers');

    // Create sample products
    const product1 = await Product.create({
      sellerId: sellerProfile1._id,
      name: 'Laptop',
      description: 'High-performance laptop for work and gaming',
      price: 999.99,
      stock: 50
    });

    const product2 = await Product.create({
      sellerId: sellerProfile1._id,
      name: 'Smartphone',
      description: 'Latest smartphone with advanced features',
      price: 699.99,
      stock: 100
    });

    const product3 = await Product.create({
      sellerId: sellerProfile1._id,
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      price: 29.99,
      stock: 200
    });

    const product4 = await Product.create({
      sellerId: sellerProfile2._id,
      name: 'T-Shirt',
      description: 'Cotton t-shirt, comfortable and stylish',
      price: 19.99,
      stock: 150
    });

    const product5 = await Product.create({
      sellerId: sellerProfile2._id,
      name: 'Jeans',
      description: 'Classic blue jeans',
      price: 49.99,
      stock: 80
    });

    const product6 = await Product.create({
      sellerId: sellerProfile2._id,
      name: 'Sneakers',
      description: 'Comfortable running sneakers',
      price: 79.99,
      stock: 60
    });

    console.log('Created 6 products');

    // Create sample orders
    const order1 = await Order.create({
      customerId: customerProfile1._id,
      products: [
        { productId: product1._id, quantity: 1, price: product1.price },
        { productId: product3._id, quantity: 2, price: product3.price }
      ],
      totalPrice: product1.price + (product3.price * 2),
      status: 'confirmed',
      assignedDelivererId: delivererProfile1._id
    });

    // Update product stock
    product1.stock -= 1;
    product3.stock -= 2;
    await product1.save();
    await product3.save();

    const order2 = await Order.create({
      customerId: customerProfile1._id,
      products: [
        { productId: product2._id, quantity: 1, price: product2.price }
      ],
      totalPrice: product2.price,
      status: 'pending'
    });

    product2.stock -= 1;
    await product2.save();

    const order3 = await Order.create({
      customerId: customerProfile2._id,
      products: [
        { productId: product4._id, quantity: 3, price: product4.price },
        { productId: product5._id, quantity: 1, price: product5.price }
      ],
      totalPrice: (product4.price * 3) + product5.price,
      status: 'shipped',
      assignedDelivererId: delivererProfile2._id
    });

    product4.stock -= 3;
    product5.stock -= 1;
    await product4.save();
    await product5.save();

    const order4 = await Order.create({
      customerId: customerProfile2._id,
      products: [
        { productId: product6._id, quantity: 1, price: product6.price }
      ],
      totalPrice: product6.price,
      status: 'delivered',
      assignedDelivererId: delivererProfile1._id
    });

    product6.stock -= 1;
    await product6.save();

    console.log('Created 4 orders');

    // Create sample deliveries
    const delivery1 = await Delivery.create({
      orderId: order1._id,
      delivererId: delivererProfile1._id,
      status: 'in-transit'
    });

    const delivery2 = await Delivery.create({
      orderId: order3._id,
      delivererId: delivererProfile2._id,
      status: 'in-transit'
    });

    const delivery3 = await Delivery.create({
      orderId: order4._id,
      delivererId: delivererProfile1._id,
      status: 'delivered',
      deliveryTime: new Date()
    });

    console.log('Created 3 deliveries');

    console.log('\nSample data seeding completed successfully!');
    console.log('\nSummary:');
    console.log('- 2 Customers');
    console.log('- 2 Approved Sellers');
    console.log('- 2 Approved Deliverers');
    console.log('- 6 Products');
    console.log('- 4 Orders');
    console.log('- 3 Deliveries');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample data:', error);
    process.exit(1);
  }
};

seedSampleData();

