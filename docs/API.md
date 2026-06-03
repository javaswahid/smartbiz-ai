# SmartBiz AI REST API Documentation

Base URL: `http://localhost:5000/api/v1`

All responses return JSON. Secure endpoints require a bearer JWT token in the `Authorization` header: `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication & Onboarding

### 1.1 Register Owner & Tenant
- **Endpoint**: `POST /auth/register`
- **Access**: Public
- **Description**: Registers a new business (Tenant) and its first Owner user.
- **Request Body**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@tokomakmur.com",
    "password": "Password123!",
    "businessName": "Toko Makmur Jaya",
    "businessCategory": "Retail",
    "businessScale": "Mikro",
    "address": "Jl. Sudirman No. 45, Jakarta",
    "phone": "081234567890"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "success": true,
    "message": "Tenant and owner registered successfully",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "u-uuid-123",
      "name": "Budi Santoso",
      "email": "budi@tokomakmur.com",
      "role": "OWNER",
      "tenantId": "t-uuid-456"
    }
  }
  ```

### 1.2 User Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "budi@tokomakmur.com",
    "password": "Password123!"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": {
      "id": "u-uuid-123",
      "name": "Budi Santoso",
      "role": "OWNER",
      "tenantId": "t-uuid-456"
    }
  }
  ```

---

## 2. Product Inventory Module

### 2.1 Get All Products (with Stock Alert indicator)
- **Endpoint**: `GET /products`
- **Access**: Authenticated (Owner, Admin, Staff)
- **Query Params**:
  - `page`: default 1
  - `limit`: default 10
  - `search`: search by name/SKU
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "p-uuid-999",
        "name": "Kopi Susu Gula Aren",
        "sku": "KS-GA-01",
        "category": "Minuman",
        "price": 18000.00,
        "cost": 8000.00,
        "stock": 5,
        "minStockThreshold": 10,
        "isLowStock": true,
        "createdAt": "2026-06-03T12:00:00Z"
      }
    ],
    "pagination": { "page": 1, "totalPages": 1, "totalItems": 1 }
  }
  ```

### 2.2 Create Product
- **Endpoint**: `POST /products`
- **Access**: Authenticated (Owner, Admin)
- **Request Body**:
  ```json
  {
    "name": "Kopi Cappuccino",
    "sku": "KP-CP-02",
    "category": "Minuman",
    "price": 22000.00,
    "cost": 10000.00,
    "stock": 50,
    "minStockThreshold": 10
  }
  ```

---

## 3. Customer CRM & Loyalty Module

### 3.1 Get All Customers
- **Endpoint**: `GET /customers`
- **Access**: Authenticated (Owner, Admin, Staff)

### 3.2 Add Customer Loyalty Points
- **Endpoint**: `POST /customers/:id/loyalty/add`
- **Access**: Authenticated (Owner, Admin, Staff)
- **Request Body**:
  ```json
  { "points": 15 }
  ```

---

## 4. Sales & Transactions

### 4.1 Record Sales
- **Endpoint**: `POST /transactions`
- **Access**: Authenticated (Owner, Admin, Staff)
- **Request Body**:
  ```json
  {
    "customerId": "c-uuid-789",
    "discount": 5000.00,
    "tax": 10.00,
    "items": [
      {
        "productId": "p-uuid-999",
        "quantity": 2
      }
    ]
  }
  ```
- **Response** (201 Created): Generates invoice, updates inventory, triggers WhatsApp message mock, and accrues loyalty points.

### 4.2 Export Reports
- **Endpoint**: `GET /transactions/export`
- **Access**: Authenticated (Owner, Admin)
- **Query Params**: `format` (pdf or excel), `startDate`, `endDate`
- **Response**: Binary stream of PDF or Excel worksheet.

---

## 5. AI Business Capabilities

### 5.1 AI Chat Assistant (RAG)
- **Endpoint**: `POST /ai/chat`
- **Access**: Authenticated (Owner, Admin)
- **Request Body**:
  ```json
  { "message": "Produk apa yang paling memberikan keuntungan terbesar?" }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "reply": "Berdasarkan data Anda, 'Kopi Susu Gula Aren' (Untung Rp 10.000 per unit) menyumbang keuntungan kotor terbesar senilai Rp 1.500.000 bulan ini.",
    "sources": ["Database Sales Mei-Juni 2026"]
  }
  ```

### 5.2 AI Sales Prediction (30-day forecast)
- **Endpoint**: `GET /ai/predict-sales`
- **Access**: Authenticated (Owner)

### 5.3 AI Marketing Content Generator
- **Endpoint**: `POST /ai/marketing-content`
- **Access**: Authenticated (Owner, Admin)
- **Request Body**:
  ```json
  {
    "productId": "p-uuid-999",
    "channel": "Instagram",
    "tone": "Casual / Friendly"
  }
  ```
