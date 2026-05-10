import { Module } from '@nestjs/common';
import { CampoService } from './campo.service';
import { CampoController } from './campo.controller';

@Module({
  controllers: [CampoController],
  providers: [CampoService],
  exports: [CampoService],
})
export class CampoModule {}
