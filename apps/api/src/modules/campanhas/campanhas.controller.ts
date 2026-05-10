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
import { CampanhasService } from './campanhas.service';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/tenant.decorator';
import {
  CreateCampanhaDto,
  UpdateCampanhaDto,
  CreateTarefaDto,
  UpdateTarefaDto,
  CreateMetaDto,
  UpdateMetaDto,
  CreateSemanaDto,
  UpdateSemanaDto,
} from './dto/campanhas.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    [key: string]: unknown;
  };
  tenantId: string;
}

@Controller('campanhas')
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class CampanhasController {
  constructor(private readonly campanhasService: CampanhasService) {}

  @Get()
  async findAll(@CurrentTenant() tenantId: string) {
    return this.campanhasService.findAll(tenantId);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @Body() body: CreateCampanhaDto,
  ) {
    return this.campanhasService.create(tenantId, body);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.findOne(tenantId, id);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateCampanhaDto,
  ) {
    return this.campanhasService.update(tenantId, id, body);
  }

  @Delete(':id')
  async delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.delete(tenantId, id);
  }

  @Post(':id/gerar-plano')
  async gerarPlano(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.gerarPlano90Dias(tenantId, id);
  }

  // --- Fases ---
  @Get(':id/fases')
  async getFases(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.getFases(tenantId, id);
  }

  // --- Tarefas ---
  @Get(':id/tarefas')
  async getTarefas(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.getTarefas(tenantId, id);
  }

  @Post(':id/tarefas')
  async createTarefa(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: CreateTarefaDto,
  ) {
    return this.campanhasService.createTarefa(tenantId, id, body);
  }

  @Put('tarefas/:id')
  async updateTarefa(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateTarefaDto,
  ) {
    return this.campanhasService.updateTarefa(tenantId, id, body);
  }

  @Delete('tarefas/:id')
  async deleteTarefa(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.deleteTarefa(tenantId, id);
  }

  // --- Metas ---
  @Get(':id/metas')
  async getMetas(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.getMetas(tenantId, id);
  }

  @Post(':id/metas')
  async createMeta(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: CreateMetaDto,
  ) {
    return this.campanhasService.createMeta(tenantId, id, body);
  }

  @Put('metas/:id')
  async updateMeta(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateMetaDto,
  ) {
    return this.campanhasService.updateMeta(tenantId, id, body);
  }

  @Delete('metas/:id')
  async deleteMeta(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.deleteMeta(tenantId, id);
  }

  // --- Semanas ---
  @Get(':id/semanas')
  async getSemanas(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.getSemanas(tenantId, id);
  }

  @Post(':id/semanas')
  async createSemana(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: CreateSemanaDto,
  ) {
    return this.campanhasService.createSemana(tenantId, id, body);
  }

  @Put('semanas/:id')
  async updateSemana(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Body() body: UpdateSemanaDto,
  ) {
    return this.campanhasService.updateSemana(tenantId, id, body);
  }

  @Delete('semanas/:id')
  async deleteSemana(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.campanhasService.deleteSemana(tenantId, id);
  }
}
