import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DemandasService } from './demandas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import {
  CurrentTenant,
  CurrentUser,
} from '../../common/decorators/tenant.decorator';
import {
  CreateDemandaDto,
  UpdateDemandaDto,
  CreateEncaminhamentoDto,
  CreateAnexoDto,
} from './dto/demandas.dto';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('demandas')
export class DemandasController {
  constructor(private readonly demandasService: DemandasService) {}

  @Get()
  findAll(
    @Query() filters: Record<string, string>,
    @CurrentTenant() tenantId: string,
  ) {
    return this.demandasService.findAll(filters, tenantId);
  }

  @Get('stats')
  getStats(@CurrentTenant() tenantId: string) {
    return this.demandasService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.demandasService.findOne(id, tenantId);
  }

  @Post()
  create(
    @Body() data: CreateDemandaDto,
    @CurrentUser() userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.demandasService.create(data, userId, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateDemandaDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.demandasService.update(id, data, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.demandasService.delete(id, tenantId);
  }

  // ---- ENCAMINHAMENTOS ----
  @Get(':id/encaminhamentos')
  getEncaminhamentos(@Param('id') id: string) {
    return this.demandasService.getEncaminhamentos(id);
  }

  @Post(':id/encaminhamentos')
  createEncaminhamento(
    @Param('id') id: string,
    @Body() data: CreateEncaminhamentoDto,
    @CurrentUser() userId: string,
  ) {
    return this.demandasService.createEncaminhamento(
      { ...data, demandaId: id },
      userId,
    );
  }

  // ---- ANEXOS ----
  @Get(':id/anexos')
  getAnexos(@Param('id') id: string) {
    return this.demandasService.getAnexos(id);
  }

  @Post(':id/anexos')
  createAnexo(@Param('id') id: string, @Body() data: CreateAnexoDto) {
    return this.demandasService.createAnexo({ ...data, demandaId: id });
  }
}
