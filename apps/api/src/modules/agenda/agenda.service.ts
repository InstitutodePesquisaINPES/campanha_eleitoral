import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.agenda.findMany({
      orderBy: { dataInicio: 'asc' },
      take: 500,
    });
  }

  async findOne(id: string) {
    const evento = await this.prisma.agenda.findUnique({
      where: { id },
      include: { participantes: true, responsavel: true },
    });
    if (!evento) throw new NotFoundException('Evento não encontrado');
    return evento;
  }

  async create(data: any, userId: string) {
    return this.prisma.agenda.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.agenda.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.agenda.delete({
      where: { id },
    });
  }
}
