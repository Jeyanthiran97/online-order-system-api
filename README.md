# Online Order System API

A comprehensive RESTful API for an online order management system built with Node.js, Express, MongoDB, and Mongoose. This system supports multiple user roles (Customer, Seller, Deliverer, Admin) with role-based access control, approval workflows, and advanced filtering, sorting, and pagination.

## Features

- **Multi-Role Authentication**: Customer, Seller, Deliverer, and Admin roles
- **JWT Token-Based Authentication**: Secure authentication with JSON Web Tokens
- **Role-Based Access Control (RBAC)**: Fine-grained permissions per role
- **Approval Workflow**: Admin approval required for Sellers and Deliverers
- **Advanced Filtering**: Filter products, orders, and users by multiple criteria
- **Sorting & Pagination**: Sort by multiple fields and paginate results
- **Entity-Based Architecture**: Modular, scalable controller and route structure
- **Product Management**: CRUD operations for products with category and rating
- **Order Management**: Complete order lifecycle with status tracking
- **Delivery Tracking**: Track delivery status and assign deliverers
- **Analytics**: System-wide analytics for admins

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher) or **yarn**
- **MongoDB** (v4.4 or higher) - Local installation or MongoDB Atlas account
- **Git** (for cloning the repository)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd "Online Order System/api"
```

Or if you have the repository URL:

```bash
git clone https://github.com/yourusername/online-order-system.git
cd online-order-system/api
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies:

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following environment variables to `.env`:

```env
# Server Configuration
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/online_order_system
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/online_order_system

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

**Important**:

- Replace `your_super_secret_jwt_key_change_this_in_production` with a strong, random secret key
- For production, use a secure MongoDB connection string
- Never commit the `.env` file to version control

### 4. Database Setup

#### Option A: Local MongoDB

1. Make sure MongoDB is running on your local machine
2. Update `MONGODB_URI` in `.env` to point to your local MongoDB instance

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env` with your Atlas connection string

## Running the Application

### Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`)

### Seed the Database

#### Seed Admin User

```bash
npm run seed:admin
```

This creates the default admin user:

- **Email**: `admin@gmail.com`
- **Password**: `Admin@123`

#### Seed Sample Data

```bash
npm run seed:sample
```

This creates sample data for:

- Customers (2 users)
- Sellers (2 users, approved)
- Deliverers (2 users, approved)
- Products (multiple)
- Orders (multiple)
- Deliveries (multiple)

#### Seed All (Admin + Sample Data)

```bash
npm run seed:all
```

#### Clear All Data

```bash
npm run clear:data
```

**Warning**: This will delete all data from the database!

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

Most endpoints require authentication. Include the JWT token in the request header:

```
Authorization: Bearer <your-jwt-token>
```

### Quick Start

1. **Login as Admin**:

   ```bash
   POST /api/auth/login
   Body: {
     "email": "admin@gmail.com",
     "password": "Admin@123"
   }
   ```

2. **Get Products** (with filtering):

   ```bash
   GET /api/products?category=electronics&minPrice=100&sort=-rating&page=1&limit=10
   ```

3. **Get Orders** (with filtering):
   ```bash
   GET /api/orders?status=pending&sort=-createdAt&page=1&limit=10
   ```

### Complete API Documentation

For detailed API documentation with all endpoints, request/response examples, and filtering options, see:

- **[DEMO.md](./DEMO.md)** - Complete API documentation with examples
- **[PRD.md](./online_order_system_prd.md)** - Product Requirement Document

## Testing Credentials

After seeding the database, you can use these credentials:

### Admin

- **Email**: `admin@gmail.com`
- **Password**: `Admin@123`

### Customer

- **Email**: `customer1@example.com`
- **Password**: `Customer@123`

### Seller

- **Email**: `seller1@example.com`
- **Password**: `Seller@123`
- **Status**: Approved (can login immediately)

### Deliverer

- **Email**: `deliverer1@example.com`
- **Password**: `Deliverer@123`
- **Status**: Approved (can login immediately)

## Project Structure

