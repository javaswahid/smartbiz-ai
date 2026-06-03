import prisma from '../config/db';

export class WhatsappService {
  /**
   * Dispatch a WhatsApp notification
   */
  static async sendNotification(phone: string, message: string, tenantId: string): Promise<boolean> {
    try {
      // 1. Fetch tenant API credentials if available
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { whatsappApiKey: true, name: true },
      });

      const apiKey = tenant?.whatsappApiKey || process.env.WHATSAPP_API_TOKEN;
      const formattedPhone = this.formatPhoneNumber(phone);

      console.log(`\n--- [WhatsApp Outbox - ${tenant?.name || 'SmartBiz AI'}] ---`);
      console.log(`To: ${formattedPhone}`);
      console.log(`Message:\n${message}`);
      console.log('-----------------------------------------------------\n');

      if (!apiKey || apiKey === 'mock-token' || apiKey === 'token_api_whatsapp_anda') {
        console.log('[WhatsApp Service] Running in Mock/Development Mode. No network request sent.');
        return true;
      }

      // 2. Integration with Fonnte WhatsApp API (common provider in Indonesia)
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: formattedPhone,
          message: message,
          delay: '2',
        }),
      });

      const resJson: any = await response.json();
      console.log(`[WhatsApp Service] Fonnte API response status:`, resJson);

      return resJson.status === true;
    } catch (error) {
      console.error('[WhatsApp Service Error] Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Format numbers to Indonesian standard: 628xxxx
   */
  private static formatPhoneNumber(phone: string): string {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (!clean.startsWith('62')) {
      clean = '62' + clean;
    }
    return clean;
  }
}
export default WhatsappService;
