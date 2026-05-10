import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pessoas')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('nivel') nivel?: string,
  ) {
    return this.crmService.findAll(search, nivel);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.crmService.findOne(id);
  }

  @Post()
  create(@Body() data: any, @Request() req: any) {
    return this.crmService.create(data, req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.crmService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.crmService.delete(id);
  }
}
