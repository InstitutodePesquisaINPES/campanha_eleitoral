import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateCampanhaDto,
  UpdateCampanhaDto,
  CreateEixoDto,
  UpdateEixoDto,
  CreatePlanoAcaoDto,
  UpdatePlanoAcaoDto,
  CreateParceriaDto,
} from './dto/strategy.dto';

@Injectable()
export class StrategyService {
  private readonly logger = new Logger(StrategyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createCampanha(
    data: CreateCampanhaDto,
    userId: string,
    tenantId: string,
  ) {
    return this.prisma.campanhaEstrategia.create({
      data: {
        ...data,
        createdBy: userId,
        tenantId,
      },
    });
  }

  async getCampanhas(tenantId: string) {
    // Retorna a hierarquia (Apenas Campanhas Master com suas filhas)
    return this.prisma.campanhaEstrategia.findMany({
      where: { parentCampanhaId: null, tenantId },
      include: {
        eixos: true,
        subCampanhas: {
          include: { eixos: true, parcerias: true },
        },
        parcerias: true,
      },
    });
  }

  async createParceria(
    campanhaId: string,
    data: CreateParceriaDto,
    tenantId: string,
  ) {
    return this.prisma.campanhaParceria.create({
      data: {
        ...data,
        campanhaId,
        tenantId,
      },
    });
  }

  async createEixo(campanhaId: string, data: CreateEixoDto, tenantId: string) {
    return this.prisma.eixoEstrategico.create({
      data: {
        ...data,
        campanhaId,
        tenantId,
      },
    });
  }

  async createPlanoAcao(
    eixoId: string,
    data: CreatePlanoAcaoDto,
    tenantId: string,
  ) {
    return this.prisma.planoAcao.create({
      data: {
        ...data,
        eixoId,
        tenantId,
      },
    });
  }

  async getCronogramaPlanoAcao(eixoId: string, tenantId: string) {
    return this.prisma.planoAcao.findMany({
      where: { eixoId, tenantId },
      include: {
        responsavel: { select: { fullName: true } },
        dependentes: { select: { id: true, titulo: true } },
        dependeDe: { select: { id: true, titulo: true } },
      },
      orderBy: { dataInicio: 'asc' },
    });
  }

  /**
   * War Room Agregação
   * Cruza Plano de Ação com Financeiro e CRM
   */
  async getWarRoomStats(campanhaId: string, tenantId: string) {
    // Busca eixos com orçamentos de planos vs despesas
    const eixos = await this.prisma.eixoEstrategico.findMany({
      where: { campanhaId, tenantId },
      include: {
        planosAcao: {
          include: {
            despesasVinculadas: true,
            agendasVinculadas: true,
          },
        },
        _count: {
          select: { demandasVinculadas: true },
        },
      },
    });

    return eixos.map((eixo) => {
      let orcamentoPlanejado = 0;
      let orcamentoGasto = 0;
      let planosConcluidos = 0;
      let agendasExecutadas = 0;

      eixo.planosAcao.forEach((plano) => {
        orcamentoPlanejado += plano.orcamentoPrevisto || 0;
        if (plano.status === 'done') planosConcluidos++;

        plano.despesasVinculadas.forEach((d) => {
          orcamentoGasto += d.valor;
        });

        agendasExecutadas += plano.agendasVinculadas.filter(
          (a) => a.status === 'realizado',
        ).length;
      });

      return {
        id: eixo.id,
        nome: eixo.nome,
        demandasCRMAbertas: eixo._count.demandasVinculadas,
        progressoPlanos:
          eixo.planosAcao.length > 0
            ? (planosConcluidos / eixo.planosAcao.length) * 100
            : 0,
        orcamentoPlanejado,
        orcamentoRealizado: orcamentoGasto,
        eventosCampanha: agendasExecutadas,
      };
    });
  }

  // --- UPDATE E DELETE ---

  async updateCampanha(id: string, data: UpdateCampanhaDto, tenantId: string) {
    return this.prisma.campanhaEstrategia.update({
      where: { id, tenantId } as any,
      data,
    });
  }

  async deleteCampanha(id: string, tenantId: string) {
    return this.prisma.campanhaEstrategia.delete({
      where: { id, tenantId } as any,
    });
  }

  async updateEixo(id: string, data: UpdateEixoDto, tenantId: string) {
    return this.prisma.eixoEstrategico.update({
      where: { id, tenantId } as any,
      data,
    });
  }

  async deleteEixo(id: string, tenantId: string) {
    return this.prisma.eixoEstrategico.delete({
      where: { id, tenantId } as any,
    });
  }

  async updatePlanoAcao(
    id: string,
    data: UpdatePlanoAcaoDto,
    tenantId: string,
  ) {
    return this.prisma.planoAcao.update({
      where: { id, tenantId } as any,
      data,
    });
  }

  async deletePlanoAcao(id: string, tenantId: string) {
    return this.prisma.planoAcao.delete({ where: { id, tenantId } as any });
  }

  async deleteParceria(id: string, tenantId: string) {
    return this.prisma.campanhaParceria.delete({
      where: { id, tenantId } as any,
    });
  }
}
