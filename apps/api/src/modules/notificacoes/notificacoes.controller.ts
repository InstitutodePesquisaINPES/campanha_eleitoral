import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  getNotificacoes(
    @Request() req: AuthenticatedRequest,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificacoesService.getNotificacoes(req.user.sub, tenantId);
  }

  @Put(':id/lida')
  marcarLida(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificacoesService.marcarLida(id, req.user.sub, tenantId);
  }

  @Put('lidas')
  marcarTodasLidas(
    @Request() req: AuthenticatedRequest,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificacoesService.marcarTodasLidas(req.user.sub, tenantId);
  }

  @Delete(':id')
  remover(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificacoesService.remover(id, req.user.sub, tenantId);
  }
}
