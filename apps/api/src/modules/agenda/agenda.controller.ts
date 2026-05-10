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
import { AgendaService } from './agenda.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import {
  CurrentTenant,
  CurrentUser,
} from '../../common/decorators/tenant.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  findAll(@Query('month') month: string, @CurrentTenant() tenantId: string) {
    return this.agendaService.findAll(month, tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.agendaService.findOne(id, tenantId);
  }

  @Post()
  create(
    @Body() data: any,
    @CurrentUser() userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.agendaService.create(data, userId, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentTenant() tenantId: string,
  ) {
    return this.agendaService.update(id, data, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.agendaService.delete(id, tenantId);
  }

  // ---- PARTICIPANTES ----
  @Get(':id/participantes')
  getParticipantes(@Param('id') id: string) {
    return this.agendaService.getParticipantes(id);
  }

  @Post(':id/participantes')
  createParticipante(@Param('id') id: string, @Body() data: any) {
    return this.agendaService.createParticipante({ ...data, agendaId: id });
  }

  @Patch('participantes/:participanteId')
  updateParticipante(
    @Param('participanteId') participanteId: string,
    @Body() data: any,
  ) {
    return this.agendaService.updateParticipante(participanteId, data);
  }

  @Delete('participantes/:participanteId')
  deleteParticipante(@Param('participanteId') participanteId: string) {
    return this.agendaService.deleteParticipante(participanteId);
  }

  // ---- CHECKINS ----
  @Get(':id/checkins')
  getCheckins(@Param('id') id: string) {
    return this.agendaService.getCheckins(id);
  }

  @Post(':id/checkins')
  createCheckin(
    @Param('id') id: string,
    @Body() data: any,
    @CurrentUser() userId: string,
  ) {
    return this.agendaService.createCheckin({ ...data, agendaId: id }, userId);
  }

  // ---- FOLLOWUPS ----
  @Get(':id/followups')
  getFollowups(@Param('id') id: string) {
    return this.agendaService.getFollowups(id);
  }

  @Post(':id/followups')
  createFollowup(@Param('id') id: string, @Body() data: any) {
    return this.agendaService.createFollowup({ ...data, agendaId: id });
  }

  @Patch('followups/:followupId')
  updateFollowup(@Param('followupId') followupId: string, @Body() data: any) {
    return this.agendaService.updateFollowup(followupId, data);
  }
}
