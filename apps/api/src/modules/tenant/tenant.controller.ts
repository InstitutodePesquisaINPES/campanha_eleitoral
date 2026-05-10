import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/**
 * Rotas de gestão de Tenants/Workspaces.
 * Rotas globais exigem 'super-admin'.
 * Rotas de settings exigem 'admin' (do próprio tenant, validado via token).
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /** GET /tenants — Lista todos os Workspaces (Apenas Super-Admin SaaS) */
  @Get()
  @Roles('super-admin')
  findAll() {
    return this.tenantService.findAll();
  }

  /** POST /tenants — Cria um novo Workspace/Campanha (Pode ser aberto ou super-admin) */
  @Post()
  @Roles('super-admin')
  create(@Body() body: { name: string; slug: string }) {
    return this.tenantService.create(body.name, body.slug);
  }

  /** GET /tenants/:id — Detalhe de um Workspace */
  @Get(':id')
  @Roles('super-admin')
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  /** PATCH /tenants/:id — Atualiza nome ou status */
  @Patch(':id')
  @Roles('super-admin')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; active?: boolean },
  ) {
    return this.tenantService.update(id, body);
  }

  /** PATCH /tenants/:id/deactivate — Desativa (soft-delete) */
  @Patch(':id/deactivate')
  @Roles('super-admin')
  deactivate(@Param('id') id: string) {
    return this.tenantService.deactivate(id);
  }

  // --- CONFIGURAÇÕES DE TENANT (SaaS Visual - Cada Tenant mexe no seu) ---

  @Get('settings/current')
  @Roles('admin')
  getSettings(@CurrentTenant() tenantId: string) {
    if (!tenantId) throw new UnauthorizedException('TenantId não identificado');
    return this.tenantService.getSettings(tenantId);
  }

  @Patch('settings/current')
  @Roles('admin')
  updateSettings(@CurrentTenant() tenantId: string, @Body() body: any) {
    if (!tenantId) throw new UnauthorizedException('TenantId não identificado');
    return this.tenantService.updateSettings(tenantId, body);
  }
}
