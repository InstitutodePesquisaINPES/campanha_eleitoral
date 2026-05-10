import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotificacoes(userId: string, tenantId: string) {
    return this.prisma.notificacao.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async marcarLida(id: string, userId: string, tenantId: string) {
    return this.prisma.notificacao.update({
      where: { id, userId, tenantId },
      data: { lida: true, lidaEm: new Date() },
    });
  }

  async marcarTodasLidas(userId: string, tenantId: string) {
    return this.prisma.notificacao.updateMany({
      where: { userId, tenantId, lida: false },
      data: { lida: true, lidaEm: new Date() },
    });
  }

  async remover(id: string, userId: string, tenantId: string) {
    return this.prisma.notificacao.delete({
      where: { id, userId, tenantId },
    });
  }
}
