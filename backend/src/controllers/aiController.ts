import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import AIService from '../services/aiService';

// Validation Schemas
export const chatAssistantSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Pesan tidak boleh kosong'),
  }),
});

export const marketingContentSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'ID produk wajib diisi'),
    channel: z.string().min(2, 'Channel promosi wajib diisi'),
    tone: z.string().min(2, 'Gaya bahasa (tone) wajib diisi'),
  }),
});

export const addKnowledgeSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Judul dokumen minimal 3 karakter'),
    content: z.string().min(10, 'Isi dokumen minimal 10 karakter'),
  }),
});

export class AIController {
  /**
   * RAG Chat assistant
   */
  static async chat(req: any, res: Response) {
    const { message } = req.body;
    const tenantId = req.user.tenantId;

    try {
      const response = await AIService.chatAssistant(message, tenantId);
      return res.status(200).json({ success: true, ...response });
    } catch (error) {
      console.error('[AI Chat Controller Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal memproses obrolan AI' });
    }
  }

  /**
   * 30-day sales predictions
   */
  static async getSalesPrediction(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    try {
      const result = await AIService.predictSales(tenantId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('[AI Prediction Controller Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal memproses prediksi penjualan' });
    }
  }

  /**
   * Automate business insight summary
   */
  static async getBusinessInsights(req: any, res: Response) {
    const tenantId = req.user.tenantId;

    try {
      const insight = await AIService.generateBusinessInsights(tenantId);
      return res.status(200).json({ success: true, insight });
    } catch (error) {
      console.error('[AI Insights Controller Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal menghasilkan insight bisnis' });
    }
  }

  /**
   * Marketing Content copy writing generator
   */
  static async generateMarketingContent(req: any, res: Response) {
    const { productId, channel, tone } = req.body;
    const tenantId = req.user.tenantId;

    try {
      const product = await prisma.product.findFirst({
        where: { id: productId, tenantId },
        select: { name: true },
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
      }

      const content = await AIService.generateMarketingContent(product.name, channel, tone);
      return res.status(200).json({ success: true, content });
    } catch (error) {
      console.error('[AI Marketing Controller Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal merancang materi promosi' });
    }
  }

  /**
   * Add context to simple RAG knowledge base
   */
  static async addKnowledge(req: any, res: Response) {
    const { title, content } = req.body;
    const tenantId = req.user.tenantId;

    try {
      const doc = await prisma.knowledgeBase.create({
        data: {
          title,
          content,
          tenantId,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Konteks dokumen berhasil disimpan ke dalam basis pengetahuan RAG',
        data: doc,
      });
    } catch (error) {
      console.error('[AI Add Knowledge Error]:', error);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan dokumen RAG' });
    }
  }
}
export default AIController;
