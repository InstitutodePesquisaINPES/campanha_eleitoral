import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  async getAprovacoes(contratoId: string, tenantId: string) {
    return this.prisma.contratoAprovacao.findMany({
      where: { contratoId, tenantId },
      orderBy: { ordem: 'asc' },
    });
  }

  async getMinhasAprovacoesPendentes(userId: string, tenantId: string) {
    // Replaces v_minhas_aprovacoes_pendentes
    const aprovacoes = await this.prisma.contratoAprovacao.findMany({
      where: {
        aprovadorId: userId,
        status: 'pendente',
        tenantId,
      },
      include: {
        contrato: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return aprovacoes.map((a) => ({
      id: a.id,
      contrato_id: a.contratoId,
      ordem: a.ordem,
      papel: a.papel,
      exige_observacao: a.exigeObservacao,
      numero: a.contrato.numero,
      objeto: a.contrato.objeto,
      valor: a.contrato.valor,
      data_inicio: a.contrato.dataInicio,
      data_fim: a.contrato.dataFim,
    }));
  }

  async decidirAprovacao(
    id: string,
    status: string,
    observacao: string,
    userId: string,
    tenantId: string,
  ) {
    const aprovacao = await this.prisma.contratoAprovacao.findFirst({
      where: { id, tenantId },
    });

    if (!aprovacao) throw new NotFoundException('Aprovação não encontrada');

    return this.prisma.contratoAprovacao.update({
      where: { id },
      data: {
        status,
        observacao,
        decididoEm: new Date(),
        aprovadorId: userId, // Ensure the current user is recorded as the approver
      },
    });
  }

  async recriarAprovacoes(contratoId: string, tenantId: string) {
    // Replaces RPC 'criar_aprovacoes_contrato'
    // First, delete existing
    await this.prisma.contratoAprovacao.deleteMany({
      where: { contratoId, tenantId },
    });

    // Create default workflow
    return this.prisma.contratoAprovacao.createMany({
      data: [
        { contratoId, ordem: 1, papel: 'tesoureiro', tenantId },
        { contratoId, ordem: 2, papel: 'juridico', tenantId },
        { contratoId, ordem: 3, papel: 'candidato', tenantId },
      ],
    });
  }
}
