import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateReuniaoDto,
  UpdateReuniaoDto,
  CreateDeliberacaoDto,
} from './dto/comando.dto';

@Injectable()
export class ComandoService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- INDICADORES (View substituída por queries) ----
  async getIndicadoresCampanha(tenantId: string) {
    // Como era uma View (v_indicadores_campanha) vamos fazer as contagens aqui usando o prisma
    const [
      totalPessoas,
      demandasAbertas,
      demandasResolvidas,
      demandasUrgentes,
      eventosFuturos,
      tarefasConcluidas,
      tarefasTotal,
      tarefasAtrasadas,
    ] = await Promise.all([
      this.prisma.pessoa.count({ where: { tenantId } }),
      this.prisma.demanda.count({
        where: { tenantId, status: { not: 'resolvida' } },
      }),
      this.prisma.demanda.count({ where: { tenantId, status: 'resolvida' } }),
      this.prisma.demanda.count({
        where: {
          tenantId,
          prioridade: 'urgente',
          status: { not: 'resolvida' },
        },
      }),
      this.prisma.agenda.count({
        where: { tenantId, dataInicio: { gte: new Date() } },
      }),
      this.prisma.planoAcao.count({ where: { tenantId, status: 'concluido' } }),
      this.prisma.planoAcao.count({ where: { tenantId } }),
      this.prisma.planoAcao.count({
        where: {
          tenantId,
          status: { not: 'concluido' },
          dataFim: { lt: new Date() },
        },
      }),
    ]);

    // Calcular dias restantes para as eleicoes de 2026 (Exemplo padrao)
    const dataEleicao = new Date('2026-10-04');
    const diffTime = Math.abs(dataEleicao.getTime() - new Date().getTime());
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      campanha_id: tenantId,
      campanha_nome: 'Sua Campanha',
      cargo: 'Candidato',
      meta_votos: 10000,
      data_eleicao: dataEleicao.toISOString(),
      dias_restantes: diasRestantes,
      total_pessoas: totalPessoas,
      demandas_abertas: demandasAbertas,
      demandas_resolvidas: demandasResolvidas,
      demandas_urgentes: demandasUrgentes,
      eventos_futuros: eventosFuturos,
      tarefas_concluidas: tarefasConcluidas,
      tarefas_total: tarefasTotal,
      tarefas_atrasadas: tarefasAtrasadas,
      total_gasto: 0,
      orcamento_total: 1000000,
    };
  }

  // ---- BURNDOWN ----
  async getBurndown(campanhaId: string, tenantId: string) {
    // Retorna algo falso/mock ou implementa queries baseadas no PlanoAcao
    return [];
  }

  // ---- REUNIOES ----
  async getReunioes(tenantId: string) {
    return this.prisma.reuniao.findMany({
      where: { tenantId },
      orderBy: { dataReuniao: 'desc' },
    });
  }

  async createReuniao(data: CreateReuniaoDto, tenantId: string) {
    return this.prisma.reuniao.create({
      data: { ...data, tenantId },
    });
  }

  async updateReuniao(id: string, data: UpdateReuniaoDto, tenantId: string) {
    return this.prisma.reuniao.update({
      where: { id, tenantId },
      data,
    });
  }

  // ---- DELIBERACOES ----
  async getDeliberacoes(reuniaoId: string, tenantId: string) {
    return this.prisma.reuniaoDeliberacao.findMany({
      where: { reuniaoId, tenantId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createDeliberacao(data: CreateDeliberacaoDto, tenantId: string) {
    return this.prisma.reuniaoDeliberacao.create({
      data: { ...data, tenantId },
    });
  }

  async toggleDeliberacao(id: string, status: string, tenantId: string) {
    return this.prisma.reuniaoDeliberacao.update({
      where: { id, tenantId },
      data: { status },
    });
  }
}
