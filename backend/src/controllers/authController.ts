import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';
import AuditLogService from '../services/auditLogService';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_9911';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';

// Validation Schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama harus minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password harus minimal 6 karakter'),
    businessName: z.string().min(3, 'Nama bisnis harus minimal 3 karakter'),
    businessCategory: z.string().min(2, 'Kategori bisnis wajib diisi'),
    businessScale: z.enum(['Mikro', 'Kecil', 'Menengah']),
    address: z.string().optional(),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(1, 'Password wajib diisi'),
  }),
});

export const onboardUserSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama harus minimal 3 karakter'),
    email: z.string().email('Format email tidak valid'),
    password: z.string().min(6, 'Password harus minimal 6 karakter'),
    role: z.enum(['ADMIN', 'STAFF']),
  }),
});

export class AuthController {
  /**
   * Register a new Tenant (UMKM) along with its OWNER user
   */
  static async register(req: Request, res: Response) {
    const { name, email, password, businessName, businessCategory, businessScale, address, phone } = req.body;

    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      // Create Tenant and Owner atomically inside a Prisma transaction
      const result = await prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name: businessName,
            category: businessCategory,
            scale: businessScale,
            address,
            phone,
            email,
          },
        });

        const owner = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: 'OWNER',
            tenantId: tenant.id,
          },
        });

        return { tenant, owner };
      });

      // Issue JWT
      const token = jwt.sign(
        { id: result.owner.id, name: result.owner.name, role: result.owner.role, tenantId: result.tenant.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      // Audit Log
      await AuditLogService.log({
        action: 'TENANT_REGISTER',
        details: `Tenant ${businessName} registered with Owner ${email}`,
        userId: result.owner.id,
        tenantId: result.tenant.id,
        ipAddress: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: 'Registrasi bisnis dan pemilik berhasil',
        token,
        user: {
          id: result.owner.id,
          name: result.owner.name,
          email: result.owner.email,
          role: result.owner.role,
          tenantId: result.tenant.id,
        },
      });
    } catch (error) {
      console.error('[Registration Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal melakukan registrasi' });
    }
  }

  /**
   * User login method
   */
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true },
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: 'Email atau password salah' });
      }

      // Issue JWT
      const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role, tenantId: user.tenantId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      // Log login activity
      await AuditLogService.log({
        action: 'USER_LOGIN',
        details: `User ${user.email} (${user.role}) logged in`,
        userId: user.id,
        tenantId: user.tenantId,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Login berhasil',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          businessName: user.tenant.name,
        },
      });
    } catch (error) {
      console.error('[Login Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal melakukan login' });
    }
  }

  /**
   * Onboard Admin/Staff users (Owner access only)
   */
  static async onboardUser(req: any, res: Response) {
    const { name, email, password, role } = req.body;
    const tenantId = req.user.tenantId;

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
          tenantId,
        },
      });

      await AuditLogService.log({
        action: 'USER_ONBOARD',
        details: `Created user ${email} with role ${role}`,
        userId: req.user.id,
        tenantId,
        ipAddress: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: `Berhasil menambahkan user ${role}`,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error) {
      console.error('[Onboarding Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal menambahkan anggota tim baru' });
    }
  }
}
export default AuthController;
