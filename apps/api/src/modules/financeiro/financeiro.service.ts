import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllDespesas() {
    return this.prisma.despesa.findMany({
      orderBy: { dataDespesa: 'desc' },
      take: 500,
    });
  }

  async findAllReceitas() {
    return this.prisma.receita.findMany({
      orderBy: { dataReceita: 'desc' },
      take: 500,
    });
  }

  async createDespesa(data: any) {
    return this.prisma.despesa.create({ data });
  }

  async updateDespesa(id: string, data: any) {
    return this.prisma.despesa.update({
      where: { id },
      data,
    });
  }

  async deleteDespesa(id: string) {
    return this.prisma.despesa.delete({ where: { id } });
  }

  async createReceita(data: any) {
    return this.prisma.receita.create({ data });
  }

  async deleteReceita(id: string) {
    return this.prisma.receita.delete({ where: { id } });
  }
}
