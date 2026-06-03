import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pre-hashed bcrypt value for "Password123"
const PASSWORD_HASH = '$2b$10$T8Z.X6/1x0c37Y789Qc3eu2GzCszh2D1WcT8x.yP1/rQn0fV4B9iG';

async function main() {
  console.log('Starting seed process...');

  // 1. Clean existing records (Reverse order of dependencies)
  await prisma.knowledgeBase.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.customerLoyalty.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log('Database cleared.');

  // 2. Create Tenant (UMKM Toko Sejahtera)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Toko Sejahtera Mart',
      category: 'F&B dan Retail',
      scale: 'Mikro',
      address: 'Jl. Pemuda No. 12, Surabaya, Jawa Timur',
      phone: '081234567890',
      email: 'contact@tokosejahtera.com',
      stockAlertThreshold: 8,
    },
  });
  console.log(`Created Tenant: ${tenant.name} (${tenant.id})`);

  // 3. Create RBAC Users
  const owner = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'owner@tokosejahtera.com',
      passwordHash: PASSWORD_HASH,
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Dewi Lestari',
      email: 'admin@tokosejahtera.com',
      passwordHash: PASSWORD_HASH,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Eko Prasetyo',
      email: 'staff@tokosejahtera.com',
      passwordHash: PASSWORD_HASH,
      role: 'STAFF',
      tenantId: tenant.id,
    },
  });
  console.log('Seeded users for Owner, Admin, and Staff roles.');

  // 4. Create Products
  const prod1 = await prisma.product.create({
    data: {
      name: 'Kopi Susu Gula Aren',
      sku: 'KS-GA-01',
      category: 'Minuman',
      price: 18000.0,
      cost: 8000.0,
      stock: 4, // Below threshold
      minStockThreshold: 10,
      tenantId: tenant.id,
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      name: 'Kopi Cappuccino Latte',
      sku: 'KP-CP-02',
      category: 'Minuman',
      price: 22000.0,
      cost: 10000.0,
      stock: 35,
      minStockThreshold: 8,
      tenantId: tenant.id,
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      name: 'Roti Bakar Coklat Keju',
      sku: 'RT-BC-03',
      category: 'Makanan',
      price: 15000.0,
      cost: 7000.0,
      stock: 20,
      minStockThreshold: 5,
      tenantId: tenant.id,
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      name: 'Kentang Goreng Krispi',
      sku: 'KT-GR-04',
      category: 'Makanan',
      price: 12000.0,
      cost: 5000.0,
      stock: 3, // Below threshold
      minStockThreshold: 5,
      tenantId: tenant.id,
    },
  });
  console.log('Seeded product catalog items.');

  // 5. Create Customers (CRM)
  const cust1 = await prisma.customer.create({
    data: {
      name: 'Agus Setiawan',
      phone: '085711122233',
      email: 'agus@gmail.com',
      tenantId: tenant.id,
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      name: 'Cici Handayani',
      phone: '081988899900',
      email: 'cici@yahoo.com',
      tenantId: tenant.id,
    },
  });
  console.log('Seeded CRM customers.');

  // 6. Create Customer Loyalty point accounts
  await prisma.customerLoyalty.create({
    data: {
      customerId: cust1.id,
      points: 120, // Pre-seeded points
    },
  });

  await prisma.customerLoyalty.create({
    data: {
      customerId: cust2.id,
      points: 45,
    },
  });
  console.log('Seeded customer loyalty accounts.');

  // 7. Seed historical Transactions
  const trans1 = await prisma.transaction.create({
    data: {
      invoiceNumber: 'INV-2026-001',
      totalAmount: 58000.0,
      tax: 5800.0,
      discount: 5000.0,
      netAmount: 58800.0,
      status: 'COMPLETED',
      customerId: cust1.id,
      userId: staff.id,
      tenantId: tenant.id,
      createdAt: new Date('2026-06-01T10:30:00Z'),
    },
  });

  await prisma.transactionItem.create({
    data: {
      transactionId: trans1.id,
      productId: prod1.id,
      quantity: 2,
      unitPrice: 18000.0,
      subTotal: 36000.0,
    },
  });

  await prisma.transactionItem.create({
    data: {
      transactionId: trans1.id,
      productId: prod2.id,
      quantity: 1,
      unitPrice: 22000.0,
      subTotal: 22000.0,
    },
  });

  const trans2 = await prisma.transaction.create({
    data: {
      invoiceNumber: 'INV-2026-002',
      totalAmount: 27000.0,
      tax: 2700.0,
      discount: 0.0,
      netAmount: 29700.0,
      status: 'COMPLETED',
      customerId: cust2.id,
      userId: admin.id,
      tenantId: tenant.id,
      createdAt: new Date('2026-06-02T14:15:00Z'),
    },
  });

  await prisma.transactionItem.create({
    data: {
      transactionId: trans2.id,
      productId: prod3.id,
      quantity: 1,
      unitPrice: 15000.0,
      subTotal: 15000.0,
    },
  });

  await prisma.transactionItem.create({
    data: {
      transactionId: trans2.id,
      productId: prod4.id,
      quantity: 1,
      unitPrice: 12000.0,
      subTotal: 12000.0,
    },
  });
  console.log('Seeded transactions ledger.');

  // 8. Seed Audit Logs
  await prisma.auditLog.create({
    data: {
      action: 'USER_LOGIN',
      details: 'Staff Eko Prasetyo logged in to POS',
      ipAddress: '127.0.0.1',
      userId: staff.id,
      tenantId: tenant.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'PRODUCT_UPDATE',
      details: 'Admin Dewi Lestari updated stock of Kopi Susu Gula Aren',
      ipAddress: '127.0.0.1',
      userId: admin.id,
      tenantId: tenant.id,
    },
  });
  console.log('Seeded security audit logs.');

  // 9. Seed AI KnowledgeBase articles
  await prisma.knowledgeBase.create({
    data: {
      title: 'Kebijakan Pengembalian Barang & Refund',
      content: 'Pelanggan dapat melakukan refund barang dalam waktu maksimal 1x24 jam dari waktu pembelian, wajib melampirkan invoice fisik / digital. Produk makanan dan minuman yang sudah dikonsumsi lebih dari 20% tidak dapat direfund.',
      tenantId: tenant.id,
    },
  });

  await prisma.knowledgeBase.create({
    data: {
      title: 'Panduan Menu & Racikan Minuman Kopi',
      content: 'Kopi Susu Gula Aren dibuat dengan takaran: 1 shot espresso (30ml), susu segar (120ml), gula aren cair (25ml), dan es batu secukupnya. Harus disajikan dingin dalam cup ukuran regular.',
      tenantId: tenant.id,
    },
  });
  console.log('Seeded KnowledgeBase articles for RAG queries.');

  console.log('Seeding process successfully completed.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
