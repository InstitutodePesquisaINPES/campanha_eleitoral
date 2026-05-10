import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ComandoService } from './comando.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import {
  CreateReuniaoDto,
  UpdateReuniaoDto,
  CreateDeliberacaoDto,
} from './dto/comando.dto';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('comando')
export class ComandoController {
  constructor(private readonly comandoService: ComandoService) {}

  @Get('indicadores')
  getIndicadores(@CurrentTenant() tenantId: string) {
    return this.comandoService.getIndicadoresCampanha(tenantId);
  }

  @Get('burndown')
  getBurndown(
    @Query('campanhaId') campanhaId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.comandoService.getBurndown(campanhaId, tenantId);
  }

  @Get('reunioes')
  getReunioes(@CurrentTenant() tenantId: string) {
    return this.comandoService.getReunioes(tenantId);
  }

  @Post('reunioes')
  createReuniao(
    @Body() data: CreateReuniaoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.comandoService.createReuniao(data, tenantId);
  }

  @Put('reunioes/:id')
  updateReuniao(
    @Param('id') id: string,
    @Body() data: UpdateReuniaoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.comandoService.updateReuniao(id, data, tenantId);
  }

  @Get('deliberacoes')
  getDeliberacoes(
    @Query('reuniaoId') reuniaoId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.comandoService.getDeliberacoes(reuniaoId, tenantId);
  }

  @Post('deliberacoes')
  createDeliberacao(
    @Body() data: CreateDeliberacaoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.comandoService.createDeliberacao(data, tenantId);
  }

  @Put('deliberacoes/:id/status')
  toggleDeliberacao(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.comandoService.toggleDeliberacao(id, status, tenantId);
  }
}
