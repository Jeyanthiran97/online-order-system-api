# Online Order System API - Demo Documentation v3

## Base URL

`http://localhost:3000/api`

---

## Authentication Routes

### 1. Register Customer

**POST** `/auth/register/customer`

**Request Body:**

`json
{
  "email": "customer@example.com",
  "password": "Customer@123",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, Country"
}
`

**Response:**

`json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "customer@example.com",
      "role": "customer"
    }
  }
}
`

---

### 2. Register Seller

**POST** `/auth/register/seller`

**Request Body:**

`json
{
  "email": "seller@example.com",
  "password": "Seller@123",
  "shopName": "Tech Store",
  "documents": ["license.pdf", "certificate.pdf"]
}
`

**Response:**

`json
{
  "success": true,
  "message": "Seller registration submitted. Waiting for admin approval."
}
`

---

### 3. Register Deliverer

**POST** `/auth/register/deliverer`

**Request Body:**

`json
{
  "email": "deliverer@example.com",
  "password": "Deliverer@123",
  "fullName": "Mike Johnson",
  "licenseNumber": "DL123456",
  "NIC": "NIC123456789"
}
`

**Response:**

`json
{
  "success": true,
  "message": "Deliverer registration submitted. Waiting for admin approval."
}
`

---

### 4. Login

**POST** `/auth/login`

**Request Body:**

`json
{
  "email": "admin@gmail.com",
  "password": "Admin@123"
}
`

**Response:**

`json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@gmail.com",
      "role": "admin"
    }
  }
}
`

---

### 5. Get Current User Profile

**GET** `/auth/me`

**Headers:**

`Authorization: Bearer <token>`

**Response:**

`json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "customer@example.com",
      "role": "customer",
      "isActive": true
    },
    "profile": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St, City, Country"
    }
  }
}
`

---

### 6. Update Current User Profile

**PATCH** `/auth/me`

**Headers:**

`Authorization: Bearer <token>`

**Request Body (Customer):**

`json
{
  "fullName": "John Smith",
  "phone": "+9876543210",
  "address": "456 New St, City, Country"
}
`

**Request Body (Seller):**

`json
{
  "shopName": "Updated Shop Name",
  "documents": ["new-license.pdf"]
}
`

**Request Body (Deliverer):**

`json
{
  "fullName": "Mike Williams",
  "licenseNumber": "DL789012",
  "NIC": "NIC987654321"
}
`

---

## Products Routes

### 1. Create Product (Seller Only)

**POST** `/products`

**Headers:**

`Authorization: Bearer <token>`

**Request Body:**

`json
{
  "name": "Laptop",
  "description": "High-performance laptop for work and gaming",
  "price": 999.99,
  "stock": 50,
  "category": "electronics",
  "rating": 4.5
}
`

**Response:**

`json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "sellerId": "507f1f77bcf86cd799439015",
    "name": "Laptop",
    "description": "High-performance laptop for work and gaming",
    "price": 999.99,
    "stock": 50,
    "category": "electronics",
    "rating": 4.5,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
`

---

### 2. Get All Products (With Filtering, Sorting, Pagination)

**GET** `/products`

**Query Parameters:**

- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `minRating` - Minimum rating
- `maxRating` - Maximum rating
- `availability` - "inStock" or "outOfStock" (for customers)
- `stockStatus` - "low", "inStock", or "outOfStock" (for sellers)
- `search` - Search by name or description
- `sellerId` - Filter by seller ID (admin/public)
- `sort` - Sort fields (e.g., "price,-rating")
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Examples:**

**Get all products (default):**

`GET /api/products`

**Filter by category and price range:**

`GET /api/products?category=electronics&minPrice=100&maxPrice=1000`

**Search products:**

`GET /api/products?search=laptop`

**Filter by rating:**

`GET /api/products?minRating=4&maxRating=5`

**Filter in-stock products:**

`GET /api/products?availability=inStock`

**Sort by price ascending, then rating descending:**

`GET /api/products?sort=price,-rating`

**Full example with all filters:**

`GET /api/products?category=electronics&minPrice=100&maxPrice=1000&minRating=4&availability=inStock&search=laptop&sort=-rating,price&page=1&limit=20`

**Response:**

