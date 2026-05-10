import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MateriaisService } from './materiais.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import { Request } from '@nestjs/common';

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
  createMaterial(@Body() data: any, @CurrentTenant() tenantId: string) {
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
  createEstoque(@Body() data: any, @CurrentTenant() tenantId: string) {
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
    @Body() data: any,
    @Request() req: any,
    @CurrentTenant() tenantId: string,
  ) {
    const dataWithUser = { ...data, responsavelId: req.user.userId };
    return this.materiaisService.createMovimentacao(dataWithUser, tenantId);
  }
}
