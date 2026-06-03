import prisma from '../config/db';

interface CreateLogParams {
  action: string;
  details: string;
  userId: string;
  tenantId: string;
  ipAddress?: string;
}

export class AuditLogService {
  /**
   * Log user action into database asynchronously
   */
  static async log(params: CreateLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: params.action,
          details: params.details,
          userId: params.userId,
          tenantId: params.tenantId,
          ipAddress: params.ipAddress || '0.0.0.0',
        },
      });
      console.log(`[AuditLog] Logged action: ${params.action} for tenant ${params.tenantId}`);
    } catch (error) {
      console.error('[AuditLog Error] Failed to write audit log:', error);
    }
  }

  /**
   * Fetch logs for audit trail display (typically restricted to Owner)
   */
  static async getLogs(tenantId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
export default AuditLogService;
