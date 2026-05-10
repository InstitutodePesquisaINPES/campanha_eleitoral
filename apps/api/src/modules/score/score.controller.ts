import { Controller, Get, UseGuards } from '@nestjs/common';
import { ScoreService } from './score.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('gamificacao')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get('ranking')
  getRanking(@CurrentTenant() tenantId: string) {
    return this.scoreService.getRankingLiderancas(tenantId);
  }
}
