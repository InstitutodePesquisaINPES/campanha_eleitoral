import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTagDto } from './dto/admin.dto';
import { AppRole } from '@prisma/client';

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

  async createTag(tenantId: string, data: CreateTagDto) {
    return this.prisma.tag.create({
      data: { ...data, tenantId },
    });
  }

  async removeTag(tenantId: string, id: string) {
    return this.prisma.tag.delete({
      where: { id, tenantId },
    });
  }

  async addRole(tenantId: string, userId: string, role: AppRole) {
    return this.prisma.userRole.create({
      data: { userId, role, tenantId },
    });
  }

  async removeRole(tenantId: string, userId: string, role: AppRole) {
    return this.prisma.userRole.deleteMany({
      where: { userId, role, tenantId },
    });
  }
}
