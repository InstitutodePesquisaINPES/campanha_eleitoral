import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  findAll() {
    return this.agendaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendaService.findOne(id);
  }

  @Post()
  create(@Body() data: any, @Request() req: any) {
    return this.agendaService.create(data, req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.agendaService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agendaService.delete(id);
  }
}
