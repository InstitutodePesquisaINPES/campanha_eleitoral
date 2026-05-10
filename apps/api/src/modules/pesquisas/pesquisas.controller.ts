import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PesquisasService } from './pesquisas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import {
  UpsertPesquisaDto,
  UpsertResultadoDto,
  UpsertDoadorDto,
} from './dto/pesquisas.dto';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('pesquisas')
export class PesquisasController {
  constructor(private readonly pesquisasService: PesquisasService) {}

  @Get()
  getPesquisas(@CurrentTenant() tenantId: string) {
    return this.pesquisasService.getPesquisas(tenantId);
  }

  @Post()
  createPesquisa(
    @Body() payload: UpsertPesquisaDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pesquisasService.upsertPesquisa(tenantId, undefined, payload);
  }

  @Put(':id')
  updatePesquisa(
    @Param('id') id: string,
    @Body() payload: UpsertPesquisaDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pesquisasService.upsertPesquisa(tenantId, id, payload);
  }

  @Post('resultados')
  createResultado(
    @Body() payload: UpsertResultadoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pesquisasService.upsertResultado(tenantId, undefined, payload);
  }

  @Put('resultados/:id')
  updateResultado(
    @Param('id') id: string,
    @Body() payload: UpsertResultadoDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pesquisasService.upsertResultado(tenantId, id, payload);
  }

  @Get('captacao')
  getCaptacaoDoadores(@CurrentTenant() tenantId: string) {
    return this.pesquisasService.getCaptacaoDoadores(tenantId);
  }

  @Post('captacao')
  createDoador(
    @Body() payload: UpsertDoadorDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pesquisasService.upsertDoador(tenantId, undefined, payload);
  }

  @Put('captacao/:id')
  updateDoador(
    @Param('id') id: string,
    @Body() payload: UpsertDoadorDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.pesquisasService.upsertDoador(tenantId, id, payload);
  }

  @Delete('captacao/:id')
  removeDoador(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.pesquisasService.removeDoador(tenantId, id);
  }
}
