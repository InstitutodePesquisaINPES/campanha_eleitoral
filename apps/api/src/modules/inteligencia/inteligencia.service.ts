import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class InteligenciaService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(campanhaId: string, uf: string, ano: number, tenantId: string) {
    const [muns, lids, vers, bairros, demandas] = await Promise.all([
      this.prisma.municipioEstrategico.findMany({
        where: { tenantId }, // Removed campanhaId since we map it to tenantId
        select: { classificacao: true, metaVotos: true, votosHistoricos: true },
      }),
      this.prisma.liderancaLocal.findMany({
        where: { tenantId },
        select: {
          classificacao: true,
          status: true,
          votosEstimados: true,
          pessoaId: true,
        },
      }),
      this.prisma.vereadorHistorico.findMany({
        where: { tenantId, uf, ano },
        select: { alinhamento: true, eleito: true, votosRecebidos: true },
      }),
      this.prisma.bairroEstrategico.findMany({
        where: { tenantId },
        select: { score: true, metaVotos: true },
      }),
      this.prisma.demanda.findMany({
        where: {
          tenantId,
          status: { in: ['aberta', 'em_andamento', 'triagem', 'encaminhada'] },
        },
        take: 1000,
        select: { id: true, status: true, bairroId: true },
      }),
    ]);

    const metaVotos = muns.reduce((a, x: any) => a + (x.metaVotos || 0), 0);
    const votosHist = muns.reduce(
      (a, x: any) => a + (x.votosHistoricos || 0),
      0,
    );
    const votosLid = lids.reduce((a, x: any) => a + (x.votosEstimados || 0), 0);
    const lidAB = lids.filter(
      (x: any) => x.classificacao === 'A' || x.classificacao === 'B',
    ).length;
    const lidConvertidas = lids.filter((x: any) => !!x.pessoaId).length;
    const aliados = vers.filter((x: any) => x.alinhamento === 'aliado').length;
    const adversarios = vers.filter(
      (x: any) => x.alinhamento === 'adversario',
    ).length;
    const redutos = muns.filter(
      (x: any) => x.classificacao === 'reduto',
    ).length;
    const expansao = muns.filter(
      (x: any) => x.classificacao === 'expansao',
    ).length;
    const bairrosCriticos = bairros.filter(
      (x: any) => (x.score || 0) < 30,
    ).length;

    const coberturaPct =
      metaVotos > 0
        ? Math.min(100, Math.round(((votosHist + votosLid) / metaVotos) * 100))
        : 0;

    return {
      municipios: {
        total: muns.length,
        redutos,
        expansao,
        metaVotos,
        votosHist,
      },
      liderancas: {
        total: lids.length,
        classeAB: lidAB,
        votos: votosLid,
        convertidasCRM: lidConvertidas,
      },
      vereadores: { total: vers.length, aliados, adversarios },
      bairros: { total: bairros.length, criticos: bairrosCriticos },
      demandas: { abertas: demandas.length },
      coberturaPct,
    };
  }

  // Municipios Estratégicos
  async getMunicipiosEstrategicos(tenantId: string, campanhaId?: string) {
    return this.prisma.municipioEstrategico.findMany({
      where: {
        tenantId,
        ...(campanhaId && { campanhaId }),
      },
      include: {
        municipio: {
          select: {
            id: true,
            nome: true,
            populacao2022: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: { score: 'desc' },
    });
  }

  async upsertMunicipioEstrategico(tenantId: string, data: any) {
    const { id, municipioId, campanhaId, ...rest } = data;
    if (id) {
      return this.prisma.municipioEstrategico.update({
        where: { id, tenantId },
        data: rest,
      });
    } else {
      // Find existing
      const existing = await this.prisma.municipioEstrategico.findFirst({
        where: { tenantId, municipioId, campanhaId },
      });
      if (existing) {
        return this.prisma.municipioEstrategico.update({
          where: { id: existing.id },
          data: rest,
        });
      }
      return this.prisma.municipioEstrategico.create({
        data: { ...rest, municipioId, campanhaId, tenantId },
      });
    }
  }

  async removeMunicipioEstrategico(tenantId: string, id: string) {
    return this.prisma.municipioEstrategico.delete({
      where: { id, tenantId },
    });
  }

  // Bairros Estratégicos
  async getBairrosEstrategicos(
    tenantId: string,
    campanhaId?: string,
    municipioId?: string,
  ) {
    const whereClause: any = { tenantId };
    if (campanhaId) whereClause.campanhaId = campanhaId;
    if (municipioId) {
      whereClause.bairro = { municipioId };
    }

    return this.prisma.bairroEstrategico.findMany({
      where: whereClause,
      include: {
        bairro: {
          select: {
            id: true,
            nome: true,
            municipioId: true,
            latitude: true,
            longitude: true,
            zonaTipo: true,
            populacaoEstimada: true,
          },
        },
      },
      orderBy: { score: 'desc' },
    });
  }

  async upsertBairroEstrategico(tenantId: string, data: any) {
    const { id, bairroId, campanhaId, ...rest } = data;
    if (id) {
      return this.prisma.bairroEstrategico.update({
        where: { id, tenantId },
        data: rest,
      });
    } else {
      const existing = await this.prisma.bairroEstrategico.findFirst({
        where: { tenantId, bairroId, campanhaId },
      });
      if (existing) {
        return this.prisma.bairroEstrategico.update({
          where: { id: existing.id },
          data: rest,
        });
      }
      return this.prisma.bairroEstrategico.create({
        data: { ...rest, bairroId, campanhaId, tenantId },
      });
    }
  }

  // Lideranças
  async getLiderancas(tenantId: string, filters: any) {
    return this.prisma.liderancaLocal.findMany({
      where: {
        tenantId,
        ...(filters.campanhaId && { campanhaId: filters.campanhaId }),
        ...(filters.municipioId && { municipioId: filters.municipioId }),
        ...(filters.classificacao && { classificacao: filters.classificacao }),
        ...(filters.status && { status: filters.status }),
        ...(filters.tipo && { tipo: filters.tipo }),
      },
      include: {
        municipio: { select: { nome: true } },
        bairro: { select: { nome: true } },
      },
      orderBy: { influenciaScore: 'desc' },
      take: 500,
    });
  }

  async getLiderancaStats(tenantId: string, campanhaId?: string) {
    const lids = await this.prisma.liderancaLocal.findMany({
      where: {
        tenantId,
        ...(campanhaId && { campanhaId }),
      },
      select: {
        classificacao: true,
        status: true,
        tipo: true,
        votosEstimados: true,
      },
    });

    const porClass: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    const porStatus: Record<string, number> = {};
    const porTipo: Record<string, number> = {};
    let totalVotos = 0;

    lids.forEach((r) => {
      const cls = r.classificacao || 'A';
      porClass[cls] = (porClass[cls] || 0) + 1;
      const sts = r.status || 'mapeado';
      porStatus[sts] = (porStatus[sts] || 0) + 1;
      const tp = r.tipo || 'comunitaria';
      porTipo[tp] = (porTipo[tp] || 0) + 1;
      totalVotos += r.votosEstimados || 0;
    });

    return { total: lids.length, porClass, porStatus, porTipo, totalVotos };
  }

  async upsertLideranca(tenantId: string, id: string | undefined, data: any) {
    if (id) {
      return this.prisma.liderancaLocal.update({
        where: { id, tenantId },
        data,
      });
    } else {
      return this.prisma.liderancaLocal.create({
        data: { ...data, tenantId },
      });
    }
  }

  async removeLideranca(tenantId: string, id: string) {
    return this.prisma.liderancaLocal.delete({
      where: { id, tenantId },
    });
  }

  async promoverLiderancaParaCRM(tenantId: string, userId: string, id: string) {
    const lideranca = await this.prisma.liderancaLocal.findUnique({
      where: { id, tenantId },
    });

    if (!lideranca) throw new Error('Liderança não encontrada');
    if (lideranca.pessoaId)
      return { pessoaId: lideranca.pessoaId, alreadyPromoted: true };

    const pessoa = await this.prisma.pessoa.create({
      data: {
        tenantId,
        fullName: lideranca.nome,
        tipoPessoa: 'pf',
        nivelRelacionamento:
          lideranca.status === 'aliado' ? 'aliado' : 'lideranca',
        observacoes:
          `[Liderança ${lideranca.classificacao}] ${lideranca.observacoes ?? ''}`.trim(),
        createdBy: userId,
        papeis: {
          create: [{ tenantId, papel: 'lideranca', ativo: true }],
        },
        contatos: {
          create: [
            ...(lideranca.telefone
              ? [
                  {
                    tenantId,
                    tipo: 'celular',
                    valor: lideranca.telefone,
                    principal: true,
                  },
                ]
              : []),
            ...(lideranca.whatsapp && lideranca.whatsapp !== lideranca.telefone
              ? [{ tenantId, tipo: 'whatsapp', valor: lideranca.whatsapp }]
              : []),
          ],
        },
      },
    });

    await this.prisma.liderancaLocal.update({
      where: { id, tenantId },
      data: { pessoaId: pessoa.id },
    });

    return { pessoaId: pessoa.id, alreadyPromoted: false };
  }

  // Vereadores
  async getVereadoresHistoricos(tenantId: string, filters: any) {
    return this.prisma.vereadorHistorico.findMany({
      where: {
        tenantId,
        ...(filters.uf && { uf: filters.uf }),
        ...(filters.ano && { ano: parseInt(filters.ano) }),
        ...(filters.municipioId && { municipioId: filters.municipioId }),
        ...(filters.faixa && { faixaVotos: filters.faixa }),
        ...(filters.alinhamento && { alinhamento: filters.alinhamento }),
      },
      include: {
        municipio: { select: { nome: true } },
      },
      orderBy: { votosRecebidos: 'desc' },
      take: 1000,
    });
  }

  async getVereadorStats(tenantId: string, uf: string, ano: number) {
    const vers = await this.prisma.vereadorHistorico.findMany({
      where: { tenantId, uf, ano },
      select: {
        faixaVotos: true,
        alinhamento: true,
        eleito: true,
        votosRecebidos: true,
      },
    });

    const porFaixa: Record<string, number> = {};
    const porAlinhamento: Record<string, number> = {};
    let totalVotos = 0;
    let eleitos = 0;

    vers.forEach((r) => {
      const fx = r.faixaVotos || 'ate_150';
      porFaixa[fx] = (porFaixa[fx] || 0) + 1;
      const aln = r.alinhamento || 'desconhecido';
      porAlinhamento[aln] = (porAlinhamento[aln] || 0) + 1;
      totalVotos += r.votosRecebidos || 0;
      if (r.eleito) eleitos++;
    });

    return {
      total: vers.length,
      porFaixa,
      porAlinhamento,
      totalVotos,
      eleitos,
    };
  }

  async updateVereador(tenantId: string, id: string, data: any) {
    return this.prisma.vereadorHistorico.update({
      where: { id, tenantId },
      data,
    });
  }

  async popularVereadores(
    tenantId: string,
    uf: string,
    ano: number,
    votosMin: number,
  ) {
    // Dummy implementation. Will simulate calling RPC or processing
    return 0; // The actual logic would involve importing data
  }
}
