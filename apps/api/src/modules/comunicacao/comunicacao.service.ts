import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreatePautaDto,
  UpdatePautaDto,
  CreatePecaDto,
  UpdatePecaDto,
  CreateMencaoDto,
  UpdateMencaoDto,
} from './dto/comunicacao.dto';

@Injectable()
export class ComunicacaoService {
  private readonly logger = new Logger(ComunicacaoService.name);

  constructor(
    @InjectQueue('comunicacao-queue') private comunicacaoQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async enviarEmMassa(campanhaId: string, tenantId: string) {
    const campanha = await this.prisma.comunicacaoCampanha.findFirst({
      where: { id: campanhaId, tenantId },
    });

    if (!campanha)
      throw new Error('Campanha não encontrada ou não pertence a este tenant.');

    // Atualiza status para processando
    await this.prisma.comunicacaoCampanha.update({
      where: { id: campanhaId },
      data: { status: 'processing' },
    });

    // Simulando segmentação simples (na vida real cruzaria com os "filtros" JSON)
    const pessoas = await this.prisma.pessoa.findMany({
      where: { tenantId /* filtros dinâmicos viriam aqui */ },
      select: { id: true },
    });

    this.logger.log(
      `Adicionando ${pessoas.length} mensagens na fila para campanha ${campanhaId}`,
    );

    // Adiciona na fila do BullMQ
    const jobs = pessoas.map((p) => ({
      name: 'enviarMensagem',
      data: {
        campanhaId,
        pessoaId: p.id,
        tipo: campanha.tipo,
        mensagem: campanha.mensagem,
        tenantId,
      },
    }));

    await this.comunicacaoQueue.addBulk(jobs);

    return { success: true, total: pessoas.length };
  }

  async disparoIndividual(
    pessoaId: string,
    mensagem: string,
    tipo = 'whatsapp',
    tenantId: string,
  ) {
    // Assert person belongs to tenant
    const pessoa = await this.prisma.pessoa.findFirst({
      where: { id: pessoaId, tenantId },
    });
    if (!pessoa) throw new Error('Pessoa não encontrada neste tenant.');

    // Registra o Log pendente no banco
    const log = await this.prisma.comunicacaoLog.create({
      data: {
        pessoaId,
        tipo,
        mensagem,
        status: 'pending',
        tenantId,
      },
    });

    // Envia pra fila processar em background
    await this.comunicacaoQueue.add('enviarMensagem', {
      logId: log.id,
      pessoaId,
      tipo,
      mensagem,
      tenantId,
    });

    return log;
  }

  // --- Pautas ---
  async getPautas(tenantId: string) {
    return this.prisma.comunicacaoPauta.findMany({
      where: { tenantId },
      include: { pecas: true },
    });
  }

  async createPauta(tenantId: string, data: CreatePautaDto) {
    return this.prisma.comunicacaoPauta.create({ data: { ...data, tenantId } });
  }

  async updatePauta(tenantId: string, id: string, data: UpdatePautaDto) {
    return this.prisma.comunicacaoPauta.update({
      where: { id, tenantId },
      data,
    });
  }

  async deletePauta(tenantId: string, id: string) {
    return this.prisma.comunicacaoPauta.delete({ where: { id, tenantId } });
  }

  // --- Peças ---
  async getPecas(tenantId: string) {
    return this.prisma.comunicacaoPeca.findMany({ where: { tenantId } });
  }

  async createPeca(
    tenantId: string,
    data: CreatePecaDto & { createdBy: string },
  ) {
    return this.prisma.comunicacaoPeca.create({ data: { ...data, tenantId } });
  }

  async updatePeca(tenantId: string, id: string, data: UpdatePecaDto) {
    return this.prisma.comunicacaoPeca.update({
      where: { id, tenantId },
      data,
    });
  }

  async deletePeca(tenantId: string, id: string) {
    return this.prisma.comunicacaoPeca.delete({ where: { id, tenantId } });
  }

  // --- Menções ---
  async getMencoes(tenantId: string) {
    return this.prisma.comunicacaoMencao.findMany({ where: { tenantId } });
  }

  async createMencao(tenantId: string, data: CreateMencaoDto) {
    return this.prisma.comunicacaoMencao.create({
      data: { ...data, tenantId },
    });
  }

  async updateMencao(tenantId: string, id: string, data: UpdateMencaoDto) {
    return this.prisma.comunicacaoMencao.update({
      where: { id, tenantId },
      data,
    });
  }

  async deleteMencao(tenantId: string, id: string) {
    return this.prisma.comunicacaoMencao.delete({ where: { id, tenantId } });
  }
}
