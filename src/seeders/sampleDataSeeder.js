import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Seller from "../models/Seller.js";
import Deliverer from "../models/Deliverer.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Delivery from "../models/Delivery.js";
import Category from "../models/Category.js";

dotenv.config();

const seedSampleData = async () => {
  try {
    await connectDB();

    console.log("Starting sample data seeding...");

    // Create sample customers
    const customer1 = await User.create({
      email: "customer@gmail.com",
      password: "Customer@123",
      role: "customer",
      isActive: true,
    });

    const customer2 = await User.create({
      email: "customer1@gmail.com",
      password: "Customer@123",
      role: "customer",
      isActive: true,
    });

    const customerProfile1 = await Customer.create({
      userId: customer1._id,
      fullName: "Raj majo",
      phone: "0775257454",
      address: "123 Main St, Kilinochchi, SL",
    });

    const customerProfile2 = await Customer.create({
      userId: customer2._id,
      fullName: "Jane Smith",
      phone: "07652574856",
      address: "456 Oak Ave, City, Srilanka",
    });

    console.log("Created 2 customers");

    // Create sample sellers
    const seller1 = await User.create({
      email: "seller@gmail.com",
      password: "Seller@123",
      role: "seller",
      isActive: true,
    });

    const seller2 = await User.create({
      email: "seller1@gmail.com",
      password: "Seller@123",
      role: "seller",
      isActive: true,
    });

    const sellerProfile1 = await Seller.create({
      userId: seller1._id,
      shopName: "Tech Store",
      documents: ["license1.pdf", "certificate1.pdf"],
      status: "approved",
      verifiedAt: new Date(),
    });

    const sellerProfile2 = await Seller.create({
      userId: seller2._id,
      shopName: "Fashion Boutique",
      documents: ["license2.pdf", "certificate2.pdf"],
      status: "approved",
      verifiedAt: new Date(),
    });

    console.log("Created 2 approved sellers");

    // Create sample deliverers
    const deliverer1 = await User.create({
      email: "deliverer@gmail.com",
      password: "Deliverer@123",
      role: "deliverer",
      isActive: true,
    });

    const deliverer2 = await User.create({
      email: "deliverer1@gmail.com",
      password: "Deliverer@123",
      role: "deliverer",
      isActive: true,
    });

    const delivererProfile1 = await Deliverer.create({
      userId: deliverer1._id,
      fullName: "Mike Johnson",
      licenseNumber: "DL123456",
      NIC: "NIC123456789",
      status: "approved",
      verifiedAt: new Date(),
    });

    const delivererProfile2 = await Deliverer.create({
      userId: deliverer2._id,
      fullName: "Sarah Williams",
      licenseNumber: "DL789012",
      NIC: "NIC987654321",
      status: "approved",
      verifiedAt: new Date(),
    });

    console.log("Created 2 approved deliverers");

    // Create sample categories
    const categoryElectronics = await Category.create({
      name: "electronics",
      description: "Electronic devices and accessories",
      isActive: true,
    });

    const categoryClothing = await Category.create({
      name: "clothing",
      description: "Apparel and fashion items",
      isActive: true,
    });

    const categoryFood = await Category.create({
      name: "food",
      description: "Food and beverages",
      isActive: true,
    });

    const categoryBooks = await Category.create({
      name: "books",
      description: "Books and reading materials",
      isActive: true,
    });

    const categoryOther = await Category.create({
      name: "other",
      description: "Other miscellaneous items",
      isActive: true,
    });

    console.log("Created 5 categories");

    // Create sample products
    const product1 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Laptop",
      description: "High-performance laptop for work and gaming",
      price: 300000, // LKR
      stock: 50,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product2 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Smartphone",
      description: "Latest smartphone with advanced features",
      price: 150000, // LKR
      stock: 100,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product3 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse",
      price: 9000, // LKR
      stock: 200,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product4 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "T-Shirt",
      description: "Cotton t-shirt, comfortable and stylish",
      price: 3800, // LKR
      stock: 150,
      category: categoryClothing.name,
      images: [],
      mainImageIndex: 0,
    });

    const product5 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Jeans",
      description: "Classic blue jeans",
      price: 4500, // LKR
      stock: 80,
      category: categoryClothing.name,
      images: [],
      mainImageIndex: 0,
    });

    const product6 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Sneakers",
      description: "Comfortable running sneakers",
      price: 4600, // LKR
      stock: 60,
      category: categoryClothing.name,
      images: [],
      mainImageIndex: 0,
    });

    // Add more electronics products
    const product7 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Tablet",
      description: "10-inch tablet with high-resolution display",
      price: 85000, // LKR
      stock: 30,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product8 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Keyboard",
      description: "Mechanical gaming keyboard",
      price: 12000, // LKR
      stock: 75,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product9 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Monitor",
      description: "27-inch 4K monitor",
      price: 95000, // LKR
      stock: 25,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product10 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Headphones",
      description: "Wireless noise-cancelling headphones",
      price: 25000, // LKR
      stock: 40,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product11 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Webcam",
      description: "HD webcam for video calls",
      price: 15000, // LKR
      stock: 50,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product12 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "USB Drive",
      description: "64GB USB 3.0 flash drive",
      price: 2500, // LKR
      stock: 200,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product13 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Power Bank",
      description: "20000mAh portable power bank",
      price: 5500, // LKR
      stock: 80,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    const product14 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Smart Watch",
      description: "Fitness tracking smartwatch",
      price: 35000, // LKR
      stock: 35,
      category: categoryElectronics.name,
      images: [],
      mainImageIndex: 0,
    });

    // Add more clothing products
    const product15 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Hoodie",
      description: "Warm and cozy hoodie",
      price: 5500, // LKR
      stock: 90,
      category: categoryClothing.name,
      images: [],
      mainImageIndex: 0,
    });

    const product16 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Dress Shirt",
      description: "Formal dress shirt",
      price: 4200, // LKR
      stock: 70,
      category: categoryClothing.name,
      images: [],
      mainImageIndex: 0,
    });

    const product17 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Jacket",
      description: "Winter jacket",
      price: 8500, // LKR
      stock: 45,
      category: categoryClothing.name,
      images: [],
      mainImageIndex: 0,
    });

    const product18 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Shorts",
      description: "Casual summer shorts",
      price: 3200, // LKR
      stock: 100,
      category: categoryClothing.name,
      images: [],
      mainImageIndex: 0,
    });

    const product19 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Cap",
      description: "Baseball cap",
      price: 1800, // LKR
      stock: 120,
      category: categoryClothing.name,
      images: [],
      mainImageIndex: 0,
    });

    const product20 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Socks",
      description: "Pack of 5 cotton socks",
      price: 1200, // LKR
      stock: 150,
      category: categoryClothing.name,
      images: [],
      mainImageIndex: 0,
    });

    // Add food products
    const product21 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Rice",
      description: "Premium basmati rice 5kg",
      price: 1200, // LKR
      stock: 200,
      category: categoryFood.name,
      images: [],
      mainImageIndex: 0,
    });

    const product22 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Cooking Oil",
      description: "Vegetable cooking oil 1L",
      price: 450, // LKR
      stock: 300,
      category: categoryFood.name,
      images: [],
      mainImageIndex: 0,
    });

    const product23 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Tea",
      description: "Ceylon tea 500g",
      price: 650, // LKR
      stock: 180,
      category: categoryFood.name,
      images: [],
      mainImageIndex: 0,
    });

    const product24 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Sugar",
      description: "White sugar 1kg",
      price: 280, // LKR
      stock: 250,
      category: categoryFood.name,
      images: [],
      mainImageIndex: 0,
    });

    const product25 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Flour",
      description: "Wheat flour 1kg",
      price: 320, // LKR
      stock: 220,
      category: categoryFood.name,
      images: [],
      mainImageIndex: 0,
    });

    const product26 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Spices Pack",
      description: "Assorted spices collection",
      price: 1500, // LKR
      stock: 100,
      category: categoryFood.name,
      images: [],
      mainImageIndex: 0,
    });

    // Add book products
    const product27 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Programming Book",
      description: "Learn JavaScript programming",
      price: 3500, // LKR
      stock: 50,
      category: categoryBooks.name,
      images: [],
      mainImageIndex: 0,
    });

    const product28 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Novel",
      description: "Bestselling fiction novel",
      price: 1800, // LKR
      stock: 60,
      category: categoryBooks.name,
      images: [],
      mainImageIndex: 0,
    });

    const product29 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Cookbook",
      description: "Traditional recipes cookbook",
      price: 2800, // LKR
      stock: 40,
      category: categoryBooks.name,
      images: [],
      mainImageIndex: 0,
    });

    const product30 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "History Book",
      description: "World history encyclopedia",
      price: 4500, // LKR
      stock: 30,
      category: categoryBooks.name,
      images: [],
      mainImageIndex: 0,
    });

    const product31 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Science Book",
      description: "Introduction to physics",
      price: 3200, // LKR
      stock: 35,
      category: categoryBooks.name,
      images: [],
      mainImageIndex: 0,
    });

    // Add other category products
    const product32 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Backpack",
      description: "Durable travel backpack",
      price: 6500, // LKR
      stock: 55,
      category: categoryOther.name,
      images: [],
      mainImageIndex: 0,
    });

    const product33 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Water Bottle",
      description: "Stainless steel water bottle",
      price: 2800, // LKR
      stock: 85,
      category: categoryOther.name,
      images: [],
      mainImageIndex: 0,
    });

    const product34 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Umbrella",
      description: "Windproof travel umbrella",
      price: 2200, // LKR
      stock: 70,
      category: categoryOther.name,
      images: [],
      mainImageIndex: 0,
    });

    const product35 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Wallet",
      description: "Leather wallet",
      price: 3500, // LKR
      stock: 65,
      category: categoryOther.name,
      images: [],
      mainImageIndex: 0,
    });

    const product36 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Sunglasses",
      description: "UV protection sunglasses",
      price: 4800, // LKR
      stock: 50,
      category: categoryOther.name,
      images: [],
      mainImageIndex: 0,
    });

    const product37 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Watch",
      description: "Classic analog watch",
      price: 12000, // LKR
      stock: 25,
      category: categoryOther.name,
      images: [],
      mainImageIndex: 0,
    });

    const product38 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Desk Lamp",
      description: "LED desk lamp",
      price: 5500, // LKR
      stock: 40,
      category: categoryOther.name,
      images: [],
      mainImageIndex: 0,
    });

    const product39 = await Product.create({
      sellerId: sellerProfile1._id,
      name: "Notebook",
      description: "A5 ruled notebook",
      price: 850, // LKR
      stock: 150,
      category: categoryOther.name,
      images: [],
      mainImageIndex: 0,
    });

    const product40 = await Product.create({
      sellerId: sellerProfile2._id,
      name: "Pen Set",
      description: "Premium pen set",
      price: 1800, // LKR
      stock: 90,
      category: categoryOther.name,
      images: [],
      mainImageIndex: 0,
    });

    console.log("Created 40 products");

    // Create sample orders
    const order1 = await Order.create({
      customerId: customerProfile1._id,
      products: [
        { productId: product1._id, quantity: 1, price: product1.price },
        { productId: product3._id, quantity: 2, price: product3.price },
      ],
      totalPrice: product1.price + product3.price * 2,
      status: "confirmed",
      assignedDelivererId: delivererProfile1._id,
    });

    // Update product stock
    product1.stock -= 1;
    product3.stock -= 2;
    await product1.save();
    await product3.save();

    const order2 = await Order.create({
      customerId: customerProfile1._id,
      products: [
        { productId: product2._id, quantity: 1, price: product2.price },
      ],
      totalPrice: product2.price,
      status: "pending",
    });

    product2.stock -= 1;
    await product2.save();

    const order3 = await Order.create({
      customerId: customerProfile2._id,
      products: [
        { productId: product4._id, quantity: 3, price: product4.price },
        { productId: product5._id, quantity: 1, price: product5.price },
      ],
      totalPrice: product4.price * 3 + product5.price,
      status: "shipped",
      assignedDelivererId: delivererProfile2._id,
    });

    product4.stock -= 3;
    product5.stock -= 1;
    await product4.save();
    await product5.save();

    const order4 = await Order.create({
      customerId: customerProfile2._id,
      products: [
        { productId: product6._id, quantity: 1, price: product6.price },
      ],
      totalPrice: product6.price,
      status: "delivered",
      assignedDelivererId: delivererProfile1._id,
    });

    product6.stock -= 1;
    await product6.save();

    console.log("Created 4 orders");

    // Create sample deliveries
    const delivery1 = await Delivery.create({
      orderId: order1._id,
      delivererId: delivererProfile1._id,
      status: "in-transit",
    });

    const delivery2 = await Delivery.create({
      orderId: order3._id,
      delivererId: delivererProfile2._id,
      status: "in-transit",
    });

    const delivery3 = await Delivery.create({
      orderId: order4._id,
      delivererId: delivererProfile1._id,
      status: "delivered",
      deliveryTime: new Date(),
    });

    console.log("Created 3 deliveries");

    console.log("\nSample data seeding completed successfully!");
    console.log("\nSummary:");
    console.log("- 2 Customers");
    console.log("- 2 Approved Sellers");
    console.log("- 2 Approved Deliverers");
    console.log("- 5 Categories");
    console.log("- 40 Products");
    console.log("- 4 Orders");
    console.log("- 3 Deliveries");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding sample data:", error);
    process.exit(1);
  }
};

seedSampleData();