```
/
├── .env                    # Environment variables (not in git)
├── .gitignore             # Git ignore file
├── package.json           # Project dependencies and scripts
├── README.md              # This file
├── DEMO.md                # API documentation
├── online_order_system_prd.md  # Product Requirement Document
└── src/
    ├── server.js          # Application entry point
    ├── config/
    │   ├── db.js          # MongoDB connection
    │   └── jwtConfig.js   # JWT configuration
    ├── models/
    │   ├── User.js        # User model
    │   ├── Customer.js   # Customer profile model
    │   ├── Seller.js      # Seller profile model
    │   ├── Deliverer.js   # Deliverer profile model
    │   ├── Product.js     # Product model
    │   ├── Order.js      # Order model
    │   ├── Delivery.js   # Delivery model
    │   └── Analytics.js  # Analytics model
    ├── controllers/
    │   ├── authController.js      # Authentication logic
    │   ├── productsController.js  # Product CRUD operations
    │   ├── ordersController.js    # Order management
    │   ├── deliveriesController.js # Delivery tracking
    │   ├── analyticsController.js  # Analytics
    │   ├── usersController.js      # User management (admin)
    │   ├── customerController.js   # Customer management (admin)
    │   ├── sellerController.js     # Seller management (admin)
    │   └── delivererController.js  # Deliverer management (admin)
    ├── routes/
    │   ├── authRoutes.js      # Authentication routes
    │   ├── productsRoutes.js  # Product routes
    │   ├── ordersRoutes.js    # Order routes
    │   ├── deliveriesRoutes.js # Delivery routes
    │   ├── analyticsRoutes.js  # Analytics routes
    │   ├── usersRoutes.js      # User routes (admin)
    │   ├── customersRoutes.js  # Customer routes (admin)
    │   ├── sellersRoutes.js    # Seller routes (admin)
    │   ├── deliverersRoutes.js # Deliverer routes (admin)
    │   └── index.js           # Route aggregator
    ├── middleware/
    │   ├── authMiddleware.js   # JWT authentication
    │   ├── roleMiddleware.js   # Role-based access control
    │   └── errorMiddleware.js  # Error handling
    └── seeders/
        ├── adminSeeder.js      # Admin user seeder
        ├── sampleDataSeeder.js  # Sample data seeder
        └── clearData.js        # Data cleanup script
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management

## Key Features Explained

### 1. Multi-Role Authentication

- Each user has a **single role** (customer, seller, deliverer, or admin)
- JWT tokens are issued upon successful login
- Role-based middleware restricts access to routes

### 2. Approval Workflow

- **Sellers** and **Deliverers** require admin approval before they can login
- **Customers** are approved by default
- Admin can approve/reject with optional reason

### 3. Filtering, Sorting, and Pagination

All list endpoints support:

- **Filtering**: Multiple query parameters for filtering data
- **Sorting**: Sort by multiple fields (default: `updatedAt` descending)
- **Pagination**: Page-based pagination with configurable limits

Example:

```
GET /api/products?category=electronics&minPrice=100&maxPrice=1000&sort=-rating,price&page=1&limit=20
```

### 4. Entity-Based Architecture

- Each entity (Product, Order, Customer, Seller, Deliverer) has its own controller
- Routes are organized by entity
- Easy to maintain and extend

## Available Scripts

```bash
# Start the server
npm start

# Start the server in development mode (with auto-reload)
npm run dev

# Seed admin user
npm run seed:admin

# Seed sample data
npm run seed:sample

# Seed all (admin + sample data)
npm run seed:all

# Clear all data from database
npm run clear:data
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Routes protected by role middleware
- **Input Validation**: Mongoose schema validation
- **Email Uniqueness**: Enforced at database level

## Troubleshooting

### MongoDB Connection Issues

1. **Check MongoDB is running**:

   ```bash
   # For local MongoDB
   mongod
   ```

2. **Verify connection string** in `.env` file

3. **Check firewall settings** if using MongoDB Atlas

### Port Already in Use

If port 3000 is already in use, change the `PORT` in `.env` file:

```env
PORT=3001
```

### Module Not Found Errors

Make sure all dependencies are installed:

```bash
npm install
```

### JWT Token Issues

- Ensure `JWT_SECRET` is set in `.env`
- Token expires after 7 days (configurable)
- Get a new token by logging in again

## Additional Resources

- **API Documentation**: See [DEMO.md](./DEMO.md) for complete API reference
- **Product Requirements**: See [online_order_system_prd.md](./online_order_system_prd.md) for detailed specifications

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Your Name - [Your GitHub](https://github.com/yourusername)

## Acknowledgments

- Express.js community
- MongoDB documentation
- All contributors

---

**Happy Coding!**
