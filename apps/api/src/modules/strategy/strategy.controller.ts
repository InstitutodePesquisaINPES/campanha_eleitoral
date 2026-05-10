import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { StrategyService } from './strategy.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import {
  CurrentTenant,
  CurrentUser,
} from '../../common/decorators/tenant.decorator';
import {
  CreateCampanhaDto,
  UpdateCampanhaDto,
  CreateEixoDto,
  UpdateEixoDto,
  CreatePlanoAcaoDto,
  UpdatePlanoAcaoDto,
  CreateParceriaDto,
} from './dto/strategy.dto';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('strategy')
export class StrategyController {
  constructor(private readonly strategyService: StrategyService) {}

  @Post('campanhas')
  createCampanha(
    @Body() data: CreateCampanhaDto,
    @CurrentUser() userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.strategyService.createCampanha(data, userId, tenantId);
  }

  @Get('campanhas')
  getCampanhas(@CurrentTenant() tenantId: string) {
    return this.strategyService.getCampanhas(tenantId);
  }

  @Post('campanhas/:id/eixos')
  createEixo(
    @Param('id') campanhaId: string,
    @Body() data: CreateEixoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.strategyService.createEixo(campanhaId, data, tenantId);
  }

  @Post('campanhas/:id/parcerias')
  createParceria(
    @Param('id') campanhaId: string,
    @Body() data: CreateParceriaDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.strategyService.createParceria(campanhaId, data, tenantId);
  }

  @Post('eixos/:eixoId/planos')
  createPlanoAcao(
    @Param('eixoId') eixoId: string,
    @Body() data: CreatePlanoAcaoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.strategyService.createPlanoAcao(eixoId, data, tenantId);
  }

  @Get('eixos/:eixoId/cronograma')
  getCronograma(
    @Param('eixoId') eixoId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.strategyService.getCronogramaPlanoAcao(eixoId, tenantId);
  }

  @Get('war-room/:campanhaId')
  getWarRoomStats(
    @Param('campanhaId') campanhaId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.strategyService.getWarRoomStats(campanhaId, tenantId);
  }

  @Patch('campanhas/:id')
  updateCampanha(
    @Param('id') id: string,
    @Body() data: UpdateCampanhaDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.strategyService.updateCampanha(id, data, tenantId);
  }

  @Delete('campanhas/:id')
  deleteCampanha(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.strategyService.deleteCampanha(id, tenantId);
  }

  @Patch('eixos/:id')
  updateEixo(
    @Param('id') id: string,
    @Body() data: UpdateEixoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.strategyService.updateEixo(id, data, tenantId);
  }

  @Delete('eixos/:id')
  deleteEixo(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.strategyService.deleteEixo(id, tenantId);
  }

  @Patch('planos/:id')
  updatePlanoAcao(
    @Param('id') id: string,
    @Body() data: UpdatePlanoAcaoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.strategyService.updatePlanoAcao(id, data, tenantId);
  }

  @Delete('planos/:id')
  deletePlanoAcao(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.strategyService.deletePlanoAcao(id, tenantId);
  }

  @Delete('parcerias/:id')
  deleteParceria(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.strategyService.deleteParceria(id, tenantId);
  }
}
