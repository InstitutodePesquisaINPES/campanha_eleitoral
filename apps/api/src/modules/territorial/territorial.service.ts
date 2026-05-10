import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TerritorialService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- ESTADOS ----
  async getEstados() {
    return this.prisma.estado.findMany({ orderBy: { nome: 'asc' } });
  }

  // ---- MUNICIPIOS ----
  async getMunicipios(estadoId?: string) {
    return this.prisma.municipio.findMany({
      where: estadoId ? { estadoId } : undefined,
      include: { estado: { select: { nome: true, sigla: true } } },
      orderBy: { nome: 'asc' },
    });
  }
  
  async createMunicipio(data: any) {
    return this.prisma.municipio.create({ data });
  }

  async updateMunicipio(id: string, data: any) {
    return this.prisma.municipio.update({ where: { id }, data });
  }

  async deleteMunicipio(id: string) {
    return this.prisma.municipio.delete({ where: { id } });
  }

  // ---- BAIRROS ----
  async getBairros(municipioId?: string) {
    return this.prisma.bairro.findMany({
      where: municipioId ? { municipioId } : undefined,
      include: { 
        municipio: { select: { nome: true } },
        distrito: { select: { nome: true } } 
      },
      orderBy: { nome: 'asc' },
    });
  }

  async createBairro(data: any) {
    return this.prisma.bairro.create({ data });
  }

  async updateBairro(id: string, data: any) {
    return this.prisma.bairro.update({ where: { id }, data });
  }

  async deleteBairro(id: string) {
    return this.prisma.bairro.delete({ where: { id } });
  }

  // ---- ZONAS ----
  async getZonasEleitorais(municipioId?: string) {
    return this.prisma.zonaEleitoral.findMany({
      where: municipioId ? { municipioId } : undefined,
      include: { municipio: { select: { nome: true } } },
      orderBy: { numeroZona: 'asc' },
    });
  }

  async createZona(data: any) {
    return this.prisma.zonaEleitoral.create({ data });
  }

  async deleteZona(id: string) {
    return this.prisma.zonaEleitoral.delete({ where: { id } });
  }

  // ---- SECOES ----
  async getSecoesEleitorais(zonaId?: string) {
    return this.prisma.secaoEleitoral.findMany({
      where: zonaId ? { zonaId } : undefined,
      include: { 
        zona: { 
          select: { 
            numeroZona: true, 
            municipio: { select: { nome: true } } 
          } 
        } 
      },
      orderBy: { numeroSecao: 'asc' },
    });
  }

  async createSecao(data: any) {
    return this.prisma.secaoEleitoral.create({ data });
  }

  async deleteSecao(id: string) {
    return this.prisma.secaoEleitoral.delete({ where: { id } });
  }

  // ---- DISTRITOS ----
  async getDistritos(municipioId?: string) {
    return this.prisma.distrito.findMany({
      where: municipioId ? { municipioId } : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  // ---- COMUNIDADES ----
  async getComunidades(bairroId?: string) {
    return this.prisma.comunidade.findMany({
      where: bairroId ? { bairroId } : undefined,
      include: { bairro: { select: { nome: true } } },
      orderBy: { nome: 'asc' },
    });
  }

  // Areas de Atuacao mocked until model is added
  async getAreasAtuacao(municipioId?: string) { return []; }
  async createAreaAtuacao(data: any) { return {}; }
  async deleteAreaAtuacao(id: string) { return {}; }
}
