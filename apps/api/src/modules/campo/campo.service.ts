import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoteiroDto } from './dto/campo.dto';

@Injectable()
export class CampoService {
  constructor(private readonly prisma: PrismaService) {}

  async getRoteiros(tenantId: string) {
    return this.prisma.roteiroVisita.findMany({
      where: { tenantId },
      include: {
        municipio: { select: { nome: true } },
        paradas: { select: { id: true, concluido: true } },
      },
      orderBy: { data: 'desc' },
      take: 100,
    });
  }

  async createRoteiro(data: CreateRoteiroDto, tenantId: string) {
    return this.prisma.roteiroVisita.create({
      data: {
        ...data,
        data: new Date(data.data), // Parse to date
        tenantId,
      },
    });
  }

  async updateRoteiroStatus(id: string, status: string, tenantId: string) {
    return this.prisma.roteiroVisita.update({
      where: { id, tenantId },
      data: { status },
    });
  }
}
