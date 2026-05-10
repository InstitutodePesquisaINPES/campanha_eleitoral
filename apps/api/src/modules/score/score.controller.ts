import { Controller, Get, UseGuards } from '@nestjs/common';
import { ScoreService } from './score.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gamificacao')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @Get('ranking')
  getRanking() {
    return this.scoreService.getRankingLiderancas();
  }
}
