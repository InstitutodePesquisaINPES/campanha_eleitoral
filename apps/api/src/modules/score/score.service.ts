import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Processa dinamicamente a adição de pontos a uma pessoa baseado em uma Regra.
   */
  async processarAcao(pessoaId: string, acao: string) {
    try {
      const regra = await this.prisma.gamificacaoRegra.findUnique({
        where: { acao },
      });

      if (!regra || !regra.ativo || regra.pontos === 0) {
        return null;
      }

      const pessoaAtualizada = await this.prisma.pessoa.update({
        where: { id: pessoaId },
        data: {
          score: { increment: regra.pontos },
        },
      });

      this.logger.log(`Adicionado ${regra.pontos} pts para a pessoa ${pessoaId} (Ação: ${acao})`);
      
      // Se a pessoa tiver uma liderança atrelada, a liderança também recebe um bônus (ex: 20% do valor)
      if (pessoaAtualizada.liderancaId) {
        const bonusLideranca = Math.ceil(regra.pontos * 0.2);
        await this.prisma.pessoa.update({
          where: { id: pessoaAtualizada.liderancaId },
          data: { score: { increment: bonusLideranca } }
        });
        this.logger.log(`Bônus de Liderança de ${bonusLideranca} pts repassado para ${pessoaAtualizada.liderancaId}`);
      }

      return pessoaAtualizada;
    } catch (e) {
      this.logger.error(`Erro ao processar pontuação de gamificação: ${e.message}`);
      return null;
    }
  }

  /**
   * Retorna o Ranking de Lideranças que trouxeram o maior volume de eleitores
   * ou que possuem o maior somatório de Score nos seus eleitores "filhos".
   */
  async getRankingLiderancas() {
    // Top 10 Lideranças por quantidade de eleitores captados e somatório do score deles
    const liderancas = await this.prisma.pessoa.findMany({
      where: { isLideranca: true },
      select: {
        id: true,
        fullName: true,
        score: true,
        _count: {
          select: { votosCaptados: true }
        }
      },
      orderBy: {
        score: 'desc',
      },
      take: 10,
    });

    return liderancas.map(l => ({
      id: l.id,
      nome: l.fullName,
      scoreLider: l.score,
      eleitoresCaptados: l._count.votosCaptados
    }));
  }
}
