import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateCentroCustoDto,
  CreateDespesaDto,
  UpdateDespesaDto,
  CreateReceitaDto,
} from './dto/financeiro.dto';

@Injectable()
export class FinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- CENTROS DE CUSTO ----
  async getCentrosCusto(tenantId: string) {
    return this.prisma.centroCusto.findMany({
      where: { tenantId },
      orderBy: { nome: 'asc' },
    });
  }

  async createCentroCusto(data: CreateCentroCustoDto, tenantId: string) {
    return this.prisma.centroCusto.create({ data: { ...data, tenantId } });
  }

  async deleteCentroCusto(id: string, tenantId: string) {
    return this.prisma.centroCusto.delete({ where: { id, tenantId } as any });
  }

  // ---- DESPESAS ----
  async findAllDespesas(tenantId: string, centroCustoId?: string) {
    const where: any = { tenantId };
    if (centroCustoId && centroCustoId !== 'all') {
      where.centroCustoId = centroCustoId;
    }
    return this.prisma.despesa.findMany({
      where,
      include: {
        centroCusto: { select: { nome: true } },
      },
      orderBy: { dataDespesa: 'desc' },
      take: 500,
    });
  }

  async createDespesa(
    data: CreateDespesaDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.despesa.create({
      data: { ...data, responsavelId: userId, tenantId },
    });
  }

  async updateDespesa(id: string, data: UpdateDespesaDto, tenantId: string) {
    return this.prisma.despesa.update({
      where: { id, tenantId } as any,
      data,
    });
  }

  async deleteDespesa(id: string, tenantId: string) {
    return this.prisma.despesa.delete({ where: { id, tenantId } as any });
  }

  // ---- RECEITAS ----
  async findAllReceitas(tenantId: string, centroCustoId?: string) {
    const where: any = { tenantId };
    if (centroCustoId && centroCustoId !== 'all') {
      where.centroCustoId = centroCustoId;
    }
    return this.prisma.receita.findMany({
      where,
      include: {
        centroCusto: { select: { nome: true } },
      },
      orderBy: { dataReceita: 'desc' },
      take: 500,
    });
  }

  async createReceita(data: CreateReceitaDto, tenantId: string) {
    return this.prisma.receita.create({ data: { ...data, tenantId } });
  }

  async deleteReceita(id: string, tenantId: string) {
    return this.prisma.receita.delete({ where: { id, tenantId } as any });
  }
}
