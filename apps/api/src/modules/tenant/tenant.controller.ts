import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * Rotas de gestão de Tenants/Workspaces.
 * Apenas usuários autenticados (com roles de admin) devem acessar.
 */
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /** GET /tenants — Lista todos os Workspaces */
  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  /** POST /tenants — Cria um novo Workspace/Campanha */
  @Post()
  create(@Body() body: { name: string; slug: string }) {
    return this.tenantService.create(body.name, body.slug);
  }

  /** GET /tenants/:id — Detalhe de um Workspace */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  /** PATCH /tenants/:id — Atualiza nome ou status */
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { name?: string; active?: boolean }) {
    return this.tenantService.update(id, body);
  }

  /** PATCH /tenants/:id/deactivate — Desativa (soft-delete) */
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.tenantService.deactivate(id);
  }
}
