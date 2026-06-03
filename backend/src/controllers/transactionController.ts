import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import AuditLogService from '../services/auditLogService';
import WhatsappService from '../services/whatsappService';
import ExportService from '../services/exportService';

// Validation Schemas
export const createTransactionSchema = z.object({
  body: z.object({
    customerId: z.string().optional().nullable(),
    discount: z.number().nonnegative('Diskon tidak boleh negatif').optional(),
    taxPercent: z.number().nonnegative('Persentase pajak tidak boleh negatif').optional(),
    items: z.array(
      z.object({
        productId: z.string().min(1, 'ID produk wajib diisi'),
        quantity: z.number().int().positive('Jumlah barang harus minimal 1'),
      })
    ).min(1, 'Transaksi harus memiliki minimal 1 item'),
  }),
});

export class TransactionController {
  /**
   * Get all transactions (Scoped to Tenant)
   */
  static async getAll(req: any, res: Response) {
    const tenantId = req.user.tenantId;
    const { startDate, endDate } = req.query;

    try {
      const where: any = { tenantId };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          customer: true,
          user: { select: { name: true } },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      console.error('[Get Transactions Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil riwayat transaksi' });
    }
  }

  /**
   * POS checkout processing method (Atomic Database transaction)
   */
  static async create(req: any, res: Response) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    const { customerId, discount = 0, taxPercent = 10, items } = req.body;

    try {
      // 1. Resolve product details and verify stock
      const productIds = items.map((i: any) => i.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds }, tenantId },
      });

      if (dbProducts.length !== items.length) {
        return res.status(400).json({ success: false, message: 'Salah satu produk di keranjang tidak valid' });
      }

      // Check stock levels first
      for (const item of items) {
        const prod = dbProducts.find(p => p.id === item.productId);
        if (!prod || prod.stock < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            message: `Stok produk '${prod?.name || 'Item'}' tidak mencukupi. Tersedia: ${prod?.stock || 0}, Diminta: ${item.quantity}` 
          });
        }
      }

      // 2. Perform atomic transaction
      const transactionResult = await prisma.$transaction(async (tx) => {
        // A. Calculate prices
        let rawSubtotal = 0;
        const invoiceItemsData = [];

        for (const item of items) {
          const prod = dbProducts.find(p => p.id === item.productId)!;
          const subTotal = Number(prod.price) * item.quantity;
          rawSubtotal += subTotal;

          invoiceItemsData.push({
            productId: prod.id,
            quantity: item.quantity,
            unitPrice: prod.price,
            subTotal,
          });

          // Deduct inventory stock
          await tx.product.update({
            where: { id: prod.id },
            data: { stock: { decrement: item.quantity } },
          });
        }

        const calculatedTax = rawSubtotal * (taxPercent / 100);
        const netAmount = Math.max(0, rawSubtotal + calculatedTax - discount);

        // B. Generate unique Invoice Number
        const count = await tx.transaction.count({ where: { tenantId } });
        const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const invoiceNumber = `INV-${dateCode}-${String(count + 1).padStart(4, '0')}`;

        // C. Write core sale transaction
        const sale = await tx.transaction.create({
          data: {
            invoiceNumber,
            totalAmount: rawSubtotal,
            tax: calculatedTax,
            discount,
            netAmount,
            status: 'COMPLETED',
            customerId: customerId || null,
            userId,
            tenantId,
            items: {
              create: invoiceItemsData,
            },
          },
          include: {
            items: { include: { product: true } },
            customer: true,
          },
        });

        // D. Loyalty points processing (1 point per IDR 10,000 net)
        if (customerId) {
          const pointsEarned = Math.floor(netAmount / 10000);
          if (pointsEarned > 0) {
            await tx.customerLoyalty.update({
              where: { customerId },
              data: { points: { increment: pointsEarned } },
            });
          }
        }

        return sale;
      });

      // 3. Security Audit Logging
      await AuditLogService.log({
        action: 'SALE_CREATE',
        details: `Recorded POS sale ${transactionResult.invoiceNumber} with amount IDR ${transactionResult.netAmount}`,
        userId,
        tenantId,
        ipAddress: req.ip,
      });

      // 4. Send Customer WhatsApp Receipt (simulated async task)
      if (transactionResult.customer && transactionResult.customer.phone) {
        const customerName = transactionResult.customer.name;
        const msg = `🧾 *NOTA PENJUALAN DIGITAL* 🧾\n\nTerima kasih Kak ${customerName} telah berbelanja!\n\nNomor Invoice: *${transactionResult.invoiceNumber}*\nWaktu: ${new Date(transactionResult.createdAt).toLocaleString('id-ID')}\n\n*Ringkasan Item:*\n${transactionResult.items.map(i => `- ${i.product.name} x${i.quantity} = Rp ${Number(i.subTotal).toLocaleString('id-ID')}`).join('\n')}\n\n----------------------------\nSubtotal: Rp ${Number(transactionResult.totalAmount).toLocaleString('id-ID')}\nPajak: Rp ${Number(transactionResult.tax).toLocaleString('id-ID')}\nDiskon: Rp ${Number(transactionResult.discount).toLocaleString('id-ID')}\n*TOTAL BAYAR: Rp ${Number(transactionResult.netAmount).toLocaleString('id-ID')}*\n\nLoyalty Points Anda bertambah +${Math.floor(Number(transactionResult.netAmount) / 10000)} Poin.`;

        await WhatsappService.sendNotification(transactionResult.customer.phone, msg, tenantId);
      }

      // Check for low-stock triggers to warn owners on recently depleted items
      const updatedProducts = await prisma.product.findMany({
        where: { id: { in: productIds }, tenantId },
      });
      for (const p of updatedProducts) {
        if (p.stock <= p.minStockThreshold) {
          // Fire alert warning in console
          console.warn(`[Stock Threshold Reached] Product '${p.name}' is low. Current stock: ${p.stock}`);
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Transaksi POS berhasil disimpan',
        data: transactionResult,
      });
    } catch (error) {
      console.error('[POS Transaction Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal memproses transaksi POS' });
    }
  }

  /**
   * Export reports endpoint
   */
  static async export(req: any, res: Response) {
    const tenantId = req.user.tenantId;
    const { format = 'excel', startDate, endDate } = req.query;

    try {
      const where: any = { tenantId, status: 'COMPLETED' };
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate as string);
        if (endDate) where.createdAt.lte = new Date(endDate as string);
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          customer: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { name: true },
      });

      const businessName = tenant?.name || 'Toko UMKM';

      if (format === 'excel') {
        const csvContent = ExportService.generateTransactionsCSV(transactions);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Keuangan_${businessName.replace(/\s+/g, '_')}.csv`);
        return res.status(200).send(csvContent);
      } else {
        // PDF fallback: formatted text document
        const pdfContent = ExportService.generateTransactionsPDFMock(transactions, businessName);
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_Keuangan_${businessName.replace(/\s+/g, '_')}.txt`);
        return res.status(200).send(pdfContent);
      }
    } catch (error) {
      console.error('[Export Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengekspor laporan keuangan' });
    }
  }
}
export default TransactionController;
