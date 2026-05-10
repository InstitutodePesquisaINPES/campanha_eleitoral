import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  // Providers
  async getProviders(tenantId: string) {
    return this.prisma.aiProvedor.findMany({ where: { tenantId } });
  }
  async createProvider(tenantId: string, data: any) {
    return this.prisma.aiProvedor.create({ data: { ...data, tenantId } });
  }
  async updateProvider(tenantId: string, id: string, data: any) {
    return this.prisma.aiProvedor.update({ where: { id, tenantId }, data });
  }
  async deleteProvider(tenantId: string, id: string) {
    return this.prisma.aiProvedor.delete({ where: { id, tenantId } });
  }

  // Models
  async getModels(tenantId: string) {
    return this.prisma.aiModelo.findMany({
      where: { tenantId },
      include: { provedor: true },
    });
  }
  async createModel(tenantId: string, data: any) {
    return this.prisma.aiModelo.create({ data: { ...data, tenantId } });
  }
  async updateModel(tenantId: string, id: string, data: any) {
    return this.prisma.aiModelo.update({ where: { id, tenantId }, data });
  }
  async deleteModel(tenantId: string, id: string) {
    return this.prisma.aiModelo.delete({ where: { id, tenantId } });
  }

  // Copilots
  async getCopilots(tenantId: string) {
    return this.prisma.aiCopilot.findMany({
      where: { tenantId },
      include: { provedor: true, modelo: true },
    });
  }
  async createCopilot(tenantId: string, data: any) {
    return this.prisma.aiCopilot.create({ data: { ...data, tenantId } });
  }
  async updateCopilot(tenantId: string, id: string, data: any) {
    return this.prisma.aiCopilot.update({ where: { id, tenantId }, data });
  }
  async deleteCopilot(tenantId: string, id: string) {
    return this.prisma.aiCopilot.delete({ where: { id, tenantId } });
  }

  // Chat
  async chat(tenantId: string, userId: string, payload: any) {
    // Basic mock implementation for the AI endpoint to return a valid payload
    const responseText =
      'Aqui é a inteligência artificial respondendo mockado por enquanto. A integração LLM verdadeira ocorrerá futuramente.';

    // Log use
    await this.prisma.aiUsoLog.create({
      data: {
        tenantId,
        userId,
        acao: 'chat',
        copilotId: payload.copilot_id,
        modeloId: payload.modelo_id,
        tokensInput: 10,
        tokensOutput: 20,
        custoEstimado: 0.001,
      },
    });

    return {
      content: responseText,
      tokens: { input: 10, output: 20 },
      custo_estimado: 0.001,
      latencia_ms: 100,
    };
  }
}
