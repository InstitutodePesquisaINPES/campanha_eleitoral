import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { CrmService } from './crm.service';
import { SegmentacaoService } from './segmentacao.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pessoas')
export class CrmController {
  constructor(
    private readonly crmService: CrmService,
    private readonly segmentacaoService: SegmentacaoService
  ) {}

  @Post('segmentacao')
  gerarSegmentacao(@Body() filtros: any) {
    return this.segmentacaoService.gerarAudiencia(filtros);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('nivel') nivel?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.crmService.findAll(search, nivel, tipo);
  }

  @Get('tags')
  getTags() {
    return this.crmService.getTags();
  }

  @Post('tags')
  createTag(@Body() data: any) {
    return this.crmService.createTag(data);
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

  // ---- CONTATOS ----
  @Get(':id/contatos')
  getContatos(@Param('id') id: string) {
    return this.crmService.getContatos(id);
  }

  @Post(':id/contatos')
  createContato(@Param('id') id: string, @Body() data: any) {
    return this.crmService.createContato({ ...data, pessoaId: id });
  }

  @Delete('contatos/:contatoId')
  deleteContato(@Param('contatoId') contatoId: string) {
    return this.crmService.deleteContato(contatoId);
  }

  // ---- ENDEREÇOS ----
  @Get(':id/enderecos')
  getEnderecos(@Param('id') id: string) {
    return this.crmService.getEnderecos(id);
  }

  @Post(':id/enderecos')
  createEndereco(@Param('id') id: string, @Body() data: any) {
    return this.crmService.createEndereco({ ...data, pessoaId: id });
  }

  @Delete('enderecos/:enderecoId')
  deleteEndereco(@Param('enderecoId') enderecoId: string) {
    return this.crmService.deleteEndereco(enderecoId);
  }

  // ---- PAPEIS ----
  @Get(':id/papeis')
  getPapeis(@Param('id') id: string) {
    return this.crmService.getPapeis(id);
  }

  @Post(':id/papeis')
  createPapel(@Param('id') id: string, @Body() data: any) {
    return this.crmService.createPapel({ ...data, pessoaId: id });
  }

  @Delete('papeis/:papelId')
  deletePapel(@Param('papelId') papelId: string) {
    return this.crmService.deletePapel(papelId);
  }

  // ---- PESSOAS_TAGS ----
  @Post(':id/tags/:tagId')
  addPessoaTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.crmService.addPessoaTag(id, tagId);
  }

  @Delete(':id/tags/:tagId')
  removePessoaTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.crmService.removePessoaTag(id, tagId);
  }
}
