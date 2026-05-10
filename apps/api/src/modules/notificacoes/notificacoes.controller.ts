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

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  getNotificacoes(@Request() req: any, @CurrentTenant() tenantId: string) {
    return this.notificacoesService.getNotificacoes(req.user.userId, tenantId);
  }

  @Put(':id/lida')
  marcarLida(
    @Param('id') id: string,
    @Request() req: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificacoesService.marcarLida(id, req.user.userId, tenantId);
  }

  @Put('lidas')
  marcarTodasLidas(@Request() req: any, @CurrentTenant() tenantId: string) {
    return this.notificacoesService.marcarTodasLidas(req.user.userId, tenantId);
  }

  @Delete(':id')
  remover(
    @Param('id') id: string,
    @Request() req: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificacoesService.remover(id, req.user.userId, tenantId);
  }
}
