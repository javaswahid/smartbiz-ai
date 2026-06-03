import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import AuditLogService from '../services/auditLogService';
import WhatsappService from '../services/whatsappService';

// Validation Schemas
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nama produk minimal 2 karakter'),
    sku: z.string().min(2, 'SKU produk wajib diisi'),
    category: z.string().min(2, 'Kategori wajib diisi'),
    price: z.number().positive('Harga jual harus lebih besar dari 0'),
    cost: z.number().nonnegative('Biaya produksi/modal tidak boleh negatif'),
    stock: z.number().int().nonnegative('Stok tidak boleh negatif'),
    minStockThreshold: z.number().int().nonnegative('Batas minimum stok tidak boleh negatif').optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    sku: z.string().min(2).optional(),
    category: z.string().min(2).optional(),
    price: z.number().positive().optional(),
    cost: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    minStockThreshold: z.number().int().nonnegative().optional(),
  }),
});

export class ProductController {
  /**
   * Get all products (Scoped to Tenant)
   */
  static async getAll(req: any, res: Response) {
    const tenantId = req.user.tenantId;
    const { search, category } = req.query;

    try {
      const where: any = { tenantId };

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { sku: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      if (category) {
        where.category = category as string;
      }

      const products = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
      });

      // Map products to include low-stock computed boolean
      const data = products.map(p => ({
        ...p,
        price: Number(p.price),
        cost: Number(p.cost),
        isLowStock: p.stock <= p.minStockThreshold,
      }));

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('[Get Products Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil daftar produk' });
    }
  }

  /**
   * Create a new product (Owner & Admin)
   */
  static async create(req: any, res: Response) {
    const tenantId = req.user.tenantId;
    const { name, sku, category, price, cost, stock, minStockThreshold } = req.body;

    try {
      // Check SKU uniqueness inside this Tenant
      const existingSku = await prisma.product.findUnique({
        where: { tenantId_sku: { tenantId, sku } },
      });

      if (existingSku) {
        return res.status(400).json({ success: false, message: `Produk dengan SKU '${sku}' sudah ada di toko Anda` });
      }

      const product = await prisma.product.create({
        data: {
          name,
          sku,
          category,
          price,
          cost,
          stock,
          minStockThreshold: minStockThreshold || 5,
          tenantId,
        },
      });

      await AuditLogService.log({
        action: 'PRODUCT_CREATE',
        details: `Created product ${name} (SKU: ${sku}) with stock ${stock}`,
        userId: req.user.id,
        tenantId,
        ipAddress: req.ip,
      });

      // Stock notification check (on creation)
      if (stock <= (minStockThreshold || 5)) {
        await ProductController.triggerStockAlert(product, tenantId);
      }

      return res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', data: product });
    } catch (error) {
      console.error('[Create Product Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal menambahkan produk' });
    }
  }

  /**
   * Update a product (Owner & Admin)
   */
  static async update(req: any, res: Response) {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    try {
      const product = await prisma.product.findFirst({ where: { id, tenantId } });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: req.body,
      });

      await AuditLogService.log({
        action: 'PRODUCT_UPDATE',
        details: `Updated product ${product.name} (SKU: ${product.sku}). Changes: ${JSON.stringify(req.body)}`,
        userId: req.user.id,
        tenantId,
        ipAddress: req.ip,
      });

      // Trigger stock alert if updated stock is low
      if (updatedProduct.stock <= updatedProduct.minStockThreshold) {
        await ProductController.triggerStockAlert(updatedProduct, tenantId);
      }

      return res.status(200).json({ success: true, message: 'Produk berhasil diperbarui', data: updatedProduct });
    } catch (error) {
      console.error('[Update Product Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui produk' });
    }
  }

  /**
   * Delete a product (Owner only)
   */
  static async delete(req: any, res: Response) {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    try {
      const product = await prisma.product.findFirst({ where: { id, tenantId } });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      await prisma.product.delete({ where: { id } });

      await AuditLogService.log({
        action: 'PRODUCT_DELETE',
        details: `Deleted product ${product.name} (SKU: ${product.sku})`,
        userId: req.user.id,
        tenantId,
        ipAddress: req.ip,
      });

      return res.status(200).json({ success: true, message: 'Produk berhasil dihapus' });
    } catch (error) {
      console.error('[Delete Product Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal menghapus produk' });
    }
  }

  /**
   * Private helper to dispatch a low stock WhatsApp message to Tenant Owner
   */
  private static async triggerStockAlert(product: any, tenantId: string) {
    try {
      // Find Owner of the tenant
      const owner = await prisma.user.findFirst({
        where: { tenantId, role: 'OWNER' },
        select: { name: true, email: true },
      });

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { phone: true, name: true },
      });

      const notificationNumber = tenant?.phone || '08123456789';
      const alertMsg = `⚠️ [SmartBiz AI - PERINGATAN STOK TIPIS] ⚠️\n\nHalo ${owner?.name || 'Owner'},\n\nProduk berikut di toko "${tenant?.name}" telah menyentuh ambang batas minimum:\n📦 Nama: ${product.name}\n🔑 SKU: ${product.sku}\n📉 Stok Saat Ini: ${product.stock} (Batas Minimum: ${product.minStockThreshold})\n\nSegera lakukan restock atau hubungi supplier Anda.`;

      await WhatsappService.sendNotification(notificationNumber, alertMsg, tenantId);
    } catch (error) {
      console.error('[Stock Alert Dispatch Failure]:', error);
    }
  }
}
export default ProductController;
