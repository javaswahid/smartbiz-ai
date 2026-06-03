# Entity Relationship Diagram (ERD)

This document contains the ERD for SmartBiz AI. Below is the database relationship diagram in Mermaid format.

```mermaid
erDiagram
    Tenant ||--o{ User : "has members"
    Tenant ||--o{ Product : "owns"
    Tenant ||--o{ Customer : "manages"
    Tenant ||--o{ Transaction : "records"
    Tenant ||--o{ AuditLog : "tracks"
    Tenant ||--o{ KnowledgeBase : "uses"
    
    User ||--o{ AuditLog : "triggers"
    User ||--o{ Transaction : "processed_by"
    
    Customer ||--o{ Transaction : "makes"
    Customer ||--o| CustomerLoyalty : "has"
    
    Transaction ||--|{ TransactionItem : "contains"
    Product ||--o{ TransactionItem : "ordered_in"
    
    Tenant {
        uuid id PK
        string name
        string category
        string scale
        string address
        string phone
        string email
        string whatsappApiKey
        int stockAlertThreshold
        datetime createdAt
        datetime updatedAt
    }

    User {
        uuid id PK
        string name
        string email
        string passwordHash
        string role "OWNER | ADMIN | STAFF"
        uuid tenantId FK
        datetime createdAt
        datetime updatedAt
    }

    Product {
        uuid id PK
        string name
        string sku
        string category
        decimal price
        decimal cost
        int stock
        int minStockThreshold
        string imageUrl
        uuid tenantId FK
        datetime createdAt
        datetime updatedAt
    }

    Customer {
        uuid id PK
        string name
        string phone
        string email
        uuid tenantId FK
        datetime createdAt
        datetime updatedAt
    }

    CustomerLoyalty {
        uuid id PK
        uuid customerId FK "Unique"
        int points
        datetime updatedAt
    }

    Transaction {
        uuid id PK
        string invoiceNumber "Unique"
        decimal totalAmount
        decimal tax
        decimal discount
        decimal netAmount
        string status "COMPLETED | PENDING | CANCELLED"
        uuid customerId FK "Nullable"
        uuid userId FK "Processed by"
        uuid tenantId FK
        datetime createdAt
        datetime updatedAt
    }

    TransactionItem {
        uuid id PK
        uuid transactionId FK
        uuid productId FK
        int quantity
        decimal unitPrice
        decimal subTotal
    }

    AuditLog {
        uuid id PK
        string action "e.g., PRODUCT_UPDATE, SALE_CREATE"
        string details
        string ipAddress
        uuid userId FK
        uuid tenantId FK
        datetime createdAt
    }

    KnowledgeBase {
        uuid id PK
        string title
        string content
        vector embedding "pgvector (1536 dims)"
        uuid tenantId FK
        datetime createdAt
    }
```

## Description of Relations

1. **Multi-Tenancy Isolation**:
   - `Tenant` is the root entity. All entities (`User`, `Product`, `Customer`, `Transaction`, `AuditLog`, `KnowledgeBase`) reference a `tenantId`. Every database query is scoped to this ID.

2. **RBAC Control**:
   - The `User` table has a `role` field restricted to `OWNER`, `ADMIN`, or `STAFF`.

3. **Customer & Loyalty Program**:
   - A `Customer` has a one-to-one relationship with `CustomerLoyalty`. Points are accumulated based on transaction amounts and saved there.

4. **Sales Ledger**:
   - A `Transaction` is logged by a `User` (the cashier/staff/admin) and optionally linked to a `Customer` (for CRM and loyalty). It consists of multiple `TransactionItem`s, which connect to individual `Product`s.

5. **AI RAG (Knowledge Base)**:
   - The `KnowledgeBase` table stores business manuals, policies, or product information, including high-dimensional vector embeddings to support semantic queries in the AI assistant.
