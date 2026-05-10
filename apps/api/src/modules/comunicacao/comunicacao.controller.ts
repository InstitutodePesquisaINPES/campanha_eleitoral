import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ComunicacaoService } from './comunicacao.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import {
  CreatePautaDto,
  UpdatePautaDto,
  CreatePecaDto,
  UpdatePecaDto,
  CreateMencaoDto,
  UpdateMencaoDto,
} from './dto/comunicacao.dto';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('comunicacao')
export class ComunicacaoController {
  constructor(private readonly comunicacaoService: ComunicacaoService) {}

  @Post('enviar/massa')
  enviarEmMassa(
    @Body('campanhaId') campanhaId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.comunicacaoService.enviarEmMassa(campanhaId, tenantId);
  }

  @Post('enviar/individual')
  disparoIndividual(
    @Body('pessoaId') pessoaId: string,
    @Body('mensagem') mensagem: string,
    @Body('tipo') tipo: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.comunicacaoService.disparoIndividual(
      pessoaId,
      mensagem,
      tipo,
      tenantId,
    );
  }

  // --- Pautas ---
  @Get('pautas')
  async getPautas(@CurrentTenant() tenantId: string) {
    return this.comunicacaoService.getPautas(tenantId);
  }

  @Post('pautas')
  async createPauta(
    @CurrentTenant() tenantId: string,
    @Body() body: CreatePautaDto,
  ) {
    return this.comunicacaoService.createPauta(tenantId, body);
  }

  @Put('pautas/:id')
  async updatePauta(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdatePautaDto,
  ) {
    return this.comunicacaoService.updatePauta(tenantId, id, body);
  }

  @Delete('pautas/:id')
  async deletePauta(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.comunicacaoService.deletePauta(tenantId, id);
  }

  // --- Peças ---
  @Get('pecas')
  async getPecas(@CurrentTenant() tenantId: string) {
    return this.comunicacaoService.getPecas(tenantId);
  }

  @Post('pecas')
  async createPeca(
    @CurrentTenant() tenantId: string,
    @Request() req: AuthenticatedRequest,
    @Body() body: CreatePecaDto,
  ) {
    return this.comunicacaoService.createPeca(tenantId, {
      ...body,
      createdBy: req.user.sub,
    });
  }

  @Put('pecas/:id')
  async updatePeca(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdatePecaDto,
  ) {
    return this.comunicacaoService.updatePeca(tenantId, id, body);
  }

  @Delete('pecas/:id')
  async deletePeca(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.comunicacaoService.deletePeca(tenantId, id);
  }

  // --- Menções ---
  @Get('mencoes')
  async getMencoes(@CurrentTenant() tenantId: string) {
    return this.comunicacaoService.getMencoes(tenantId);
  }

  @Post('mencoes')
  async createMencao(
    @CurrentTenant() tenantId: string,
    @Body() body: CreateMencaoDto,
  ) {
    return this.comunicacaoService.createMencao(tenantId, body);
  }

  @Put('mencoes/:id')
  async updateMencao(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateMencaoDto,
  ) {
    return this.comunicacaoService.updateMencao(tenantId, id, body);
  }

  @Delete('mencoes/:id')
  async deleteMencao(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.comunicacaoService.deleteMencao(tenantId, id);
  }
}
