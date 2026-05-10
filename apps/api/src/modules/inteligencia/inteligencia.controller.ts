import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { InteligenciaService } from './inteligencia.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Request } from '@nestjs/common';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('inteligencia')
export class InteligenciaController {
  constructor(private readonly inteligenciaService: InteligenciaService) {}

  @Get('kpis')
  getKpis(
    @Query('campanhaId') campanhaId: string,
    @Query('uf') uf: string,
    @Query('ano') ano: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.inteligenciaService.getKpis(
      campanhaId,
      uf,
      parseInt(ano) || 2024,
      tenantId,
    );
  }

  // Lideranças
  @Get('liderancas')
  getLiderancas(@CurrentTenant() tenantId: string, @Query() filters: any) {
    return this.inteligenciaService.getLiderancas(tenantId, filters);
  }

  @Get('liderancas/stats')
  getLiderancaStats(
    @CurrentTenant() tenantId: string,
    @Query('campanhaId') campanhaId?: string,
  ) {
    return this.inteligenciaService.getLiderancaStats(tenantId, campanhaId);
  }

  @Post('liderancas')
  createLideranca(@CurrentTenant() tenantId: string, @Body() payload: any) {
    return this.inteligenciaService.upsertLideranca(
      tenantId,
      undefined,
      payload,
    );
  }

  @Put('liderancas/:id')
  updateLideranca(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() payload: any,
  ) {
    return this.inteligenciaService.upsertLideranca(tenantId, id, payload);
  }

  @Post('liderancas/:id/promover')
  promoverLideranca(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.inteligenciaService.promoverLiderancaParaCRM(
      tenantId,
      req.user.userId,
      id,
    );
  }

  @Delete('liderancas/:id')
  deleteLideranca(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.inteligenciaService.removeLideranca(tenantId, id);
  }

  // Vereadores
  @Get('vereadores')
  getVereadores(@CurrentTenant() tenantId: string, @Query() filters: any) {
    return this.inteligenciaService.getVereadoresHistoricos(tenantId, filters);
  }

  @Get('vereadores/stats')
  getVereadorStats(
    @CurrentTenant() tenantId: string,
    @Query('uf') uf: string,
    @Query('ano') ano: string,
  ) {
    return this.inteligenciaService.getVereadorStats(
      tenantId,
      uf || 'BA',
      parseInt(ano) || 2024,
    );
  }

  @Put('vereadores/:id')
  updateVereador(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() payload: any,
  ) {
    return this.inteligenciaService.updateVereador(tenantId, id, payload);
  }

  @Post('vereadores/popular')
  popularVereadores(
    @CurrentTenant() tenantId: string,
    @Body() payload: { uf: string; ano: number; votosMin: number },
  ) {
    return this.inteligenciaService.popularVereadores(
      tenantId,
      payload.uf || 'BA',
      payload.ano || 2024,
      payload.votosMin || 150,
    );
  }
}
