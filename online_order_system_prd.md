# Product Requirement Document (PRD) - Online Order System

---

## 1. Overview

This PRD defines the requirements for an **Online Order System** following industry-standard best practices for authentication, multi-role access, and entity-based architecture. The system is built using **Node.js, Express, MongoDB, and Mongoose** with full ESM (ES Module) pattern.

## Rules

1. Use ESM pattern throughout the project (no CommonJS)
   - Example: `import express from 'express'`
2. Don't use icons in responses (code should be human-readable)
3. Setup all needed files for API implementation (.env, .gitignore, etc.)
4. Make git commits for each set of changes
5. Follow step-by-step implementation approach

---

## 2. Objective

- Provide a scalable online order system with multiple user roles:
  - **Customer**: Browse products, place orders, manage profile
  - **Seller**: Add products, manage orders, manage profile (requires admin approval)
  - **Deliverer**: Track deliveries, update delivery status, manage profile (requires admin approval)
  - **Admin**: Approve/reject sellers/deliverers, manage users, view analytics
- Implement **multi-role authentication** with single role per user
- Implement **entity-based routes** and controllers
- Implement **filtering, sorting, and pagination** for all list endpoints
- Ensure best practices in security, modularity, and maintainability

---

## 3. Roles & Permissions

| Role      | Description             | Permissions                                                                                                                                              |
| --------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customer  | End-user placing orders | View products (with filtering), Place orders, View own orders (with filtering), Cancel pending orders, Profile management                                |
| Seller    | Product owner           | Add/Edit/Delete products, View/manage own products (with filtering), View/manage related orders (with filtering), Profile management (requires approval) |
| Deliverer | Delivery agent          | View assigned deliveries, Update delivery status, Profile management (requires approval)                                                                 |
| Admin     | System administrator    | Approve/reject sellers & deliverers, Manage all users/customers/sellers/deliverers (with filtering), View analytics, Assign deliverers to orders         |

---

## 4. Database Schema (Collections)

### Users Collection

```
users {
  _id (PK)
  email (unique, required, lowercase, validated)
  password (hashed with bcrypt, required, minlength: 6)
  role: 'customer' | 'seller' | 'deliverer' | 'admin' (required, default: 'customer')
  isActive: Boolean (default: true)
  createdAt
  updatedAt
}
```

**Key Points:**

- Single `role` field (not array) - one user can have only one role
- `isActive` boolean instead of status string
- Email must be unique across all users
- Password is automatically hashed before saving

### Customers Collection

```
customers {
  _id (PK)
  userId (FK → users, unique, required)
  fullName (required)
  phone (required)
  address (required)
  status: 'pending' | 'approved' | 'rejected' (default: 'approved')
  reason (optional, for rejection)
  verifiedAt (optional, timestamp when approved)
  createdAt
  updatedAt
}
```

**Key Points:**

- Customers are approved by default
- Approval status stored in profile, not in User model

### Sellers Collection

```
sellers {
  _id (PK)
  userId (FK → users, unique, required)
  shopName (required)
  documents (array of strings, default: [])
  status: 'pending' | 'approved' | 'rejected' (default: 'pending')
  reason (optional, for rejection)
  verifiedAt (optional, timestamp when approved)
  createdAt
  updatedAt
}
```

**Key Points:**

- Sellers require admin approval before they can login
- Approval status stored in profile model

### Deliverers Collection

```
deliverers {
  _id (PK)
  userId (FK → users, unique, required)
  fullName (required)
  licenseNumber (required)
  NIC (required)
  status: 'pending' | 'approved' | 'rejected' (default: 'pending')
  reason (optional, for rejection)
  verifiedAt (optional, timestamp when approved)
  createdAt
  updatedAt
}
```

**Key Points:**

- Deliverers require admin approval before they can login
- Approval status stored in profile model

### Products Collection

```
products {
  _id (PK)
  sellerId (FK → sellers, required)
  name (required)
  description (optional)
  price (required, min: 0)
  stock (required, min: 0, default: 0)
  category (optional, string)
  rating (optional, min: 0, max: 5, default: 0)
  createdAt
  updatedAt
}
```

**Key Points:**

- Added `category` and `rating` fields for better filtering
- Stock is automatically decremented when order is placed

### Orders Collection

```
orders {
  _id (PK)
  customerId (FK → customers, required)
  products: [{
    productId (FK → products, required)
    quantity (required, min: 1)
    price (required, min: 0)
  }]
  totalPrice (required, min: 0)
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' (default: 'pending')
  assignedDelivererId (FK → deliverers, optional)
  createdAt
  updatedAt
}
```

