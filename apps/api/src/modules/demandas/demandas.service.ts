import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DemandasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.demanda.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async findOne(id: string) {
    const demanda = await this.prisma.demanda.findUnique({
      where: { id },
      include: { pessoa: true, atribuido: true },
    });
    if (!demanda) throw new NotFoundException('Demanda não encontrada');
    return demanda;
  }

  async create(data: any, userId: string) {
    return this.prisma.demanda.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.demanda.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.demanda.delete({
      where: { id },
    });
  }
}
