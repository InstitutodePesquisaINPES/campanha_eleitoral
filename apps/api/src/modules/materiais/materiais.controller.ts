import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { MateriaisService } from './materiais.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import type { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';
import {
  CreateMaterialDto,
  CreateEstoqueDto,
  CreateMovimentacaoDto,
} from './dto/materiais.dto';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('materiais')
export class MateriaisController {
  constructor(private readonly materiaisService: MateriaisService) {}

  // ---- MATERIAIS ----
  @Get()
  getMateriais(@CurrentTenant() tenantId: string) {
    return this.materiaisService.getMateriais(tenantId);
  }

  @Post()
  createMaterial(
    @Body() data: CreateMaterialDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.materiaisService.createMaterial(data, tenantId);
  }

  @Delete(':id')
  deleteMaterial(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.materiaisService.deleteMaterial(id, tenantId);
  }

  // ---- ESTOQUES ----
  @Get('estoques')
  getEstoques(@CurrentTenant() tenantId: string) {
    return this.materiaisService.getEstoques(tenantId);
  }

  @Post('estoques')
  createEstoque(
    @Body() data: CreateEstoqueDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.materiaisService.createEstoque(data, tenantId);
  }

  // ---- MOVIMENTACOES ----
  @Get('movimentacoes')
  getMovimentacoes(
    @Query('estoqueId') estoqueId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.materiaisService.getMovimentacoes(estoqueId, tenantId);
  }

  @Post('movimentacoes')
  createMovimentacao(
    @Body() data: CreateMovimentacaoDto,
    @Request() req: AuthenticatedRequest,
    @CurrentTenant() tenantId: string,
  ) {
    const dataWithUser = { ...data, responsavelId: req.user.sub };
    return this.materiaisService.createMovimentacao(dataWithUser, tenantId);
  }
}
