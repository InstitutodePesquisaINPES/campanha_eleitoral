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
import { ContratosService } from './contratos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Request } from '@nestjs/common';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Get('aprovacoes')
  getAprovacoes(
    @Query('contratoId') contratoId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.contratosService.getAprovacoes(contratoId, tenantId);
  }

  @Get('minhas-aprovacoes')
  getMinhasAprovacoesPendentes(
    @Request() req: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.contratosService.getMinhasAprovacoesPendentes(
      req.user.userId,
      tenantId,
    );
  }

  @Put('aprovacoes/:id/decidir')
  decidirAprovacao(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('observacao') observacao: string,
    @Request() req: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.contratosService.decidirAprovacao(
      id,
      status,
      observacao,
      req.user.userId,
      tenantId,
    );
  }

  @Post(':contratoId/recriar-aprovacoes')
  recriarAprovacoes(
    @Param('contratoId') contratoId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.contratosService.recriarAprovacoes(contratoId, tenantId);
  }
}