**Key Points:**

- Products array stores snapshot of product details at time of order
- Stock is decremented when order is created
- Stock is restored when order is cancelled

### Deliveries Collection

```
deliveries {
  _id (PK)
  orderId (FK → orders, required)
  delivererId (FK → deliverers, required)
  status: 'pending' | 'in-transit' | 'delivered' (default: 'pending')
  deliveryTime (optional)
  createdAt
  updatedAt
}
```

### Analytics Collection (optional)

```
analytics {
  _id (PK)
  totalSales (Number)
  totalOrders (Number)
  salesBySeller: [{
    sellerId (FK → sellers)
    shopName (String)
    totalSales (Number)
  }]
  createdAt
  updatedAt
}
```

---

## 5. API Routes (Entity-Based)

### Auth Routes

```
POST /api/auth/register/customer
POST /api/auth/register/seller
POST /api/auth/register/deliverer
POST /api/auth/login
GET  /api/auth/me              (authenticated users)
PATCH /api/auth/me             (authenticated users - update own profile)
```

### Products Routes

```
POST   /api/products           (seller only, requires approval)
GET    /api/products           (public/customer/seller - with filtering, sorting, pagination)
GET    /api/products/:id      (public/customer/seller)
PATCH  /api/products/:id       (seller only, own products)
DELETE /api/products/:id       (seller only, own products)
```

**Query Parameters for GET /api/products:**

