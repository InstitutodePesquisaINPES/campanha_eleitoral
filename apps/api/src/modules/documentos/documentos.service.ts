import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  async getDocumentos(userId: string, tenantId: string) {
    return this.prisma.documento.findMany({
      where: { tenantId }, // Currently ignoring pessoaId restriction to allow shared docs across campaign if desired, or you can filter by it
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async createDocumento(data: any, tenantId: string) {
    return this.prisma.documento.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async removeDocumento(id: string, tenantId: string) {
    return this.prisma.documento.delete({
      where: { id, tenantId },
    });
  }
}
