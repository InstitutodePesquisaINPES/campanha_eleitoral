import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

@Injectable()
export class ViaCepService {
  private readonly logger = new Logger(ViaCepService.name);

  constructor(private readonly prisma: PrismaService) {}

  async consultaCep(cepRaw: string) {
    const cep = cepRaw.replace(/\D/g, '');
    if (cep.length !== 8) {
      throw new Error('CEP inválido');
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('Falha na requisição ao ViaCEP');
      
      const data: ViaCepResponse = await response.json() as ViaCepResponse;
      
      if (data.erro) {
        throw new NotFoundException('CEP não encontrado');
      }

      // Garante que o Estado existe
      let estado = await this.prisma.estado.findUnique({
        where: { sigla: data.uf }
      });

      if (!estado) {
        estado = await this.prisma.estado.create({
          data: {
            nome: data.uf, // ViaCEP não retorna nome do estado, apenas UF
            sigla: data.uf,
          }
        });
      }

      // Garante que o Município existe
      let municipio = await this.prisma.municipio.findUnique({
        where: { geocodigoIbge: data.ibge }
      });

      if (!municipio) {
        municipio = await this.prisma.municipio.create({
          data: {
            nome: data.localidade,
            estadoId: estado.id,
            geocodigoIbge: data.ibge,
          }
        });
      }

      // Garante que o Bairro existe (se viaCEP retornou bairro)
      let bairro = null;
      if (data.bairro) {
        bairro = await this.prisma.bairro.findFirst({
          where: {
            nome: {
              equals: data.bairro,
              mode: 'insensitive' // Busca ignorando case
            },
            municipioId: municipio.id
          }
        });

        if (!bairro) {
          bairro = await this.prisma.bairro.create({
            data: {
              nome: data.bairro,
              municipioId: municipio.id,
            }
          });
        }
      }

      // Retorna os dados combinados
      return {
        cep: data.cep,
        logradouro: data.logradouro,
        complemento: data.complemento,
        bairro: bairro ? { id: bairro.id, nome: bairro.nome } : null,
        municipio: { id: municipio.id, nome: municipio.nome, geocodigoIbge: municipio.geocodigoIbge },
        estado: { id: estado.id, sigla: estado.sigla, nome: estado.nome },
      };

    } catch (error: unknown) {
      const err = error as Error;
      this.logger.error(`Erro ao consultar CEP ${cep}:`, err.message);
      if (err instanceof NotFoundException) throw err;
      throw new Error('Falha ao consultar CEP: ' + err.message);
    }
  }
}
