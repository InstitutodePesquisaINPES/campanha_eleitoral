import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(search?: string, nivel?: string) {
    return this.prisma.pessoa.findMany({
      where: {
        AND: [
          search ? { fullName: { contains: search, mode: 'insensitive' } } : {},
          nivel && nivel !== 'all' ? { nivelRelacionamento: nivel } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async findOne(id: string) {
    const pessoa = await this.prisma.pessoa.findUnique({
      where: { id },
    });
    if (!pessoa) {
      throw new NotFoundException(`Pessoa with ID ${id} not found`);
    }
    return pessoa;
  }

  async create(data: any, userId: string) {
    return this.prisma.pessoa.create({
      data: {
        ...data,
        createdBy: userId,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.pessoa.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.pessoa.delete({
      where: { id },
    });
  }
}
