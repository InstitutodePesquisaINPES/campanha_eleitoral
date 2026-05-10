import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista todos os tenants (apenas super-admin) */
  findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /** Cria um novo Tenant/Workspace (nova campanha/cliente) */
  async create(name: string, slug: string) {
    const exists = await this.prisma.tenant.findUnique({ where: { slug } });
    if (exists) throw new ConflictException(`Slug "${slug}" já está em uso.`);

    return this.prisma.tenant.create({
      data: { name, slug },
    });
  }

  /** Obtém um Tenant por ID */
  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return tenant;
  }

  /** Atualiza nome ou status de um Tenant */
  async update(id: string, data: Partial<{ name: string; active: boolean }>) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data });
  }

  /** Remove (soft-delete via active=false) um Tenant */
  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.update({
      where: { id },
      data: { active: false },
    });
  }
}
