import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TerritorialService } from './territorial.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('territorial')
export class TerritorialController {
  constructor(private readonly territorialService: TerritorialService) {}

  @Get('estados')
  getEstados() {
    return this.territorialService.getEstados();
  }

  @Get('municipios')
  getMunicipios(@Query('estadoId') estadoId?: string) {
    return this.territorialService.getMunicipios(estadoId);
  }

  @Get('bairros')
  getBairros(@Query('municipioId') municipioId: string) {
    return this.territorialService.getBairros(municipioId);
  }

  @Get('zonas')
  getZonasEleitorais(@Query('municipioId') municipioId: string) {
    return this.territorialService.getZonasEleitorais(municipioId);
  }

  @Get('secoes')
  getSecoesEleitorais(@Query('zonaId') zonaId: string) {
    return this.territorialService.getSecoesEleitorais(zonaId);
  }
}
