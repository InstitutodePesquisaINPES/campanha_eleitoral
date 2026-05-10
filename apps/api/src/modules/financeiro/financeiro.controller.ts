import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Get('despesas')
  findAllDespesas() {
    return this.financeiroService.findAllDespesas();
  }

  @Post('despesas')
  createDespesa(@Body() data: any) {
    return this.financeiroService.createDespesa(data);
  }

  @Patch('despesas/:id')
  updateDespesa(@Param('id') id: string, @Body() data: any) {
    return this.financeiroService.updateDespesa(id, data);
  }

  @Delete('despesas/:id')
  removeDespesa(@Param('id') id: string) {
    return this.financeiroService.deleteDespesa(id);
  }

  @Get('receitas')
  findAllReceitas() {
    return this.financeiroService.findAllReceitas();
  }

  @Post('receitas')
  createReceita(@Body() data: any) {
    return this.financeiroService.createReceita(data);
  }

  @Delete('receitas/:id')
  removeReceita(@Param('id') id: string) {
    return this.financeiroService.deleteReceita(id);
  }
}
