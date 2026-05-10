import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ComunicacaoService {
  private readonly logger = new Logger(ComunicacaoService.name);

  constructor(
    @InjectQueue('comunicacao-queue') private comunicacaoQueue: Queue,
    private readonly prisma: PrismaService
  ) {}

  async enviarEmMassa(campanhaId: string) {
    const campanha = await this.prisma.comunicacaoCampanha.findUnique({
      where: { id: campanhaId },
    });

    if (!campanha) throw new Error("Campanha não encontrada.");

    // Atualiza status para processando
    await this.prisma.comunicacaoCampanha.update({
      where: { id: campanhaId },
      data: { status: 'processing' }
    });

    // Simulando segmentação simples (na vida real cruzaria com os "filtros" JSON)
    const pessoas = await this.prisma.pessoa.findMany({
      where: { /* filtros dinâmicos viriam aqui */ },
      select: { id: true }
    });

    this.logger.log(`Adicionando ${pessoas.length} mensagens na fila para campanha ${campanhaId}`);

    // Adiciona na fila do BullMQ
    const jobs = pessoas.map(p => ({
      name: 'enviarMensagem',
      data: {
        campanhaId,
        pessoaId: p.id,
        tipo: campanha.tipo,
        mensagem: campanha.mensagem
      }
    }));

    await this.comunicacaoQueue.addBulk(jobs);

    return { success: true, total: pessoas.length };
  }

  async disparoIndividual(pessoaId: string, mensagem: string, tipo = 'whatsapp') {
    // Registra o Log pendente no banco
    const log = await this.prisma.comunicacaoLog.create({
      data: {
        pessoaId,
        tipo,
        mensagem,
        status: 'pending'
      }
    });

    // Envia pra fila processar em background
    await this.comunicacaoQueue.add('enviarMensagem', {
      logId: log.id,
      pessoaId,
      tipo,
      mensagem
    });

    return log;
  }
}
