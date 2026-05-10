import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import {
  CurrentTenant,
  CurrentUser,
} from '../../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  // ---- CENTROS DE CUSTO ----
  @Get('centros-custo')
  getCentrosCusto(@CurrentTenant() tenantId: string) {
    return this.financeiroService.getCentrosCusto(tenantId);
  }

  @Post('centros-custo')
  createCentroCusto(@Body() data: any, @CurrentTenant() tenantId: string) {
    return this.financeiroService.createCentroCusto(data, tenantId);
  }

  @Delete('centros-custo/:id')
  removeCentroCusto(
    @Param('id') id: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeiroService.deleteCentroCusto(id, tenantId);
  }

  // ---- DESPESAS ----
  @Get('despesas')
  findAllDespesas(
    @CurrentTenant() tenantId: string,
    @Query('centroCustoId') centroCustoId?: string,
  ) {
    return this.financeiroService.findAllDespesas(tenantId, centroCustoId);
  }

  @Post('despesas')
  createDespesa(
    @Body() data: any,
    @CurrentUser() userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeiroService.createDespesa(data, userId, tenantId);
  }

  @Patch('despesas/:id')
  updateDespesa(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.financeiroService.updateDespesa(id, data, tenantId);
  }

  @Delete('despesas/:id')
  removeDespesa(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.financeiroService.deleteDespesa(id, tenantId);
  }

  // ---- RECEITAS ----
  @Get('receitas')
  findAllReceitas(
    @CurrentTenant() tenantId: string,
    @Query('centroCustoId') centroCustoId?: string,
  ) {
    return this.financeiroService.findAllReceitas(tenantId, centroCustoId);
  }

  @Post('receitas')
  createReceita(@Body() data: any, @CurrentTenant() tenantId: string) {
    return this.financeiroService.createReceita(data, tenantId);
  }

  @Delete('receitas/:id')
  removeReceita(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.financeiroService.deleteReceita(id, tenantId);
  }
}