`json
{
  "success": true,
  "count": 20,
  "total": 100,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "sellerId": {
        "_id": "507f1f77bcf86cd799439015",
        "shopName": "Tech Store"
      },
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 999.99,
      "stock": 50,
      "category": "electronics",
      "rating": 4.5,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
`

---

### 3. Get Product By ID

**GET** `/products/:id`

**Example:**

`GET /api/products/507f1f77bcf86cd799439020`

**Response:**

`json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "sellerId": {
      "_id": "507f1f77bcf86cd799439015",
      "shopName": "Tech Store"
    },
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "stock": 50,
    "category": "electronics",
    "rating": 4.5
  }
}
`

---

### 4. Update Product (Seller Only)

**PATCH** `/products/:id`

**Headers:**

`Authorization: Bearer <token>`

**Request Body:**

`json
{
  "name": "Updated Laptop",
  "description": "Updated description",
  "price": 899.99,
  "stock": 45,
  "category": "electronics",
  "rating": 4.7
}
`

---

### 5. Delete Product (Seller Only)

**DELETE** `/products/:id`

**Headers:**

`Authorization: Bearer <token>`

---

## Orders Routes

### 1. Create Order (Customer Only)

**POST** `/orders`

**Headers:**

`Authorization: Bearer <token>`

**Request Body:**

`json
{
  "products": [
    {
      "productId": "507f1f77bcf86cd799439020",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439021",
      "quantity": 1
    }
  ]
}
`

**Response:**

`json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "customerId": {
      "_id": "507f1f77bcf86cd799439012",
      "fullName": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St, City, Country"
    },
    "products": [
      {
        "productId": {
          "_id": "507f1f77bcf86cd799439020",
          "name": "Laptop",
          "description": "High-performance laptop",
          "price": 999.99
        },
        "quantity": 2,
        "price": 999.99
      }
    ],
    "totalPrice": 1999.98,
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
`

---

### 2. Get All Orders (With Filtering, Sorting, Pagination)

**GET** `/orders`

**Headers:**

`Authorization: Bearer <token>`

**Query Parameters:**

- `status` - Filter by status (pending, confirmed, shipped, delivered, cancelled) or comma-separated
- `customerId` - Filter by customer ID (admin only)
- `sellerId` - Filter by seller ID (admin only)
- `minTotalPrice` - Minimum total price
- `maxTotalPrice` - Maximum total price
- `startDate` - Start date (ISO format: YYYY-MM-DD)
- `endDate` - End date (ISO format: YYYY-MM-DD)
- `search` - Search by customer name, phone, or order ID
- `sort` - Sort fields (e.g., "-createdAt,totalPrice")
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Examples:**

**Get all orders (role-based):**

`GET /api/orders`

**Filter by status:**

`GET /api/orders?status=pending`

**Filter by multiple statuses:**

`GET /api/orders?status=pending,confirmed`

**Filter by date range:**

`GET /api/orders?startDate=2024-01-01&endDate=2024-01-31`

**Filter by total price range:**

`GET /api/orders?minTotalPrice=100&maxTotalPrice=1000`

**Search orders:**

`GET /api/orders?search=john`

**Sort by creation date descending:**

`GET /api/orders?sort=-createdAt`

**Full example:**

`GET /api/orders?status=pending,confirmed&startDate=2024-01-01&endDate=2024-01-31&minTotalPrice=100&sort=-createdAt&page=1&limit=10`

**Response:**

`json
{
  "success": true,
  "count": 10,
  "total": 50,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "customerId": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "John Doe",
        "phone": "+1234567890",
        "address": "123 Main St"
      },
      "products": [...],
      "totalPrice": 1999.98,
      "status": "pending",
      "assignedDelivererId": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
`

---

### 3. Update Order

**PATCH** `/orders/:id`

**Headers:**

`Authorization: Bearer <token>`

**Request Body (Customer - Cancel Order):**

`json
{
  "status": "cancelled"
}
`

**Request Body (Seller/Admin - Confirm Order):**

`json
{
  "status": "confirmed"
}
`

**Request Body (Admin - Assign Deliverer):**

`json
{
  "status": "shipped",
  "assignedDelivererId": "507f1f77bcf86cd799439025"
}
`

---

## Users Routes (Admin Only)

### 1. Get All Users (Aggregated View)

**GET** `/users`

**Headers:**

`Authorization: Bearer <token>`

