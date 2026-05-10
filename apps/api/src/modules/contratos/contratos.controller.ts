import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import { DecidirAprovacaoDto } from './dto/contratos.dto';

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
    @Request() req: AuthenticatedRequest,
    @CurrentTenant() tenantId: string,
  ) {
    return this.contratosService.getMinhasAprovacoesPendentes(
      req.user.sub,
      tenantId,
    );
  }

  @Put('aprovacoes/:id/decidir')
  decidirAprovacao(
    @Param('id') id: string,
    @Body() body: DecidirAprovacaoDto,
    @Request() req: AuthenticatedRequest,
    @CurrentTenant() tenantId: string,
  ) {
    return this.contratosService.decidirAprovacao(
      id,
      body.status,
      body.observacao || '',
      req.user.sub,
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
