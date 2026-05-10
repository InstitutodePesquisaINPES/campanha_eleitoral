import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ComunicacaoController } from './comunicacao.controller';
import { ComunicacaoService } from './comunicacao.service';
import { ComunicacaoProcessor } from './comunicacao.processor';
import { WhatsappProvider } from './providers/whatsapp.provider';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'comunicacao-queue',
    }),
  ],
  controllers: [ComunicacaoController],
  providers: [ComunicacaoService, ComunicacaoProcessor, WhatsappProvider],
  exports: [ComunicacaoService],
})
export class ComunicacaoModule {}
