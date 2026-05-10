import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { TerritorialModule } from './modules/territorial/territorial.module';
import { CrmModule } from './modules/crm/crm.module';
import { DemandasModule } from './modules/demandas/demandas.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ScoreModule } from './modules/score/score.module';
import { ComunicacaoModule } from './modules/comunicacao/comunicacao.module';
import { StrategyModule } from './modules/strategy/strategy.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') ? parseInt(configService.get('REDIS_PORT')) : 6379,
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    TerritorialModule,
    CrmModule,
    DemandasModule,
    AgendaModule,
    FinanceiroModule,
    DashboardModule,
    ScoreModule,
    ComunicacaoModule,
    StrategyModule,
  ],
})
export class AppModule {}
