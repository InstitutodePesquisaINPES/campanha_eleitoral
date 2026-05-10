import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { TerritorialModule } from './modules/territorial/territorial.module';
import { CrmModule } from './modules/crm/crm.module';
import { DemandasModule } from './modules/demandas/demandas.module';
import { AgendaModule } from './modules/agenda/agenda.module';
import { FinanceiroModule } from './modules/financeiro/financeiro.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HealthModule,
    TerritorialModule,
    CrmModule,
    DemandasModule,
    AgendaModule,
    FinanceiroModule,
    DashboardModule,
  ],
})
export class AppModule {}
