# Software Requirement Specification (SRS)

## Project: SmartBiz AI

SmartBiz AI is a multi-tenant, cloud-based SaaS platform designed to empower Indonesian Micro, Small, and Medium Enterprises (UMKM/MSMEs) with AI-driven analytics, customer relationship management (CRM), financial tracking, and smart business insights.

---

## 1. System Overview

SmartBiz AI bridges the gap between raw business data and actionable strategies. By integrating standard ERP functionalities (sales, inventory, customers) with modern LLM capabilities (generative insights, sales forecasting, conversational AI assistants), UMKM owners can professionalize their operations and scale.

---

## 2. Actors & Authorization (RBAC)

The system supports strict multi-tenancy, where each UMKM operates as a distinct `Tenant` with isolated data. Within each tenant, user actions are restricted using Role-Based Access Control (RBAC):

1. **Owner**: 
   - Full access to the tenant.
   - Subscription management, API key configurations, and user management (inviting/deleting Admin & Staff).
   - High-level financial reporting and strategic AI insights.
2. **Admin**:
   - Manages product inventory, customers, and sales transactions.
   - Access to dashboards, CRM tools, standard financial logs, and chatbot.
   - Cannot delete the tenant account or modify billing information.
3. **Staff**:
   - Record sales, view product list/stock, and log customer info.
   - No access to aggregate financial reports, sales predictions, or employee management.

---

## 3. Functional Requirements

### 3.1. Authentication & Onboarding
- **RF-01**: Secure Email/Password registration and login.
- **RF-02**: Google OAuth login.
- **RF-03**: Tenant Creation: Upon sign-up, owners must register their business profile (Name, Category, Location, Scale).
- **RF-04**: Multi-Tenant Route Guard: Middleware must verify that the user's session corresponds to their authorized tenant.

### 3.2. Dashboard & KPI Tracker
- **RF-05**: Display key performance indicators: Total Revenue, Gross Profit, Total Products, Customer Count, and Low-Stock Warnings.
- **RF-06**: Interactive graphs showing daily/weekly sales trends.
- **RF-07**: Real-time activity logs and audit logs of critical changes.

### 3.3. Product & Inventory Management
- **RF-08**: CRUD operations for products (Name, SKU, Category, Price, Cost, Stock, Image).
- **RF-09**: **Inventory Stock Alert**: Automatic warnings on the dashboard and via WhatsApp if stock levels fall below a configurable threshold.

### 3.4. Customer Management (CRM) & Loyalty
- **RF-10**: CRUD operations for customers (Name, Phone, Email, Purchase History).
- **RF-11**: **Loyalty Program**: Automatic point calculation based on purchase value (e.g., 1 point per IDR 10,000 spent). Ability to configure discount redemptions.

### 3.5. Sales & Finance Management
- **RF-12**: Record new sales transactions (cashier interface with multiple items, tax, discount, customer association).
- **RF-13**: Financial ledger tracking Income, Expenses, and Net Profits.
- **RF-14**: **Report Exporting**: Export monthly ledger, profit-and-loss statements, and inventory sheets to PDF and Excel/CSV formats.

### 3.6. AI Features
- **RF-15**: **AI Chat Assistant (RAG)**: Chatbot interface where users ask questions about their business (e.g., "Produk apa yang paling laku bulan lalu?"). Uses embedding-based lookup from their sales database and uploaded files.
- **RF-16**: **AI Sales Prediction**: Linear or time-series prediction models projecting the next 30 days of sales based on historical data.
- **RF-17**: **AI Business Insight Generator**: Automated monthly reports parsing key figures and outputting executive summaries with recommendations (e.g., "Revenue is up 12%, but stock turnover for item X is slow. Consider a bundle promotion").
- **RF-18**: **AI Marketing Content Generator**: Generation of promotional texts (Instagram caption, WhatsApp broadcast) based on product data, price, and custom tone.

### 3.7. System Notifications
- **RF-19**: **WhatsApp Integration**: Dispatching stock alerts, invoices to customers, or loyalty point balance updates via external APIs (Fonnte/Twilio).
- **RF-20**: In-app notifications banner.

---

## 4. Non-Functional Requirements

### 4.1. Security
- **RN-01**: Secure password hashing using bcrypt.
- **RN-02**: JWT session authentication with a short expiry (e.g., 2 hours) and refresh tokens.
- **RN-03**: CORS protection allowing only trusted domains.
- **RN-04**: Express rate-limiting to prevent brute force.
- **RN-05**: SQL Injection protection using Prisma ORM (prepared statements).
- **RN-06**: Input sanitization and Schema Validation using Zod.

### 4.2. Performance & Availability
- **RN-07**: API response times under 500ms for CRUD operations.
- **RN-08**: Application must be fully dockerized and ready for horizontal scaling behind a reverse proxy.

### 4.3. Usability
- **RN-09**: Fully responsive interface tailored for desktop cashiers and mobile phone dashboard tracking.
- **RN-10**: Dual-language support (Bahasa Indonesia default).
