import { Module } from '@nestjs/common';
import { PesquisasService } from './pesquisas.service';
import { PesquisasController } from './pesquisas.controller';

@Module({
  controllers: [PesquisasController],
  providers: [PesquisasService],
  exports: [PesquisasService],
})
export class PesquisasModule {}
