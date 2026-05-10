import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { DemandasService } from './demandas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('demandas')
export class DemandasController {
  constructor(private readonly demandasService: DemandasService) {}

  @Get()
  findAll() {
    return this.demandasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demandasService.findOne(id);
  }

  @Post()
  create(@Body() data: any, @Request() req: any) {
    return this.demandasService.create(data, req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.demandasService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.demandasService.delete(id);
  }
}
