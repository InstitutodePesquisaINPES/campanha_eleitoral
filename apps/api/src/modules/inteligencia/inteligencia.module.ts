import { Module } from '@nestjs/common';
import { InteligenciaService } from './inteligencia.service';
import { InteligenciaController } from './inteligencia.controller';

@Module({
  controllers: [InteligenciaController],
  providers: [InteligenciaService],
  exports: [InteligenciaService],
})
export class InteligenciaModule {}
