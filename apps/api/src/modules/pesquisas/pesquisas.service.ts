import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PesquisasService {
  constructor(private readonly prisma: PrismaService) {}

  async getPesquisas(tenantId: string) {
    const pesquisas = await this.prisma.pesquisa.findMany({
      where: { tenantId },
      include: {
        resultados: true,
        // Using $queryRaw or a separate view for campanhas and municipios if relations don't directly match
        // But let's just return what we have
      },
      orderBy: { dataDivulgacao: 'desc' },
    });

    // Manually fetch names if we don't have relations mapped in schema, but for our case, let's just send the IDs
    return pesquisas;
  }

  async upsertPesquisa(tenantId: string, id: string | undefined, data: any) {
    if (id) {
      return this.prisma.pesquisa.update({
        where: { id, tenantId },
        data,
      });
    } else {
      return this.prisma.pesquisa.create({
        data: { ...data, tenantId },
      });
    }
  }

  async upsertResultado(tenantId: string, id: string | undefined, data: any) {
    if (id) {
      return this.prisma.pesquisaResultado.update({
        where: { id, tenantId },
        data,
      });
    } else {
      return this.prisma.pesquisaResultado.create({
        data: { ...data, tenantId },
      });
    }
  }

  async getCaptacaoDoadores(tenantId: string) {
    return this.prisma.captacaoDoador.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsertDoador(tenantId: string, id: string | undefined, data: any) {
    if (id) {
      return this.prisma.captacaoDoador.update({
        where: { id, tenantId },
        data,
      });
    } else {
      return this.prisma.captacaoDoador.create({
        data: { ...data, tenantId },
      });
    }
  }

  async removeDoador(tenantId: string, id: string) {
    return this.prisma.captacaoDoador.delete({
      where: { id, tenantId },
    });
  }
}
