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
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../../common/guards/tenant.guard';

@UseGuards(AuthGuard('jwt'), TenantGuard)
@Controller('comunicacao')
export class ComunicacaoController {
  constructor(private readonly comunicacaoService: ComunicacaoService) {}

  @Post('enviar/massa')
  enviarEmMassa(@Body('campanhaId') campanhaId: string, @Request() req: any) {
    return this.comunicacaoService.enviarEmMassa(campanhaId, req.tenantId);
  }

  @Post('enviar/individual')
  disparoIndividual(
    @Body('pessoaId') pessoaId: string,
    @Body('mensagem') mensagem: string,
    @Body('tipo') tipo: string,
    @Request() req: any,
  ) {
    return this.comunicacaoService.disparoIndividual(
      pessoaId,
      mensagem,
      tipo,
      req.tenantId,
    );
  }

  // --- Pautas ---
  @Get('pautas')
  async getPautas(@Request() req: any) {
    return this.comunicacaoService.getPautas(req.tenantId);
  }

  @Post('pautas')
  async createPauta(@Request() req: any, @Body() body: any) {
    return this.comunicacaoService.createPauta(req.tenantId, body);
  }

  @Put('pautas/:id')
  async updatePauta(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.comunicacaoService.updatePauta(req.tenantId, id, body);
  }

  @Delete('pautas/:id')
  async deletePauta(@Request() req: any, @Param('id') id: string) {
    return this.comunicacaoService.deletePauta(req.tenantId, id);
  }

  // --- Peças ---
  @Get('pecas')
  async getPecas(@Request() req: any) {
    return this.comunicacaoService.getPecas(req.tenantId);
  }

  @Post('pecas')
  async createPeca(@Request() req: any, @Body() body: any) {
    return this.comunicacaoService.createPeca(req.tenantId, body);
  }

  @Put('pecas/:id')
  async updatePeca(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.comunicacaoService.updatePeca(req.tenantId, id, body);
  }

  @Delete('pecas/:id')
  async deletePeca(@Request() req: any, @Param('id') id: string) {
    return this.comunicacaoService.deletePeca(req.tenantId, id);
  }

  // --- Menções ---
  @Get('mencoes')
  async getMencoes(@Request() req: any) {
    return this.comunicacaoService.getMencoes(req.tenantId);
  }

  @Post('mencoes')
  async createMencao(@Request() req: any, @Body() body: any) {
    return this.comunicacaoService.createMencao(req.tenantId, body);
  }

  @Put('mencoes/:id')
  async updateMencao(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.comunicacaoService.updateMencao(req.tenantId, id, body);
  }

  @Delete('mencoes/:id')
  async deleteMencao(@Request() req: any, @Param('id') id: string) {
    return this.comunicacaoService.deleteMencao(req.tenantId, id);
  }
}
