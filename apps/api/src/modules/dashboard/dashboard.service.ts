import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    // Buscar agregações do banco de dados relacional de forma eficiente
    const [
      totalPessoas,
      totalDemandas,
      totalAgenda,
      totalMunicipios,
      totalBairros,
      pessoasPorNivel,
      demandasPorStatus,
      demandasPorCategoria,
      agendaPorTipo,
      despesasRes,
      receitasRes,
    ] = await Promise.all([
      this.prisma.pessoa.count(),
      this.prisma.demanda.count(),
      this.prisma.agenda.count(),
      this.prisma.municipio.count(),
      this.prisma.bairro.count(),
      
      this.prisma.pessoa.groupBy({
        by: ['nivelRelacionamento'],
        _count: { id: true },
      }),
      this.prisma.demanda.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.demanda.groupBy({
        by: ['categoria'],
        _count: { id: true },
      }),
      this.prisma.agenda.groupBy({
        by: ['tipo'],
        _count: { id: true },
      }),
      this.prisma.despesa.aggregate({
        _sum: { valor: true },
      }),
      this.prisma.receita.aggregate({
        _sum: { valor: true },
      })
    ]);

    // Formatando agrupamentos para o formato esperado pelo frontend (Record<string, number>)
    const formatGroupBy = (data: any[], keyName: string) => {
      return data.reduce((acc, item) => {
        const key = item[keyName] || 'outros';
        acc[key] = item._count.id;
        return acc;
      }, {} as Record<string, number>);
    };

    const totalDespesas = despesasRes._sum.valor || 0;
    const totalReceitas = receitasRes._sum.valor || 0;

    const demandasResolvidas = demandasPorStatus.find(d => d.status === 'resolvida')?._count.id || 0;
    const demandasAbertas = totalDemandas - demandasResolvidas;

    // Monthly Trend (últimos 6 meses)
    // Para simplificar no SQL, vamos puxar os registros dos últimos 6 meses e agrupar no TS, 
    // ou poderiamos fazer raw query. Como o volume operacional é baixo/médio, puxar a data é ok, 
    // mas o ideal é fazer via banco. Vamos fazer raw query para alta performance.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);

    const [pessoasRecentes, demandasRecentes, agendaRecentes] = await Promise.all([
      this.prisma.pessoa.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true }
      }),
      this.prisma.demanda.findMany({
        where: { dataAbertura: { gte: sixMonthsAgo } },
        select: { dataAbertura: true }
      }),
      this.prisma.agenda.findMany({
        where: { dataInicio: { gte: sixMonthsAgo } },
        select: { dataInicio: true }
      })
    ]);

    const now = new Date();
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("pt-BR", { month: "short", year: "2-digit" });
      
      const pessoasCount = pessoasRecentes.filter(p => p.createdAt?.toISOString().startsWith(monthKey)).length;
      const demandasCount = demandasRecentes.filter(dd => dd.dataAbertura?.toISOString().startsWith(monthKey)).length;
      const eventosCount = agendaRecentes.filter(a => a.dataInicio?.toISOString().startsWith(monthKey)).length;
      
      return { label, pessoas: pessoasCount, demandas: demandasCount, eventos: eventosCount };
    });

    return {
      totals: {
        pessoas: totalPessoas,
        demandas: totalDemandas,
        agenda: totalAgenda,
        municipios: totalMunicipios,
        bairros: totalBairros,
        totalDespesas,
        totalReceitas,
        saldo: totalReceitas - totalDespesas,
        demandasResolvidas,
        demandasAbertas,
      },
      pessoasPorNivel: formatGroupBy(pessoasPorNivel, 'nivelRelacionamento'),
      demandasPorStatus: formatGroupBy(demandasPorStatus, 'status'),
      demandasPorCategoria: formatGroupBy(demandasPorCategoria, 'categoria'),
      agendaPorTipo: formatGroupBy(agendaPorTipo, 'tipo'),
      monthlyTrend,
      // Fallback arrays vazios para não quebrar compatibilidade
      despesasPorCategoria: {},
      receitasPorTipo: {},
      bairrosPorClassificacao: {}
    };
  }
}
