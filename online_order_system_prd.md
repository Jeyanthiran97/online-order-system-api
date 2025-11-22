# Product Requirement Document (PRD) - Online Order System

---

## 1. Overview

This PRD defines the requirements for an **Online Order System** following industry-standard best practices for authentication, multi-role access, and entity-based architecture. The system will be built using **Node.js, Express, MongoDB, and Mongoose**.

## rules

1. use ESM pattern full project (don't use CommonJs anywhere)
   Eg: import express from 'express'
2. don't use icon when response (code should be as human write code)
3. setup all needed files to api implementation (.env, .gitignore...... etc)

4. for each set of changes make git commit
   for example:
   complete step by step(
   create server with console log,
   then connect monogodb,
   then create all routes with them controller,
   finnaly implement authentication after complete all CRUD)

---

## 2. Objective

- Provide a scalable online order system with multiple user roles:
  - Customer: Browse products, place orders
  - Seller: Add products, manage orders
  - Deliverer: Track deliveries, update delivery status
  - Admin: Approve sellers/deliverers, manage analytics
- Implement **multi-role authentication** and **entity-based routes**.
- Ensure best practices in security, modularity, and maintainability.

---

## 3. Roles & Permissions

| Role      | Description             | Permissions                                                                                  |
| --------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| Customer  | End-user placing orders | View products, Place orders, View order status, Profile management                           |
| Seller    | Product owner           | Add/Edit/Delete products, View/manage orders, Profile management, Approve inventory requests |
| Deliverer | Delivery agent          | View assigned deliveries, Update delivery status, Profile management                         |
| Admin     | System administrator    | Approve/reject sellers & deliverers, Manage users, View analytics                            |

---

## 4. Database Schema (Collections)

### Users Collection

```
users {
  _id (PK)
  email (unique)
  password (hashed)
  roles: ['customer','seller','deliverer','admin']
  status: 'active' | 'inactive'
  createdAt
  updatedAt
}
```

### Customers Collection

```
customers {
  _id (PK)
  userId (FK → users)
  fullName
  phone
  address
  createdAt
  updatedAt
}
```

### Sellers Collection

```
sellers {
  _id (PK)
  userId (FK → users)
  shopName
  documents
  status: 'pending' | 'approved' | 'rejected'
  reason
  verifiedAt
  createdAt
  updatedAt
}
```

### Deliverers Collection

```
deliverers {
  _id (PK)
  userId (FK → users)
  fullName
  licenseNumber
  NIC
  status: 'pending' | 'approved' | 'rejected'
  reason
  verifiedAt
  createdAt
  updatedAt
}
```

### Products Collection

```
products {
  _id (PK)
  sellerId (FK → sellers)
  name
  description
  price
  stock
  createdAt
  updatedAt
}
```

### Orders Collection

```
orders {
  _id (PK)
  customerId (FK → customers)
  products: [{ productId, quantity, price }]
  totalPrice
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  assignedDelivererId (FK → deliverers)
  createdAt
  updatedAt
}
```

### Deliveries Collection

```
deliveries {
  _id (PK)
  orderId (FK → orders)
  delivererId (FK → deliverers)
  status: 'pending' | 'in-transit' | 'delivered'
  deliveryTime
  createdAt
  updatedAt
}
```

### Analytics Collection (optional)

```
analytics {
  _id (PK)
  totalSales
  totalOrders
  salesBySeller: [{ sellerId, totalSales }]
  createdAt
  updatedAt
}
```

---

## 5. API Routes (Entity-Based)

### Auth Routes

```
POST /auth/register/customer
POST /auth/register/seller
POST /auth/register/deliverer
POST /auth/login
```

### Admin Routes

```
PATCH /admin/sellers/:id/approve
PATCH /admin/sellers/:id/reject
PATCH /admin/deliverers/:id/approve
PATCH /admin/deliverers/:id/reject
GET /admin/analytics
```

### Products Routes

```
POST /products       (seller only)
GET /products        (public + customer + seller)
GET /products/:id    (public + customer + seller)
PATCH /products/:id  (seller only)
DELETE /products/:id (seller only)
```

### Orders Routes

```
POST /orders             (customer only)
GET /orders              (customer: own orders, seller: related orders, deliverer: assigned deliveries)
PATCH /orders/:id        (customer: cancel, admin/seller: confirm)
```

### Deliveries Routes

```
GET /deliveries           (deliverer: assigned deliveries)
PATCH /deliveries/:id     (deliverer: update status)
```

### Users / Profile Routes

```
GET /users/me            (any logged-in user)
PATCH /users/me          (update profile)
```

---

## 6. Authentication & Authorization

- JWT token-based authentication
- Role-Based Access Control (RBAC) per route
- Optional public access routes with `authOptional` middleware
- Password hashing with bcrypt
- Single users collection + multiple profile tables for multi-role support

---

## 7. Approval Workflow

- Seller / Deliverer register → `status = pending`
- Admin approves → `status = approved`, `verifiedAt` timestamp set
- Admin rejects → `status = rejected`, reason logged
- User can login only if approved (for seller/deliverer)

---

## 8. Best Practices Applied

- Modular controller per entity
- Entity-based routes
- Partial updates via PATCH for approve/reject or updates
- RESTful route conventions
- Clean error handling
- Prevent duplicate emails
- Prevent multiple pending profiles for same role
- Scalable to add more entities in future

---

## 9. Project Folder Structure

```
/controllers
  authController.js
  productsController.js
  ordersController.js
  deliveriesController.js
  analyticsController.js
  usersController.js

/routes
  authRoutes.js
  productsRoutes.js
  ordersRoutes.js
  deliveriesRoutes.js
  analyticsRoutes.js
  usersRoutes.js
  index.js (import all routes here then use in server.js)

/models
  User.js
  Customer.js
  Seller.js
  Deliverer.js
  Product.js
  Order.js
  Delivery.js
  Analytics.js

/middlewares
  authMiddleware.js
  roleMiddleware.js
  errorMiddleware.js (centralize all validation error by mongoose schema: user structure error message)

/config
  db.js
  jwtConfig.js

/server.js
```

---

## 10. Summary

- **Entity-based route + controller structure** for scalability
- **Single users collection + multiple profiles** for multi-role authentication
- **RBAC middleware** per route
- **Public and login-required routes** supported
- **Approval workflow** for sellers and deliverers
- **Best practices** applied for modular, production-ready code

---

**End of PRD - Online Order System**
