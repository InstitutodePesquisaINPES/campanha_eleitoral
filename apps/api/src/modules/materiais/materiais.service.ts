import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MateriaisService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- MATERIAIS ----
  async getMateriais(tenantId: string) {
    return this.prisma.material.findMany({
      where: { tenantId },
      orderBy: { nome: 'asc' },
    });
  }

  async createMaterial(data: any, tenantId: string) {
    return this.prisma.material.create({
      data: { ...data, tenantId },
    });
  }

  async deleteMaterial(id: string, tenantId: string) {
    return this.prisma.material.delete({
      where: { id, tenantId },
    });
  }

  // ---- ESTOQUES ----
  async getEstoques(tenantId: string) {
    return this.prisma.estoque.findMany({
      where: { tenantId },
      include: {
        material: { select: { nome: true, tipo: true } },
        municipio: { select: { nome: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createEstoque(data: any, tenantId: string) {
    return this.prisma.estoque.create({
      data: { ...data, tenantId },
    });
  }

  // ---- MOVIMENTACOES ----
  async getMovimentacoes(estoqueId: string, tenantId: string) {
    return this.prisma.movimentacaoEstoque.findMany({
      where: { estoqueId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMovimentacao(data: any, tenantId: string) {
    // Registra a movimentacao e atualiza o estoque
    return this.prisma.$transaction(async (tx) => {
      const estoque = await tx.estoque.findFirst({
        where: { id: data.estoqueId, tenantId },
      });

      if (!estoque) {
        throw new NotFoundException('Estoque não encontrado');
      }

      // Calcula a variacao
      let variacao = 0;
      if (data.tipo === 'entrada' || data.tipo === 'transferencia') {
        variacao = data.quantidade;
      } else if (data.tipo === 'saida' || data.tipo === 'perda') {
        variacao = -data.quantidade;
      }

      const movimentacao = await tx.movimentacaoEstoque.create({
        data: {
          estoqueId: data.estoqueId,
          tipo: data.tipo,
          quantidade: data.quantidade,
          motivo: data.motivo,
          responsavelId: data.responsavelId,
          tenantId,
        },
      });

      await tx.estoque.update({
        where: { id: estoque.id },
        data: {
          quantidadeAtual: estoque.quantidadeAtual + variacao,
        },
      });

      return movimentacao;
    });
  }
}
