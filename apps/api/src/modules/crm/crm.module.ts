import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { SegmentacaoService } from './segmentacao.service';

@Module({
  controllers: [CrmController],
  providers: [CrmService, SegmentacaoService],
  exports: [CrmService, SegmentacaoService],
})
export class CrmModule {}
