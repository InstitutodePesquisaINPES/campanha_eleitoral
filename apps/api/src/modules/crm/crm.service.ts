import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- PESSOAS ----
  async findAll(search?: string, nivel?: string, tipo?: string) {
    return this.prisma.pessoa.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { cpf: { contains: search } },
              { cnpj: { contains: search } },
            ]
          } : {},
          nivel && nivel !== 'all' ? { nivelRelacionamento: nivel } : {},
          tipo && tipo !== 'all' ? { tipoPessoa: tipo } : {},
        ],
      },
      include: {
        papeis: true,
        contatos: true,
        tags: { include: { tag: true } },
      },
      orderBy: { fullName: 'asc' },
      take: 500,
    });
  }

  async findOne(id: string) {
    const pessoa = await this.prisma.pessoa.findUnique({
      where: { id },
      include: {
        papeis: true,
        contatos: true,
        enderecos: true,
        tags: { include: { tag: true } },
      }
    });
    if (!pessoa) throw new NotFoundException(`Pessoa not found`);
    return pessoa;
  }

  async create(data: any, userId: string) {
    return this.prisma.pessoa.create({
      data: { ...data, createdBy: userId },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.pessoa.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.pessoa.delete({ where: { id } });
  }

  // ---- CONTATOS ----
  async getContatos(pessoaId: string) {
    return this.prisma.pessoaContato.findMany({ where: { pessoaId } });
  }

  async createContato(data: any) {
    return this.prisma.pessoaContato.create({ data });
  }

  async deleteContato(id: string) {
    return this.prisma.pessoaContato.delete({ where: { id } });
  }

  // ---- ENDEREÇOS ----
  async getEnderecos(pessoaId: string) {
    return this.prisma.pessoaEndereco.findMany({ where: { pessoaId } });
  }

  async createEndereco(data: any) {
    return this.prisma.pessoaEndereco.create({ data });
  }

  async deleteEndereco(id: string) {
    return this.prisma.pessoaEndereco.delete({ where: { id } });
  }

  // ---- PAPEIS ----
  async getPapeis(pessoaId: string) {
    return this.prisma.pessoaPapel.findMany({ where: { pessoaId } });
  }

  async createPapel(data: any) {
    return this.prisma.pessoaPapel.create({ data });
  }

  async deletePapel(id: string) {
    return this.prisma.pessoaPapel.delete({ where: { id } });
  }

  // ---- TAGS ----
  async getTags() {
    return this.prisma.tag.findMany({ orderBy: { nome: 'asc' } });
  }

  async createTag(data: any) {
    return this.prisma.tag.create({ data });
  }

  async addPessoaTag(pessoaId: string, tagId: string) {
    return this.prisma.pessoaTag.create({ data: { pessoaId, tagId } });
  }

  async removePessoaTag(pessoaId: string, tagId: string) {
    return this.prisma.pessoaTag.delete({
      where: { pessoaId_tagId: { pessoaId, tagId } }
    });
  }
}
