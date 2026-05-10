import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ComunicacaoService } from './comunicacao.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comunicacao')
export class ComunicacaoController {
  constructor(private readonly comunicacaoService: ComunicacaoService) {}

  @Post('enviar/massa')
  enviarEmMassa(@Body('campanhaId') campanhaId: string) {
    return this.comunicacaoService.enviarEmMassa(campanhaId);
  }

  @Post('enviar/individual')
  disparoIndividual(
    @Body('pessoaId') pessoaId: string,
    @Body('mensagem') mensagem: string,
    @Body('tipo') tipo: string
  ) {
    return this.comunicacaoService.disparoIndividual(pessoaId, mensagem, tipo);
  }
}
