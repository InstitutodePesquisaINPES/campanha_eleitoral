import { Module } from '@nestjs/common';
import { TerritorioService } from './territorio.service';
import { TerritorioController } from './territorio.controller';
import { IbgeService } from './ibge.service';
import { ViaCepService } from './viacep.service';

@Module({
  controllers: [TerritorioController],
  providers: [TerritorioService, IbgeService, ViaCepService],
  exports: [TerritorioService, IbgeService, ViaCepService],
})
export class TerritorioModule {}
