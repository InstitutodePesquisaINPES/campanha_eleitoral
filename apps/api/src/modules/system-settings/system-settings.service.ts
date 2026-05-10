import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna todas as configurações de um Tenant.
   */
  async findAll(tenantId: string) {
    return this.prisma.systemSetting.findMany({
      where: { tenantId },
      select: {
        key: true,
        value: true,
      },
    });
  }

  /**
   * Atualiza ou cria configurações (Upsert em massa)
   */
  async updateMany(
    tenantId: string,
    settings: Record<string, any>,
    userId: string,
  ) {
    const promises = Object.entries(settings).map(async ([key, value]) => {
      // Usamos JSON.stringify no valor se for objeto, mas se já for string podemos converter depois
      // O Prisma espera JSON.
      return this.prisma.systemSetting.upsert({
        where: {
          tenantId_key: {
            tenantId,
            key,
          },
        },
        create: {
          tenantId,
          key,
          value,
          updatedBy: userId,
        },
        update: {
          value,
          updatedBy: userId,
        },
      });
    });

    await Promise.all(promises);
    return { success: true };
  }
}