**Query Parameters:**

- `role` - Filter by role (customer, seller, deliverer, admin)
- `isActive` - Filter by active status (true/false)
- `status` - Filter by approval status (pending, approved, rejected)
- `search` - Search by email
- `sort` - Sort fields (default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Examples:**

**Get all users:**

`GET /api/users`

**Filter by role:**

`GET /api/users?role=seller`

**Filter by active status:**

`GET /api/users?isActive=true`

**Filter by approval status:**

`GET /api/users?status=pending`

**Search by email:**

`GET /api/users?search=example.com`

**Full example:**

`GET /api/users?role=seller&status=pending&isActive=true&search=shop&sort=-updatedAt&page=1&limit=20`

**Response:**

`json
{
  "success": true,
  "count": 20,
  "total": 100,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "user": {
        "id": "507f1f77bcf86cd799439011",
        "email": "seller@example.com",
        "role": "seller",
        "isActive": true,
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      },
      "profile": {
        "_id": "507f1f77bcf86cd799439015",
        "shopName": "Tech Store",
        "status": "pending"
      }
    }
  ]
}
`

---

### 2. Get User By ID

**GET** `/users/:id`

**Example:**

`GET /api/users/507f1f77bcf86cd799439011`

---

## Customers Routes (Admin Only)

### 1. Get All Customers

**GET** `/customers`

**Headers:**

`Authorization: Bearer <token>`

**Query Parameters:**

- `status` - Filter by approval status (pending, approved, rejected)
- `isActive` - Filter by user active status (true/false)
- `search` - Search by fullName, phone, or address
- `sort` - Sort fields (default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Examples:**

**Get all customers:**

`GET /api/customers`

**Filter by approval status:**

`GET /api/customers?status=approved`

**Search customers:**

`GET /api/customers?search=john`

**Full example:**

`GET /api/customers?status=approved&isActive=true&search=doe&sort=-updatedAt&page=1&limit=20`

**Response:**

`json
{
  "success": true,
  "count": 20,
  "total": 100,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "email": "customer@example.com",
        "role": "customer",
        "isActive": true,
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      "fullName": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main St, City, Country",
      "status": "approved",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
`

---

### 2. Get Customer By ID

**GET** `/customers/:id`

**Example:**

`GET /api/customers/507f1f77bcf86cd799439012`

---

## Sellers Routes (Admin Only)

### 1. Get All Sellers

**GET** `/sellers`

**Headers:**

`Authorization: Bearer <token>`

**Query Parameters:**

- `status` - Filter by approval status (pending, approved, rejected)
- `isActive` - Filter by user active status (true/false)
- `search` - Search by shopName
- `sort` - Sort fields (default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Examples:**

**Get all sellers:**

`GET /api/sellers`

**Get pending sellers:**

`GET /api/sellers?status=pending`

**Get approved sellers:**

`GET /api/sellers?status=approved`

**Search sellers:**

`GET /api/sellers?search=tech`

**Full example:**

`GET /api/sellers?status=pending&isActive=true&search=store&sort=-createdAt&page=1&limit=20`

**Response:**

`json
{
  "success": true,
  "count": 20,
  "total": 50,
  "totalPages": 3,
  "currentPage": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "userId": {
        "_id": "507f1f77bcf86cd799439014",
        "email": "seller@example.com",
        "role": "seller",
        "isActive": true,
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      "shopName": "Tech Store",
      "documents": ["license.pdf"],
      "status": "pending",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
`

---

### 2. Get Seller By ID

**GET** `/sellers/:id`

**Example:**

`GET /api/sellers/507f1f77bcf86cd799439015`

---

### 3. Approve Seller

**PATCH** `/sellers/:id/approve`

**Headers:**

`Authorization: Bearer <token>`

**Request Body:** (No body required)

**Response:**

`json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "status": "approved",
    "verifiedAt": "2024-01-15T10:00:00.000Z",
    "reason": null
  }
}
`

---

### 4. Reject Seller

**PATCH** `/sellers/:id/reject`

**Headers:**

`Authorization: Bearer <token>`

**Request Body:**

`json
{
  "reason": "Incomplete documentation"
}
`

**Response:**

`json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "status": "rejected",
    "reason": "Incomplete documentation"
  }
}
`

---

## Deliverers Routes (Admin Only)

### 1. Get All Deliverers

**GET** `/deliverers`

**Headers:**

`Authorization: Bearer <token>`

**Query Parameters:**

- `status` - Filter by approval status (pending, approved, rejected)
- `isActive` - Filter by user active status (true/false)
- `search` - Search by fullName, licenseNumber, or NIC
- `sort` - Sort fields (default: updatedAt descending)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Examples:**

**Get all deliverers:**

`GET /api/deliverers`

**Get pending deliverers:**

`GET /api/deliverers?status=pending`

**Search deliverers:**

`GET /api/deliverers?search=mike`

**Full example:**

`GET /api/deliverers?status=approved&isActive=true&search=john&sort=-updatedAt&page=1&limit=20`

**Response:**

`json
{
  "success": true,
  "count": 20,
  "total": 30,
  "totalPages": 2,
  "currentPage": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439025",
      "userId": {
        "_id": "507f1f77bcf86cd799439024",
        "email": "deliverer@example.com",
        "role": "deliverer",
        "isActive": true,
        "createdAt": "2024-01-15T10:00:00.000Z"
      },
      "fullName": "Mike Johnson",
      "licenseNumber": "DL123456",
      "NIC": "NIC123456789",
      "status": "approved",
      "verifiedAt": "2024-01-15T10:00:00.000Z",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
`

---

### 2. Get Deliverer By ID

**GET** `/deliverers/:id`

**Example:**

`GET /api/deliverers/507f1f77bcf86cd799439025`

---

### 3. Approve Deliverer

**PATCH** `/deliverers/:id/approve`

**Headers:**

`Authorization: Bearer <token>`

**Request Body:** (No body required)

---

### 4. Reject Deliverer

**PATCH** `/deliverers/:id/reject`

**Headers:**

`Authorization: Bearer <token>`

**Request Body:**

`json
{
  "reason": "Invalid license number"
}
`

---

## Deliveries Routes (Deliverer Only)

### 1. Get All Deliveries

**GET** `/deliveries`

**Headers:**

`Authorization: Bearer <token>`

**Response:**

`json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "orderId": {
        "_id": "507f1f77bcf86cd799439030",
        "totalPrice": 1999.98,
        "status": "shipped",
        "products": [...],
        "customerId": {
          "fullName": "John Doe",
          "phone": "+1234567890",
          "address": "123 Main St"
        }
      },
      "delivererId": "507f1f77bcf86cd799439025",
      "status": "in-transit",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
`

---

### 2. Update Delivery Status

**PATCH** `/deliveries/:id`

**Headers:**

`Authorization: Bearer <token>`

**Request Body:**

`json
{
  "status": "delivered"
}
`

**Valid statuses:** `pending`, `in-transit`, `delivered`

---

## Analytics Routes (Admin Only)

### 1. Get Analytics

**GET** `/analytics`

**Headers:**

`Authorization: Bearer <token>`

**Response:**

`json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "completedOrders": 120,
    "totalSales": 50000.5,
    "salesBySeller": [
      {
        "sellerId": "507f1f77bcf86cd799439015",
        "shopName": "Tech Store",
        "totalSales": 30000.0
      },
      {
        "sellerId": "507f1f77bcf86cd799439016",
        "shopName": "Fashion Boutique",
        "totalSales": 20000.5
      }
    ]
  }
}
`

---

## Complete Route Summary

### Authentication

- `POST /api/auth/register/customer` - Register customer
- `POST /api/auth/register/seller` - Register seller
- `POST /api/auth/register/deliverer` - Register deliverer
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile
- `PATCH /api/auth/me` - Update current user profile

### Products

- `POST /api/products` - Create product (Seller)
- `GET /api/products` - Get all products (Public/Customer/Seller) - **With filtering, sorting, pagination**
- `GET /api/products/:id` - Get product by ID
- `PATCH /api/products/:id` - Update product (Seller)
- `DELETE /api/products/:id` - Delete product (Seller)

### Orders

- `POST /api/orders` - Create order (Customer)
- `GET /api/orders` - Get all orders (Role-based) - **With filtering, sorting, pagination**
- `PATCH /api/orders/:id` - Update order (Customer/Seller/Admin)

### Users (Admin Only)

- `GET /api/users` - Get all users - **With filtering, sorting, pagination**
- `GET /api/users/:id` - Get user by ID

### Customers (Admin Only)

- `GET /api/customers` - Get all customers - **With filtering, sorting, pagination**
- `GET /api/customers/:id` - Get customer by ID

### Sellers (Admin Only)

- `GET /api/sellers` - Get all sellers - **With filtering, sorting, pagination**
- `GET /api/sellers/:id` - Get seller by ID
- `PATCH /api/sellers/:id/approve` - Approve seller
- `PATCH /api/sellers/:id/reject` - Reject seller

### Deliverers (Admin Only)

- `GET /api/deliverers` - Get all deliverers - **With filtering, sorting, pagination**
- `GET /api/deliverers/:id` - Get deliverer by ID
- `PATCH /api/deliverers/:id/approve` - Approve deliverer
- `PATCH /api/deliverers/:id/reject` - Reject deliverer

### Deliveries (Deliverer Only)

- `GET /api/deliveries` - Get all deliveries
- `PATCH /api/deliveries/:id` - Update delivery status

### Analytics (Admin Only)

- `GET /api/analytics` - Get analytics

---

## Filtering, Sorting, and Pagination Examples

### Products Filtering Examples

**1. Basic filtering:**

`GET /api/products?category=electronics&minPrice=100&maxPrice=1000`

**2. Search and filter:**

`GET /api/products?search=laptop&minRating=4&availability=inStock`

**3. Sorting:**

`GET /api/products?sort=price,-rating`

**4. Full example with pagination:**

`GET /api/products?category=electronics&minPrice=100&maxPrice=1000&minRating=4&search=laptop&sort=-rating,price&page=2&limit=10`

### Orders Filtering Examples

**1. Filter by status:**

`GET /api/orders?status=pending`

**2. Filter by date range:**

`GET /api/orders?startDate=2024-01-01&endDate=2024-01-31`

**3. Filter by price range:**

`GET /api/orders?minTotalPrice=100&maxTotalPrice=500`

**4. Multiple statuses:**

`GET /api/orders?status=pending,confirmed,shipped`

**5. Full example:**

`GET /api/orders?status=pending,confirmed&startDate=2024-01-01&endDate=2024-01-31&minTotalPrice=100&sort=-createdAt&page=1&limit=10`

### Users/Customers/Sellers/Deliverers Filtering Examples

**1. Filter by approval status:**

`GET /api/sellers?status=pending
GET /api/deliverers?status=approved
GET /api/customers?status=approved`

**2. Filter by active status:**

`GET /api/users?isActive=true
GET /api/sellers?isActive=false`

**3. Search:**

`GET /api/sellers?search=tech
GET /api/customers?search=john
GET /api/deliverers?search=mike`

**4. Combined filters:**

`GET /api/sellers?status=pending&isActive=true&search=store&sort=-updatedAt&page=1&limit=20`

---

## Authentication Header

All protected routes require:

`Authorization: Bearer <your-jwt-token>`

---

## Response Format

### Success Response

`json
{
  "success": true,
  "data": { ... }
}
`

### Paginated Response

`json
{
  "success": true,
  "count": 20,
  "total": 100,
  "totalPages": 5,
  "currentPage": 1,
  "data": [ ... ]
}
`

### Error Response

`json
{
  "success": false,
  "error": "Error message"
}
`

---

## Testing Credentials

**Admin:**

- Email: `admin@gmail.com`
- Password: `Admin@123`

**Customer:**

- Email: `customer1@example.com`
- Password: `Customer@123`

**Seller:**

- Email: `seller1@example.com`
- Password: `Seller@123`

**Deliverer:**

- Email: `deliverer1@example.com`
- Password: `Deliverer@123`

---

## Quick Start for Demo

1. **Start the server:**

   `bash
npm start
`

2. **Seed the database:**

   `bash
npm run seed:all
`

3. **Login as admin:**

   `bash
POST /api/auth/login
Body: { "email": "admin@gmail.com", "password": "Admin@123" }
`

4. **Test filtering:**
   `bash
GET /api/products?category=electronics&minPrice=100&sort=-rating&page=1&limit=10
GET /api/orders?status=pending&sort=-createdAt&page=1&limit=10
GET /api/sellers?status=pending&isActive=true
`

---

**End of Demo Documentation**
