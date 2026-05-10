import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getAuditLogs(
    tenantId: string,
    action: string,
    table: string,
    page: number,
  ) {
    const pageSize = 50;
    const skip = page * pageSize;

    return this.prisma.auditLog.findMany({
      where: {
        tenantId,
        ...(action !== 'all' && { action }),
        ...(table && { tableName: { contains: table, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });
  }

  async getUsers(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      include: {
        roles: true,
      },
    });
  }

  async getTags(tenantId: string) {
    return this.prisma.tag.findMany({
      where: { tenantId },
      orderBy: { nome: 'asc' },
    });
  }

  async createTag(tenantId: string, data: any) {
    return this.prisma.tag.create({
      data: { ...data, tenantId },
    });
  }

  async removeTag(tenantId: string, id: string) {
    return this.prisma.tag.delete({
      where: { id, tenantId },
    });
  }

  async addRole(tenantId: string, userId: string, role: string) {
    return this.prisma.userRole.create({
      data: { userId, role: role as any, tenantId },
    });
  }

  async removeRole(tenantId: string, userId: string, role: string) {
    return this.prisma.userRole.deleteMany({
      where: { userId, role: role as any, tenantId },
    });
  }
}
