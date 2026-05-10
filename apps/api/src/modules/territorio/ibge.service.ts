import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface IbgeEstado {
  id: number;
  sigla: string;
  nome: string;
}

interface IbgeMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: IbgeEstado;
    };
  };
}

@Injectable()
export class IbgeService {
  private readonly logger = new Logger(IbgeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sincroniza Estados e Municipios com o IBGE.
   * Utiliza a API pública de localidades.
   */
  async syncIbgeTerritories() {
    this.logger.log('Iniciando sincronização com a API do IBGE...');

    try {
      // 1. Sincronizar Estados
      const resEstados = await fetch(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
      );
      if (!resEstados.ok) throw new Error('Falha ao buscar estados do IBGE');
      const estados: IbgeEstado[] = (await resEstados.json()) as IbgeEstado[];

      const estadosMapeados = estados.map((est) => ({
        nome: est.nome,
        sigla: est.sigla,
        geocodigoIbge: est.id.toString(),
      }));

      // Inserir estados que não existem usando skipDuplicates (se a key for sigla)
      for (const est of estadosMapeados) {
        await this.prisma.estado.upsert({
          where: { sigla: est.sigla },
          update: { geocodigoIbge: est.geocodigoIbge, nome: est.nome },
          create: est,
        });
      }
      this.logger.log(`Foram processados ${estados.length} Estados.`);

      // Recupera o dicionário de Estados por sigla para associar aos municípios
      const dbEstados = await this.prisma.estado.findMany();
      const estadoMap = new Map(dbEstados.map((e) => [e.sigla, e.id]));

      // 2. Sincronizar Municípios
      const resMunicipios = await fetch(
        'https://servicodados.ibge.gov.br/api/v1/localidades/municipios',
      );
      if (!resMunicipios.ok)
        throw new Error('Falha ao buscar municípios do IBGE');
      const municipios: IbgeMunicipio[] =
        (await resMunicipios.json()) as IbgeMunicipio[];

      let countMunicipiosCriados = 0;

      for (const mun of municipios) {
        const estadoSigla = mun.microrregiao.mesorregiao.UF.sigla;
        const estadoId = estadoMap.get(estadoSigla);
        if (!estadoId) continue;

        const geocodigo = mun.id.toString();

        const existe = await this.prisma.municipio.findUnique({
          where: { geocodigoIbge: geocodigo },
          select: { id: true },
        });

        if (!existe) {
          await this.prisma.municipio.create({
            data: {
              nome: mun.nome,
              estadoId: estadoId,
              geocodigoIbge: geocodigo,
            },
          });
          countMunicipiosCriados++;
        }
      }

      this.logger.log(
        `Sincronização concluída. ${countMunicipiosCriados} novos municípios cadastrados.`,
      );
      return {
        success: true,
        countMunicipiosCriados,
        estadosAtualizados: estados.length,
      };
    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error('Erro na sincronização IBGE', err.message);
      throw new Error('Falha na integração com IBGE: ' + err.message);
    }
  }
}
