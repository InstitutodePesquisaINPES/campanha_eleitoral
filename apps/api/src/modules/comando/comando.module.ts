import { Module } from '@nestjs/common';
import { ComandoService } from './comando.service';
import { ComandoController } from './comando.controller';

@Module({
  controllers: [ComandoController],
  providers: [ComandoService],
  exports: [ComandoService],
})
export class ComandoModule {}
