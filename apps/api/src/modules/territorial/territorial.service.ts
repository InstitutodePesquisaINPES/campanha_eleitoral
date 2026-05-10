import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TerritorialService {
  constructor(private readonly prisma: PrismaService) {}

  async getEstados() {
    return this.prisma.estado.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async getMunicipios(estadoId?: string) {
    return this.prisma.municipio.findMany({
      where: estadoId ? { estadoId } : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  async getBairros(municipioId: string) {
    return this.prisma.bairro.findMany({
      where: { municipioId },
      orderBy: { nome: 'asc' },
    });
  }

  async getZonasEleitorais(municipioId: string) {
    return this.prisma.zonaEleitoral.findMany({
      where: { municipioId },
      orderBy: { numeroZona: 'asc' },
    });
  }

  async getSecoesEleitorais(zonaId: string) {
    return this.prisma.secaoEleitoral.findMany({
      where: { zonaId },
      orderBy: { numeroSecao: 'asc' },
    });
  }
}
