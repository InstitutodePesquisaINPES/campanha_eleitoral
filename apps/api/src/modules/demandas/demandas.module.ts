import { Module } from '@nestjs/common';
import { DemandasController } from './demandas.controller';
import { DemandasService } from './demandas.service';

@Module({
  controllers: [DemandasController],
  providers: [DemandasService],
  exports: [DemandasService],
})
export class DemandasModule {}
