import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import AuditLogService from '../services/auditLogService';

// Validation Schemas
export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nama pelanggan minimal 2 karakter'),
    phone: z.string().optional(),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  }),
});

export const adjustLoyaltySchema = z.object({
  body: z.object({
    points: z.number().int('Poin harus bilangan bulat'),
    action: z.enum(['ADD', 'REDEEM']),
  }),
});

export class CustomerController {
  /**
   * Get all customers (Scoped to Tenant)
   */
  static async getAll(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    try {
      const customers = await prisma.customer.findMany({
        where: { tenantId },
        include: { loyalty: true },
        orderBy: { name: 'asc' },
      });

      const data = customers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '-',
        email: c.email || '-',
        points: c.loyalty?.points || 0,
        createdAt: c.createdAt,
      }));

      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('[Get Customers Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal mengambil daftar pelanggan' });
    }
  }

  /**
   * Create customer with loyalty account
   */
  static async create(req: any, res: Response) {
    const tenantId = req.user.tenantId;
    const { name, phone, email } = req.body;

    try {
      const customer = await prisma.$transaction(async (tx) => {
        const cust = await tx.customer.create({
          data: {
            name,
            phone,
            email: email || null,
            tenantId,
          },
        });

        // Initialize empty loyalty points
        await tx.customerLoyalty.create({
          data: {
            customerId: cust.id,
            points: 0,
          },
        });

        return cust;
      });

      await AuditLogService.log({
        action: 'CUSTOMER_CREATE',
        details: `Created customer CRM: ${name} (${phone || 'No phone'})`,
        userId: req.user.id,
        tenantId,
        ipAddress: req.ip,
      });

      return res.status(201).json({ success: true, message: 'Pelanggan berhasil terdaftar', data: customer });
    } catch (error) {
      console.error('[Create Customer Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal mendaftarkan pelanggan' });
    }
  }

  /**
   * Update customer profile
   */
  static async update(req: any, res: Response) {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    try {
      const customer = await prisma.customer.findFirst({ where: { id, tenantId } });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });
      }

      const updated = await prisma.customer.update({
        where: { id },
        data: {
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email || null,
        },
      });

      return res.status(200).json({ success: true, message: 'Data pelanggan berhasil diperbarui', data: updated });
    } catch (error) {
      console.error('[Update Customer Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui data pelanggan' });
    }
  }

  /**
   * Adjust points (ADD points or REDEEM points manually)
   */
  static async adjustLoyaltyPoints(req: any, res: Response) {
    const { id } = req.params; // Customer ID
    const tenantId = req.user.tenantId;
    const { points, action } = req.body;

    try {
      const customer = await prisma.customer.findFirst({
        where: { id, tenantId },
        include: { loyalty: true },
      });

      if (!customer) {
        return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan' });
      }

      const currentPoints = customer.loyalty?.points || 0;
      let newPoints = currentPoints;

      if (action === 'ADD') {
        newPoints += points;
      } else if (action === 'REDEEM') {
        if (currentPoints < points) {
          return res.status(400).json({ success: false, message: `Poin tidak mencukupi. Sisa poin: ${currentPoints}` });
        }
        newPoints -= points;
      }

      await prisma.customerLoyalty.update({
        where: { customerId: id },
        data: { points: newPoints },
      });

      await AuditLogService.log({
        action: 'LOYALTY_ADJUST',
        details: `Adjusted points for customer ${customer.name}. Action: ${action}, Value: ${points}. New points: ${newPoints}`,
        userId: req.user.id,
        tenantId,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: `Poin loyalty berhasil di-update (${action === 'ADD' ? '+' : '-'}${points})`,
        data: { points: newPoints },
      });
    } catch (error) {
      console.error('[Loyalty Points Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal memperbarui poin loyalty' });
    }
  }
}
export default CustomerController;