- `category` - Filter by category
- `minPrice`, `maxPrice` - Price range filter
- `minRating`, `maxRating` - Rating range filter
- `availability` - "inStock" or "outOfStock" (for customers)
- `stockStatus` - "low", "inStock", or "outOfStock" (for sellers)
- `search` - Search by name or description
- `sellerId` - Filter by seller ID (admin/public)
- `sort` - Sort fields (e.g., "price,-rating", default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Orders Routes

```
POST   /api/orders             (customer only)
GET    /api/orders             (role-based with filtering, sorting, pagination)
PATCH  /api/orders/:id        (customer: cancel, seller/admin: confirm, admin: assign deliverer)
```

**Query Parameters for GET /api/orders:**

- `status` - Filter by status (single or comma-separated: pending,confirmed,shipped,delivered,cancelled)
- `customerId` - Filter by customer ID (admin only)
- `sellerId` - Filter by seller ID (admin only)
- `minTotalPrice`, `maxTotalPrice` - Total price range filter
- `startDate`, `endDate` - Date range filter (ISO format: YYYY-MM-DD)
- `search` - Search by customer name, phone, or order ID
- `sort` - Sort fields (default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Role-based Access:**

- **Customer**: Only sees their own orders
- **Seller**: Only sees orders containing their products
- **Deliverer**: Only sees assigned orders
- **Admin**: Sees all orders

### Users Routes (Admin Only)

```
GET    /api/users              (with filtering, sorting, pagination)
GET    /api/users/:id          (get user with profile)
```

**Query Parameters for GET /api/users:**

- `role` - Filter by role (customer, seller, deliverer, admin)
- `isActive` - Filter by active status (true/false)
- `status` - Filter by profile approval status (pending, approved, rejected)
- `search` - Search by email
- `sort` - Sort fields (default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Customers Routes (Admin Only)

```
GET    /api/customers          (with filtering, sorting, pagination)
GET    /api/customers/:id      (get customer by ID)
```

**Query Parameters for GET /api/customers:**

- `status` - Filter by approval status (pending, approved, rejected)
- `isActive` - Filter by user active status (true/false)
- `search` - Search by fullName, phone, or address
- `sort` - Sort fields (default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Sellers Routes (Admin Only)

```
GET    /api/sellers            (with filtering, sorting, pagination)
GET    /api/sellers/:id        (get seller by ID)
PATCH  /api/sellers/:id/approve (approve seller)
PATCH  /api/sellers/:id/reject  (reject seller)
```

**Query Parameters for GET /api/sellers:**

- `status` - Filter by approval status (pending, approved, rejected)
- `isActive` - Filter by user active status (true/false)
- `search` - Search by shopName
- `sort` - Sort fields (default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Deliverers Routes (Admin Only)

```
GET    /api/deliverers         (with filtering, sorting, pagination)
GET    /api/deliverers/:id     (get deliverer by ID)
PATCH  /api/deliverers/:id/approve (approve deliverer)
PATCH  /api/deliverers/:id/reject  (reject deliverer)
```

**Query Parameters for GET /api/deliverers:**

- `status` - Filter by approval status (pending, approved, rejected)
- `isActive` - Filter by user active status (true/false)
- `search` - Search by fullName, licenseNumber, or NIC
- `sort` - Sort fields (default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Deliveries Routes (Deliverer Only)

```
GET    /api/deliveries         (get assigned deliveries)
PATCH  /api/deliveries/:id     (update delivery status)
```

### Analytics Routes (Admin Only)

```
GET    /api/analytics          (get system analytics)
```

---

## 6. Authentication & Authorization

### Authentication

- **JWT token-based authentication**
- Token generated on login/registration
- Token stored in `Authorization` header: `Bearer <token>`
- Password hashing with `bcryptjs` (10 rounds)
- Password comparison method in User model

### Authorization

- **Role-Based Access Control (RBAC)** per route
- Middleware: `authenticate` - verifies JWT token
- Middleware: `requireRole(...roles)` - checks user role
- Middleware: `requireApprovedSeller` - ensures seller is approved
- Middleware: `requireApprovedDeliverer` - ensures deliverer is approved
- Middleware: `authOptional` - allows public access but attaches user if authenticated

### User Model Structure

- **Single role per user** (not array)
- **isActive boolean** for account status (not string)
- **Email uniqueness** enforced at database level
- **Password hashing** via pre-save hook

---

## 7. Approval Workflow

### Seller Approval

1. Seller registers → `status = 'pending'` in Seller profile
2. Admin reviews seller profile
3. Admin approves → `status = 'approved'`, `verifiedAt` set, `reason` cleared
4. Admin rejects → `status = 'rejected'`, `reason` set
5. Seller can login only if `status = 'approved'` and `isActive = true`

### Deliverer Approval

1. Deliverer registers → `status = 'pending'` in Deliverer profile
2. Admin reviews deliverer profile
3. Admin approves → `status = 'approved'`, `verifiedAt` set, `reason` cleared
4. Admin rejects → `status = 'rejected'`, `reason` set
5. Deliverer can login only if `status = 'approved'` and `isActive = true`

### Customer Approval

- Customers are **approved by default** (`status = 'approved'`)
- Admin can still reject customers if needed

### Approval Endpoints

- `PATCH /api/sellers/:id/approve` - Approve seller (admin only)
- `PATCH /api/sellers/:id/reject` - Reject seller with reason (admin only)
- `PATCH /api/deliverers/:id/approve` - Approve deliverer (admin only)
- `PATCH /api/deliverers/:id/reject` - Reject deliverer with reason (admin only)

---

## 8. Filtering, Sorting, and Pagination

### Filtering

All list endpoints support dynamic filtering based on query parameters:

- **Products**: category, price range, rating range, availability, stock status, search
- **Orders**: status, customer ID, seller ID, price range, date range, search
- **Users/Customers/Sellers/Deliverers**: role, isActive, status, search

### Sorting

- Default sorting: `updatedAt` descending (most recently updated first)
- Custom sorting via `sort` query parameter
- Multiple fields supported: `sort=price,-rating` (price ascending, rating descending)
- Prefix `-` for descending order

### Pagination

- Default page: 1
- Default limit varies by endpoint (Products: 20, Orders: 10, Users: 20)
- Response includes:
  - `count` - Number of items in current page
  - `total` - Total number of items matching filters
  - `totalPages` - Total number of pages
  - `currentPage` - Current page number
  - `data` - Array of items

### Response Format

```json
{
  "success": true,
  "count": 20,
  "total": 100,
  "totalPages": 5,
  "currentPage": 1,
  "data": [...]
}
```

---

## 9. Best Practices Applied

### Architecture

- **Entity-based route + controller structure** for scalability
- **Single role per user** (not array) for simplicity
- **Approval status in profile models** (not in User model)
- **Modular controllers** - each entity has its own controller
- **Separation of concerns** - approval logic in entity-specific controllers

### Code Quality

- **ESM pattern** throughout (no CommonJS)
- **RESTful route conventions**
- **Partial updates via PATCH** for approve/reject or updates
- **Clean error handling** with centralized error middleware
- **Password hashing** via Mongoose pre-save hook
- **Email uniqueness** enforced at schema level
- **Input validation** via Mongoose schema validators

### Security

- **JWT token-based authentication**
- **Role-based access control (RBAC)**
- **Password hashing** with bcryptjs
- **Token verification** on protected routes
- **Approval workflow** for sellers and deliverers

### Scalability

- **Filtering, sorting, pagination** for all list endpoints
- **Dynamic query building** based on query parameters
- **Role-based data access** (users see only their data)
- **Modular structure** - easy to add new entities
- **Entity-specific controllers** - easy to maintain

---

## 10. Project Folder Structure

```
/
├── .env
├── .gitignore
├── package.json
├── online_order_system_prd.md
├── DEMO.md
└── src/
    ├── server.js
    ├── config/
    │   ├── db.js
    │   └── jwtConfig.js
    ├── models/
    │   ├── User.js
    │   ├── Customer.js
    │   ├── Seller.js
    │   ├── Deliverer.js
    │   ├── Product.js
    │   ├── Order.js
    │   ├── Delivery.js
    │   └── Analytics.js
    ├── controllers/
    │   ├── authController.js
    │   ├── productsController.js
    │   ├── ordersController.js
    │   ├── deliveriesController.js
    │   ├── analyticsController.js
    │   ├── usersController.js
    │   ├── customerController.js
    │   ├── sellerController.js
    │   └── delivererController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── productsRoutes.js
    │   ├── ordersRoutes.js
    │   ├── deliveriesRoutes.js
    │   ├── analyticsRoutes.js
    │   ├── usersRoutes.js
    │   ├── customersRoutes.js
    │   ├── sellersRoutes.js
    │   ├── deliverersRoutes.js
    │   └── index.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── roleMiddleware.js
    │   └── errorMiddleware.js
    └── seeders/
        ├── adminSeeder.js
        ├── sampleDataSeeder.js
        └── clearData.js
```

---

## 11. Seeders

### Admin Seeder

- Creates initial admin user
- Email: `admin@gmail.com`
- Password: `Admin@123`
- Role: `admin`
- Command: `npm run seed:admin`

### Sample Data Seeder

- Creates sample data for all entities:
  - Customers (2)
  - Sellers (2, approved)
  - Deliverers (2, approved)
  - Products (multiple)
  - Orders (multiple)
  - Deliveries (multiple)
- Command: `npm run seed:sample`

### Clear Data Script

- Clears all data from database
- Command: `npm run clear:data`

### Combined Commands

- `npm run seed:all` - Runs both admin and sample data seeders

---

## 12. Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "count": 20,
  "total": 100,
  "totalPages": 5,
  "currentPage": 1,
  "data": [ ... ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 13. Key Implementation Details

### User Model

- **Single role**: `role: String` (not array)
- **Active status**: `isActive: Boolean` (not string)
- **Password hashing**: Automatic via pre-save hook
- **Email uniqueness**: Enforced at schema level

### Profile Models

- **Approval status**: Stored in profile models (Customer, Seller, Deliverer)
- **Fields**: `status`, `reason`, `verifiedAt`
- **Default values**: Customers approved by default, Sellers/Deliverers pending by default

### Filtering & Sorting

- **Dynamic query building** based on query parameters
- **Role-based filtering** - users see only their data
- **Default sorting**: `updatedAt` descending
- **Multi-field sorting** supported

### Approval Logic

- **Entity-specific controllers** handle approval/rejection
- **Routes**: `/api/sellers/:id/approve`, `/api/sellers/:id/reject`, etc.
- **Admin only** access for approval endpoints

---

## 14. Summary

### Core Features

- ✅ **Multi-role authentication** with single role per user
- ✅ **Entity-based architecture** with modular controllers
- ✅ **Approval workflow** for sellers and deliverers
- ✅ **Filtering, sorting, and pagination** for all list endpoints
- ✅ **Role-based access control (RBAC)**
- ✅ **JWT token-based authentication**
- ✅ **Password hashing** with bcryptjs
- ✅ **Email uniqueness** enforcement
- ✅ **Seeders** for development and testing

### Architecture Highlights

- **Single role per user** (simplified from multi-role)
- **Approval status in profile models** (not in User model)
- **isActive boolean** for account status (not string)
- **Entity-specific controllers** for maintainability
- **Dynamic filtering, sorting, pagination** for scalability
- **Default sorting by updatedAt** (most recent first)

### Production Ready

- ✅ Error handling middleware
- ✅ Input validation
- ✅ Security best practices
- ✅ Modular, maintainable code
- ✅ Comprehensive documentation (PRD + DEMO.md)

---

**End of PRD - Online Order System**
